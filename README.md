# Sandy

A schema-first, registry-constrained JSON sandbox for rendering branded mobile UI components. Input validated JSON on the left, see live rendered components on the right — with multi-brand theming via design tokens.

Built for designers and engineers who need a fast way to prototype, validate, and preview SDUI (Server-Driven UI) components without writing frontend code.

## Review first

If you are evaluating Sandy, start with:

1. **[Features](#features)** — what the sandbox proves about schema-first SDUI prototyping.
2. **[Architecture](#architecture)** — the constrained JSON → schema → registry → render pipeline.
3. **[Registered Components](#registered-components)** — the component surface available for branded mobile flows.
4. **[Commands](#commands)** — the deterministic checks used before sharing or deploying.

**Current proof:** validation, tests, and production build pass against the current tree; the renderer never turns arbitrary JSON into arbitrary JSX.

## Features

- **Live preview** — edit JSON, see components render instantly in a mobile device frame
- **Schema validation** — every component validates against a Zod contract with clear error messages
- **Component registry** — 21 registered components (banking, marketing, navigation, forms, and more)
- **46 design tokens** — colors, typography scale, spacing, radius, shadows, opacity, and borders
- **3 theme presets** — Default (Neon-inspired), Acme Bank, Enterprise Dark
- **Token editor** — tweak any design token in real-time and see components update
- **Page templates** — 6 pre-built page compositions (Banking Home, Full Banner, Bottom Sheet, etc.)
- **SVG icon system** — 15 Lucide-style line icons with emoji fallback
- **URL state sharing** — every sandbox state is serializable to a shareable URL
- **Safety by default** — no eval, no arbitrary JSX, registry-only rendering with error boundaries

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000/sandbox](http://localhost:3000/sandbox) to start.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (includes type checking)
npm run lint         # ESLint
npm run typecheck    # TypeScript type check
npm run validate     # Typecheck + lint
npm test             # Vitest component/schema tests
```

Verified against the current working tree on 2026-06-27: `npm run validate`, `npm test -- --run`, and `npm run build` pass locally; latest GitHub Actions `CI` run passed on `master`.

## Architecture

```
JSON input → parse → validate envelope (Zod) → resolve component from registry
→ validate props → resolve theme tokens to CSS variables → render inside error boundary
```

### Key Directories

```
app/sandbox/              Main sandbox page
components/registry/      21 registered UI components
components/sandbox/       Editor, preview, toolbar, token editor
lib/registry/             Registry system, types, templates
lib/schemas/              Zod schemas (envelope + per-component)
lib/theme/                Token types, presets, CSS variable mapping
lib/icons.tsx             SVG icon rendering utility
```

### Design Token System

46 CSS variables scoped to the preview container via `--sandy-*` prefix:

| Category   | Tokens | Examples                                                         |
| ---------- | ------ | ---------------------------------------------------------------- |
| Colors     | 13     | primary, secondary, success, warning, error, surface, overlay    |
| Typography | 15     | 6 font sizes, 3 line heights, 3 letter spacings, family, weights |
| Spacing    | 6      | xs (4px) through 2xl (48px)                                      |
| Radius     | 4      | sm, md, lg, full (999px)                                         |
| Shadows    | 3      | sm, md, lg                                                       |
| Opacity    | 3      | disabled, hover, overlay                                         |
| Borders    | 2      | thin (1px), thick (2px)                                          |

### Adding a New Component

1. Create schema in `lib/schemas/{name}.ts`
2. Create component in `components/registry/{name}.tsx`
3. Export from `lib/schemas/index.ts`
4. Add registry entry in `lib/registry/index.ts`

Components use inline styles with `var(--sandy-*)` CSS variables for theming. No Tailwind classes in registry components.

## Registered Components

| Component       | Description                                 |
| --------------- | ------------------------------------------- |
| HeroBanner      | Full-width hero with title, subtitle, CTA   |
| ProductCard     | Card with image, badge, description, action |
| PromoBanner     | Promotional banner with variant styling     |
| NoticeBox       | Alert box (info/warning/error/success)      |
| FeatureList     | Grid of features with icons                 |
| InputField      | Form input with label and validation        |
| CTAButtonGroup  | Row of action buttons                       |
| ModalPreview    | Modal dialog rendered inline                |
| PricingTable    | Tiered pricing comparison                   |
| Testimonial     | Customer quote with rating                  |
| StatsRow        | Key metrics grid                            |
| NavBar          | Navigation with logo and links              |
| Footer          | Multi-column footer                         |
| AvatarGroup     | Overlapping avatar stack                    |
| AccountHeader   | User greeting with avatar and actions       |
| BalanceCard     | Balance display with masking                |
| QuickActions    | Icon action button row                      |
| InfoCardGrid    | Two-column summary cards                    |
| TransactionList | Transaction history with icons              |
| BottomTabBar    | Bottom navigation tabs                      |
| BottomSheet     | Mobile bottom sheet overlay                 |

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Validation:** Zod 4
- **Editor:** Monaco Editor
- **Styling:** Tailwind CSS 4 + CSS variables for theming
- **UI primitives:** shadcn/ui
- **Deployment:** Vercel

## License

MIT
