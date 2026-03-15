# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JSON Component Sandbox — a Next.js web app where users input validated JSON on the left and see live rendered UI components on the right, with multi-brand theming via a controlled component registry.

## Tech Stack

- **Framework:** Next.js App Router + TypeScript
- **Validation:** Zod (envelope + per-component schemas)
- **Editor:** Monaco Editor
- **Styling:** Tailwind CSS + CSS variables for theming
- **UI primitives:** shadcn/ui
- **State:** URL state + local component state
- **Error isolation:** React Error Boundary
- **Deployment:** Vercel

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

## Architecture

### Rendering Pipeline

JSON input → parse → validate envelope (Zod) → resolve component from registry → validate props against component schema → resolve theme tokens to CSS variables → render inside error boundary.

**Critical rule:** No code path where arbitrary JSON becomes arbitrary JSX. Only this pattern is allowed:
1. `registry[componentKey]` — lookup
2. `schema.parse(props)` — validation
3. `<RegisteredComponent {...validatedProps} />` — render

### Data Model — Canonical Envelope

Every component render uses this envelope format:
```json
{
  "component": "HeroBanner",
  "version": "1.0",
  "props": { },
  "theme": { "brand": "default", "mode": "light" },
  "slots": {},
  "meta": { "viewport": "desktop", "locale": "en-US" }
}
```

### Component Registry

Components are keyed by stable IDs. Each registry entry contains: React component, Zod schema, example payload, and metadata. Registry lookup is the **only** allowed render path.

### Theming

Token-based theming via CSS variables. Theme presets provide colors, typography, radius, spacing, and shadows. At least 3 presets: Default, Acme Bank, Enterprise Dark.

### Key Directories

- `app/sandbox/` — main sandbox page
- `components/sandbox/` — editor, preview, toolbar, error panel
- `components/registry/` — registered UI components
- `lib/registry/` — registry system (index, types)
- `lib/schemas/` — Zod schemas (envelope + per-component)
- `lib/theme/` — theme presets, CSS variable mapping, types
- `lib/sandbox/` — parse, validate, URL serialize utilities

## Adding a New Component

Requires 4 things:
1. Component implementation in `components/registry/`
2. Zod schema in `lib/schemas/`
3. Example/template payload
4. Registry entry in `lib/registry/index.ts`

## Safety Constraints

- **No eval or dynamic code execution** from JSON
- **No function props** defined in JSON
- **No arbitrary HTML injection** — sanitize if rich text is needed
- **No arbitrary remote component loading**
- **Registry-only rendering** — strictly validated path
- **Error boundaries** isolate component crashes from the app shell
