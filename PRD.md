# PRD — JSON Component Sandbox for Multi-Brand Design Systems

## 1. Document control

- **Product name:** JSON Component Sandbox
- **Version:** v1
- **Status:** Draft for build
- **Primary audience:** LLM / engineers building the product
- **Goal of this document:** provide enough product and technical specificity for an LLM to generate the initial repo and MVP with minimal ambiguity

---

## 2. One-line product definition

A web app where users input validated JSON on the left and see live rendered UI components on the right, with support for multi-brand theming and company design-system adaptation through a controlled component registry.

---

## 3. Problem

Teams need a fast, safe way to prototype, validate, and preview UI components from structured JSON.

Today, most options fail in one of these ways:

1. They allow arbitrary JSON-to-React rendering, which is unsafe and hard to maintain.
2. They are too coupled to one internal design system.
3. They do not support multi-company branding cleanly.
4. They are too code-centric for fast iteration.
5. They do not expose a strong contract that an LLM can reliably generate against.

There is a gap for a schema-first sandbox where:

- JSON is constrained and validated
- rendering is safe and predictable
- components come from a controlled registry
- theming is token-based
- companies can bring their design system via adapters instead of forcing a full rewrite

---

## 4. Vision

Create the best sandbox for:

- prototyping JSON-driven UI
- validating component contracts
- previewing branded UI in real time
- giving LLMs a clear target format for generating UI configurations
- supporting enterprise customers that want their own visual identity without breaking the core rendering model

The product should feel like a mix of:

- playground
- schema validator
- design-system preview tool
- component contract tester

It is **not** a website builder, Figma replacement, or arbitrary React runtime.

---

## 5. Target users

### Primary users

- frontend engineers
- design-system engineers
- product designers working with component systems
- AI product builders generating UI from structured data

### Secondary users

- solution engineers onboarding enterprise customers
- platform teams managing component contracts
- internal teams experimenting with generative UI

---

## 6. Core use cases

### Use case 1 — component prototyping

A user selects a component, edits JSON props, and sees the result update live.

### Use case 2 — schema validation

A user pastes JSON and immediately sees whether the payload matches the component contract.

### Use case 3 — brand preview

A user switches from one company theme to another and sees the component restyled instantly.

### Use case 4 — LLM workflow

A user uses this app as the runtime target for LLM-generated JSON payloads.

### Use case 5 — design-system onboarding

A company brings colors, spacing, typography, and primitive overrides so components render in their brand.

---

## 7. Product principles

1. **Schema first** — every rendered component must validate against a contract.
2. **Registry only** — only registered components can render.
3. **Safe by default** — no arbitrary code execution from JSON.
4. **Token-driven branding** — support company styling primarily through design tokens.
5. **Typed all the way down** — validation and runtime behavior should align.
6. **LLM-friendly** — contracts must be explicit, stable, and easy for an LLM to generate.
7. **Incremental extensibility** — start with single-component rendering; do not begin with free-form page trees.

---

## 8. Product scope

## In scope for MVP

- JSON editor
- live preview pane
- component registry with 5–8 components
- runtime validation with clear errors
- theme/company selector
- token-based theming
- mobile/tablet/desktop preview toggle
- shareable permalink with serialized state
- starter examples/templates
- strict envelope format

## Out of scope for MVP

- arbitrary React rendering
- user-authored JavaScript in JSON
- full drag-and-drop page builder
- WYSIWYG editor
- full enterprise auth/admin console
- visual diffing platform
- complete component nesting/page composition
- company-uploaded custom code execution

---

## 9. MVP definition

The MVP should allow a user to:

1. Open the sandbox in browser.
2. Choose a component from a registry.
3. Load a starter JSON template for that component.
4. Edit the JSON in a Monaco editor.
5. See validation errors instantly.
6. See the rendered component in a live preview pane.
7. Switch between a few predefined company themes.
8. Toggle viewport size.
9. Copy/share the current state via URL.

---

## 10. Functional requirements

## 10.1 Layout

The app should have a two-panel layout:

- **Left panel:** JSON editor and controls
- **Right panel:** rendered preview

Optional supporting panels:

- validation/errors
- schema/contract view
- example selector
- resolved props inspector

## 10.2 Editor

The editor must:

- support JSON editing
- show syntax errors
- show validation errors separately from syntax errors
- support loading starter templates
- support formatting JSON
- optionally support autocomplete based on schema if feasible in MVP

## 10.3 Live preview

The preview must:

- update on valid JSON change
- fail gracefully on invalid JSON
- never crash the whole app due to component errors
- render inside a preview shell/frame
- support viewport switching

## 10.4 Component selection

Users must be able to select from a predefined list of components.

Initial components should include:

- HeroBanner
- ProductCard
- PromoBanner
- NoticeBox
- FeatureList
- InputField
- CTAButtonGroup
- ModalPreview

## 10.5 Validation

The system must validate:

- top-level envelope
- component existence in registry
- component props against schema
- theme payload shape if included
- slot payload shape if included

## 10.6 Theme switching

The user must be able to switch between at least 3 predefined themes, for example:

