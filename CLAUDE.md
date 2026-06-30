# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JSON Component Sandbox — a Next.js web app where users input validated JSON on the left and see live rendered UI components on the right, with multi-brand theming via a controlled component registry.

## Tech Stack

- **Framework:** Next.js 16 App Router + TypeScript
- **Validation:** Zod 4 (envelope + per-component schemas)
- **Editor:** Monaco Editor (`@monaco-editor/react`)
- **Styling:** Tailwind CSS 4 (CSS-based config in `globals.css`, not `tailwind.config.ts`) + CSS variables for theming
- **UI primitives:** shadcn/ui (base-ui based, not Radix — Select `onValueChange` passes `string | null`)
- **State:** URL state + local component state
- **Error isolation:** react-error-boundary v6 (error type is `unknown`, not `Error`)
- **Testing:** Vitest + Testing Library (unit), jest-axe (a11y), Playwright (e2e)
- **AI generation:** drives the Claude Code CLI (`claude -p`) server-side; no metered API key
- **Deployment:** Vercel

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (includes type checking)
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type check (no emit)
npm run validate     # Typecheck + lint (fast pre-flight)

npm test             # Run unit/a11y tests once (Vitest)
npm run test:watch   # Vitest watch mode
npm run test:coverage # Vitest with V8 coverage
npx vitest run __tests__/theme/dtcg.test.ts   # Run a single test file
npx vitest run -t "merges tokens"             # Run tests matching a name

