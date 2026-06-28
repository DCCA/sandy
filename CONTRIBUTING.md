# Contributing to Sandy

Thanks for your interest in improving Sandy. This guide covers the workflow and
the quality bar.

## Getting started

```bash
npm ci          # install dependencies
npm run dev     # start the dev server at http://localhost:3000/sandbox
```

## The development loop

Every change follows this loop (see `CLAUDE.md` for the full version):

1. **Implement** one logical unit of work.
2. **Build** — `npm run build`.
3. **Lint** — `npm run lint`.
4. **Typecheck** — `npm run typecheck`.
5. **Test** — `npm run test` (unit) and, for UI flows, `npm run e2e`.
6. **Commit** — conventional commit; pre-commit hooks run automatically.

`npm run validate` runs typecheck + lint as a fast pre-flight.

## Testing

- **Unit / component:** Vitest + Testing Library in `__tests__/`.
  - Run all: `npm run test`
  - Single file: `npx vitest run __tests__/sandbox/validate.test.ts`
  - Single test: `npx vitest run -t "applies a simple string binding"`
  - Coverage: `npm run test:coverage`
  - Accessibility is asserted with `jest-axe` (`__tests__/registry/a11y.test.tsx`).
- **End-to-end:** Playwright specs in `e2e/`. Run with `npm run e2e`.

## Adding a component

A new registry component requires four things:

1. Component implementation in `components/registry/`.
2. Zod schema in `lib/schemas/`.
3. Example/template payload.
4. Registry entry in `lib/registry/index.ts`.

Components must:

- Render only through the registry (no arbitrary JSON → JSX).
- Use inline styles referencing `--sandy-*` CSS variables for theming.
- Be accessible (labels, roles, alt text) and responsive (no fixed-column
  overflow at ~320px). The a11y test suite enforces the baseline.

## Commit messages

Conventional Commits, validated by commitlint:

`<type>: <description>` — types: `feat`, `fix`, `refactor`, `docs`, `chore`,
`style`, `perf`, `build`, `ci`, `test`.

Do not bypass hooks with `--no-verify`.

## Safety constraints

- No `eval` or dynamic code execution from JSON.
- No function props defined in JSON.
- No arbitrary HTML injection (`dangerouslySetInnerHTML`).
- URLs are validated by `safeHref` (no `javascript:`/`data:`/`vbscript:`).