- Default
- Acme Bank
- Enterprise Dark

The selected theme must immediately affect preview styling.

## 10.7 URL state

The current sandbox state should be serializable to the URL or a shareable link mechanism so users can share the same config.

## 10.8 Example templates

Each component should have at least 1 starter payload template.

## 10.9 Error handling

Errors should be separated into:

- JSON parse error
- schema validation error
- render/runtime error

The UI should explain clearly what failed.

---

## 11. Non-functional requirements

### Performance

- preview updates should feel near real time
- typing should remain smooth for normal-sized payloads

### Reliability

- invalid payloads must not break the app shell
- broken components must be isolated via error boundaries

### Security

- JSON must never be treated as executable code
- no eval
- no function bodies from JSON
- no arbitrary HTML injection without sanitization
- no arbitrary remote component loading in MVP

### Maintainability

- each component contract must be versioned or version-ready
- schemas and components must live in a predictable structure

### Extensibility

- adding a new component should require:

  1. component implementation
  2. schema
  3. template/example
  4. registry entry

---

## 12. Core data model

The app should use a strict top-level envelope.

### Canonical envelope

```json
{
  "component": "HeroBanner",
  "version": "1.0",
  "props": {
    "title": "Welcome back",
    "subtitle": "Your credit options in one place",
    "cta": {
      "label": "See offers",
      "href": "/offers"
    }
  },
  "theme": {
    "brand": "default",
    "mode": "light"
  },
  "slots": {},
  "meta": {
    "viewport": "desktop",
    "locale": "en-US"
  }
}
```

### Envelope requirements

- `component`: required string, must match registry key
- `version`: required string
- `props`: required object, validated by component schema
- `theme`: optional but recommended
- `slots`: optional, structured only
- `meta`: optional

---

## 13. Component registry model

The renderer must only render components that exist in a controlled registry.

### Registry contract

```ts
export type RegistryItem = {
  component: React.ComponentType<any>;
  schema: ZodSchema<any>;
  example: unknown;
  metadata: {
    name: string;
    description?: string;
    supportsTheme?: boolean;
    supportsSlots?: boolean;
  };
};
```

### Registry rules

- components are keyed by stable IDs
- every component must have a schema
- every component must have at least one example
- registry lookup is the only allowed render path

---

## 14. Design system and theming model

This product should support companies bringing their design system without allowing arbitrary component execution in MVP.

## 14.1 Recommended approach

Start with **token-based theming**, not full company component injection.

That means companies provide:

- colors
- typography
- radius
- spacing
- shadows
- assets/logo

The app maps these into CSS variables and uses them in canonical components.

## 14.2 Company support levels

### Level 1 — Token theming (MVP)

Supported in MVP.

### Level 2 — Primitive overrides

Future phase. Companies can override primitives like Button, Text, Card, Input.

### Level 3 — Full component replacement

Not in MVP. High complexity. Avoid unless necessary.

## 14.3 Token contract

```json
{
  "color": {
    "background": "#ffffff",
    "foreground": "#111111",
    "primary": "#0055ff",
    "secondary": "#f4f6f8",
    "border": "#dcdcdc"
  },
  "radius": {
    "sm": 6,
    "md": 12,
    "lg": 20
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24
  },
  "typography": {
    "fontFamily": "Inter",
    "headingWeight": 700,
    "bodyWeight": 400
  },
  "shadow": {
    "sm": "0 1px 2px rgba(0,0,0,0.06)",
    "md": "0 4px 12px rgba(0,0,0,0.10)"
  }
}
```

---

## 15. UX requirements

## 15.1 Primary screen layout

### Left side

- component picker
- theme picker
- example/template dropdown
- Monaco JSON editor
- format/reset actions

### Right side

- preview frame
- viewport toggle: mobile / tablet / desktop
- light/dark if supported by theme
- optional background switch

### Supporting area

- validation status
- error details
- schema or prop reference

## 15.2 UX expectations

- instant feedback
- clear distinction between valid and invalid state
- easy way to recover to last valid template
- no hidden magic

---

## 16. Technical architecture

## 16.1 Recommended stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Validation:** Zod
- **Editor:** Monaco Editor
- **Styling:** Tailwind + CSS variables
- **UI shell:** shadcn/ui or equivalent primitives
- **State:** URL state + local component state
- **Error isolation:** React Error Boundary
- **Deployment:** Vercel

## 16.2 High-level architecture

1. User edits JSON.
2. App parses JSON.
3. App validates envelope.
4. App resolves component from registry.
5. App validates `props` using component schema.
6. App resolves theme tokens into CSS variables.
7. App renders preview inside safe boundary.
8. Errors are surfaced in dedicated UI.

## 16.3 Rendering rule

There must be no code path where arbitrary JSON becomes arbitrary JSX.

Only this pattern is allowed:

- `registry[componentKey]`
- `schema.parse(props)`
- `<RegisteredComponent {...validatedProps} />`

---

## 17. Suggested file structure