npm run e2e          # Playwright e2e (auto-starts dev server)
npm run e2e:report   # Open the last Playwright HTML report
npm run format       # Prettier write
```

`npm run validate` is the fast gate. The full Definition-of-Done gate is `npm test && npm run build && npm run lint` (e2e is the slow extra layer for runtime/race-sensitive work).

## Development Workflow

### The Loop

Every change follows this loop. Do not skip steps.

1. **Implement** — Write the code for one logical unit of work
2. **Build** — Run `npm run build`. Fix any errors before proceeding
3. **Lint** — Run `npm run lint`. Fix any errors before proceeding
4. **Review** — Re-read changed files for correctness, patterns, edge cases
5. **Fix** — Address review findings. If non-trivial, go back to step 2
6. **Commit** — Conventional commit. Pre-commit hooks run automatically

### Logical Units

A logical unit is the smallest coherent set of changes:
- One new component + its schema + registry entry
- One bug fix (however many files)
- One refactor or config change

Do NOT accumulate multiple units into one commit.

### Commit Rules

- **Always commit after completing a logical unit.** Do not accumulate uncommitted work.
- **Never wait to be asked to commit.** When a unit is done and verified, commit immediately.
- **Commit before starting the next unit.** Do not begin new work with uncommitted changes.
- **Run `npm run build && npm run lint` before committing.** Hooks enforce lint + typecheck, but run build manually too.
- **Do not bypass hooks** with `--no-verify`.

### Pre-commit Hooks

These run automatically on `git commit`:
- **lint-staged**: ESLint `--fix` on staged `.ts`/`.tsx`/`.js`/`.mjs` files
- **tsc --noEmit**: Full project type check
- **commitlint**: Validates conventional commit format

### Commit Message Format

`<type>: <description>` — types: feat, fix, refactor, docs, chore, style, perf, build, ci, test

## Architecture

### Rendering Pipeline

JSON input → parse → validate **Page** (Zod) → for each section: resolve component from registry → validate props against component schema → resolve theme tokens to CSS variables → render inside error boundary.

**Critical rule:** No code path where arbitrary JSON becomes arbitrary JSX. Only this pattern is allowed:
1. `getRegistryItem(componentKey)` — lookup (covers built-ins **and** user composites)
2. `schema.parse(props)` — validation
3. `<RegisteredComponent {...validatedProps} />` — render

This gate is enforced once in `lib/sandbox/validate.ts` (`validatePage`) and reused everywhere: the editor, the URL deserializer, AND the AI generator all route through it. Never add a second render path that skips it.

### Data Model — Canonical Page (`version "2.0"`)

The canonical sandbox input is a **Page**: an ordered list of sections, each one a
`{ id, component, props }` triple. This is what the editor, URL state, and AI
generator all produce. Schemas live in `lib/schemas/envelope.ts` (`PageSchema`,
`SectionSchema`).

```json
{
  "version": "2.0",
  "theme": { "brand": "default", "mode": "light" },
  "meta": { "viewport": "mobile", "locale": "en-US" },
  "sections": [
    {
      "id": "sec_1",
      "component": "HeroBanner",
      "props": { "title": "Welcome back" }
    }
  ]
}
```

The single-component `Envelope` (`component`/`version "1.0"`/`slots`) still exists
in `envelope.ts` as the legacy shape; new work targets `Page`. `defaultPage()` in
`lib/registry/index.ts` is the seed payload.

### Component Registry

Components are keyed by stable IDs. Each registry entry contains: React component,
Zod schema, example **Section** payload, and metadata. There are two registries,
both reached via `getRegistryItem(key)` / `getRegistryKeys()`:

- **Built-in** (`lib/registry/index.ts`) — the static `registry` object.
- **Composite** (`lib/registry/composite-registry.ts`) — a *mutable runtime*
  registry of user-created components (see Composite Builder below).

Registry lookup is the **only** allowed render path for both.

### Theming

Token-based theming via `--sandy-*` CSS variables scoped to the preview container (not `document.documentElement`). Theme presets provide colors, typography, radius, spacing, and shadows. 3 built-in presets: Default, Acme Bank, Enterprise Dark. Registry components use inline styles referencing CSS vars (e.g., `var(--sandy-color-primary)`) rather than Tailwind theme classes.

Beyond presets, users can author **custom themes** in the token editor
(`components/sandbox/token-editor.tsx`), and tokens import/export as **DTCG**
(Design Tokens Community Group) JSON via `lib/theme/dtcg.ts`. `lib/theme/merge-tokens.ts`
deep-merges a partial custom theme over a base preset, and `lib/theme/css-vars.ts`
flattens the resolved token tree into the `--sandy-*` variables.

### Composite Component Builder

Users compose the built-in **primitives** (`heading`, `paragraph`, `button`, `image`,
`spacer`, `divider`, `container`, `badge` — see `lib/composite/primitives.ts`) into a
`CompositeDefinition`: a primitive node tree plus `propBindings` that expose specific
node fields as typed component props. `lib/composite/schema-gen.ts` derives a Zod
schema from those bindings, and `registerComposite()` adds the result to the runtime
registry so composites render through the same gate as built-ins. Definitions persist
via `lib/composite/storage.ts` and import/export via `lib/composite/io.ts`. UI lives in
`components/sandbox/component-builder.tsx` + the `builder-*` files; rendering in
`components/composite/` and `lib/composite/render.ts`.

### Generative UI (prompt → Page)

`POST /api/generate` turns a natural-language prompt into a validated Page.
`lib/ai/generate-envelope.ts` builds a component catalog from the live registry's Zod
schemas, spawns the **Claude Code CLI** (`claude -p --output-format json --json-schema ...`)
to emit JSON, then re-validates it through `validatePage` — generation produces **data
only**, never bypassing the render gate. Key constraints:

- **Node runtime only** (`runtime = "nodejs"`); it spawns a subprocess.
- **Local-only / subscription auth** — uses the developer's Claude login or
  `CLAUDE_CODE_OAUTH_TOKEN`, no metered API key. Unavailable on a deployed Vercel build
  (no `claude` binary). The `GET` handler is a capability probe so the UI can hide the action.
- The prompt is passed after `--` (positional) to prevent argument injection; the CLI
  runs in `tmpdir()` so the host repo's `.claude` config/hooks don't apply.

### Export

`lib/export/` serializes the current Page to **JSON**, standalone **HTML**, or a **React**
component (`json.ts` / `html.ts` / `react.ts`), surfaced by
`components/sandbox/export-panel.tsx`.

### App Shell

Dark mode permanently on (`<html className="dark">`). The app shell (toolbar, editor, error panel) uses shadcn dark theme. The preview pane is independently themed via scoped `--sandy-*` CSS vars. Monaco Editor is loaded via `next/dynamic` with `ssr: false` for bundle optimization.

### Key Directories

- `app/sandbox/` — main sandbox page; `app/page.tsx` is the marketing/landing page
- `app/api/generate/` — AI generation route (Node runtime)
- `components/sandbox/` — editor, preview, toolbar, error/export/generate panels, token editor, component builder (`builder-*`)
- `components/registry/` — registered UI components
- `components/composite/` — composite + primitive renderers
- `components/ui/` — shadcn primitives
- `lib/registry/` — built-in + composite registries, templates, types
- `lib/composite/` — primitives, schema generation, render, storage, I/O, types
- `lib/schemas/` — Zod schemas (Page/envelope + per-component)
- `lib/theme/` — presets, CSS variable mapping, DTCG, merge, custom-theme schema
- `lib/sandbox/` — parse, validate (`validatePage`), URL serialize, undo/redo history
- `lib/ai/` — prompt-to-Page generation (Claude CLI driver)
- `lib/export/` — JSON / HTML / React exporters
- `__tests__/`, `e2e/` — Vitest unit/a11y tests and Playwright specs

## Adding a New Component

Requires 4 things:
1. Component implementation in `components/registry/`
2. Zod schema in `lib/schemas/` (export it from `lib/schemas/index.ts`)
3. Example payload as a **Section** (`{ id, component, props }`) — use the `section()` helper
4. Registry entry in `lib/registry/index.ts`

Cover it with a smoke test in `__tests__/registry/` (component-smoke + a11y run over the whole registry, so new entries are exercised automatically).

## Safety Constraints

- **No eval or dynamic code execution** from JSON
- **No function props** defined in JSON
- **No arbitrary HTML injection** — sanitize if rich text is needed
- **No arbitrary remote component loading**
- **Registry-only rendering** — strictly validated path
- **Error boundaries** isolate component crashes from the app shell