```text
app/
  sandbox/
    page.tsx
components/
  sandbox/
    editor.tsx
    preview.tsx
    toolbar.tsx
    error-panel.tsx
    schema-panel.tsx
  registry/
    hero-banner.tsx
    product-card.tsx
    promo-banner.tsx
    notice-box.tsx
    feature-list.tsx
lib/
  registry/
    index.ts
    types.ts
  schemas/
    envelope.ts
    hero-banner.ts
    product-card.ts
    promo-banner.ts
  theme/
    presets.ts
    css-vars.ts
    types.ts
  sandbox/
    parse.ts
    validate.ts
    serialize.ts
```

---

## 18. Reference implementation guidance

The build should take inspiration from these Vercel-side references:

- **`vercel-labs/json-render`** for schema-backed JSON-to-UI rendering patterns
- **`vercel/registry-starter`** for component registry structure and distribution ideas
- **`vercel/ai-elements`** for customizable component patterns and theming concepts

These should be treated as architectural inspiration, not copied blindly.

---

## 19. API / internal contracts

No backend API is required for the MVP unless needed for share links.

The MVP can run entirely client-side except for optional persistence.

### Optional future APIs

- save sandbox config
- load sandbox config by id
- store company theme presets
- upload design-token packs

---

## 20. Example component contracts

## 20.1 HeroBanner props example

```ts
const HeroBannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  cta: z
    .object({
      label: z.string(),
      href: z.string(),
    })
    .optional(),
  align: z.enum(["left", "center"]).default("left"),
});
```

## 20.2 ProductCard props example

```ts
const ProductCardSchema = z.object({
  title: z.string(),
  description: z.string(),
  badge: z.string().optional(),
  imageUrl: z.string().url().optional(),
  action: z
    .object({
      label: z.string(),
      href: z.string(),
    })
    .optional(),
});
```

---

## 21. Safety rules

The system must reject or avoid the following:

- inline JavaScript
- function props defined in JSON
- raw executable expressions
- arbitrary remote imports
- unsafe HTML rendering by default
- unrestricted className injection from external payloads

If rich text is needed, it must be structured and sanitized.

### Allowed slot pattern

```json
{
  "slots": {
    "footer": {
      "type": "InlineNotice",
      "props": {
        "text": "Terms apply"
      }
    }
  }
}
```

### Disallowed pattern

```json
{
  "render": "() => <script>alert(1)</script>"
}
```

---

## 22. Metrics of success

## MVP success metrics

- user can render all starter components from JSON
- validation catches malformed payloads correctly
- switching themes updates preview correctly
- preview remains stable even with invalid inputs
- shareable URL restores equivalent state

## Longer-term metrics

- time to create a valid payload
- number of supported component contracts
- number of company themes onboarded
- percentage of LLM-generated payloads that validate on first pass

---

## 23. Release plan

## Phase 1 — foundation

- app shell
- envelope schema
- registry system
- 3–5 starter components
- validation and preview
- error handling

## Phase 2 — productized sandbox

- Monaco editor
- theme presets
- viewport toggles
- URL serialization
- examples/templates

## Phase 3 — enterprise readiness

- more components
- schema docs panel
- primitive overrides
- persistence/share ids
- company token import workflow

---

## 24. Risks

### Risk 1 — trying to support arbitrary design systems too early

Mitigation: use token-based theming first.

### Risk 2 — turning the product into a page builder

Mitigation: keep MVP focused on single-component rendering.

### Risk 3 — schema drift vs component implementation

Mitigation: co-locate schema, example, and component in registry workflow.

### Risk 4 — unsafe rendering paths

Mitigation: registry-only rendering, explicit validation, no eval.

### Risk 5 — too much flexibility for LLM-generated payloads

Mitigation: strong contracts, examples, and strict enums/defaults.

---

## 25. Open decisions

The builder should make a call on these during implementation:

1. Will share state live entirely in URL or via saved server-side ids?
2. Should schema docs be visible inline or in a tab?
3. Should starter components use simple local assets or remote image placeholders?
4. Will autocomplete from JSON schema be implemented in MVP or deferred?

Default recommendation:

- URL-first sharing
- schema docs in side panel
- local/simple placeholder assets
- autocomplete optional, not required for MVP

---

## 26. Explicit build instructions for the LLM

Build a **Next.js + TypeScript** application that implements a **JSON Component Sandbox**.

### Must-have requirements

- two-panel layout with JSON editor on left and preview on right
- strict envelope validation using Zod
- component registry pattern
- at least 5 starter components
- theme presets using CSS variables
- clear error handling for parse, validation, and runtime failures
- viewport switching
- starter templates/examples
- URL state sharing

### Must-not-do requirements

- do not implement arbitrary JSON-to-JSX rendering
- do not use eval or dynamic code execution
- do not accept functions in JSON
- do not make this a full page builder in v1
- do not add backend complexity unless required for optional share persistence

### Implementation quality requirements

- clean folder structure
- typed contracts
- reusable registry system
- simple but polished UI
- resilient error boundaries
- easy path to add new components and themes

---

## 27. Final recommendation

The correct MVP is:

**a schema-first, registry-constrained, token-themed JSON sandbox for rendering branded UI components safely and predictably.**

Do not overbuild it. Ship the controlled core first.
