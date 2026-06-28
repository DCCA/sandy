# Sandy — Upgrade Roadmap

A prioritized plan to bring Sandy on par with (and in places ahead of) comparable
JSON/component-sandbox, low-code-builder, design-token, and server-driven-UI tools.

Derived from a four-track review: (1) core architecture & pipeline, (2) component
library / schemas / theming, (3) engineering quality bar (testing/CI/tooling), and
(4) a competitive scan of the field.

---

## 1. Where Sandy stands today

Sandy's **foundations are strong**. The core differentiator — a strict registry-only
render path (lookup → Zod validate → render), a secure JSON→JSX boundary
(no `eval`, no `dangerouslySetInnerHTML`, `safeHref` blocking `javascript:`/`data:`/`vbscript:`
at both schema and render time), and multi-brand theming scoped to the preview
container via `--sandy-*` CSS vars — is genuinely well-built and, in combination,
not matched by any single competitor surveyed.

The gaps are **maturity and breadth**, not architecture.

| Dimension               | Grade | Summary                                                                      |
| ----------------------- | ----- | ---------------------------------------------------------------------------- |
| Architecture / security | A−    | Solid & safe; held back by version drift + composite lifecycle               |
| Type safety             | A     | Strict TS + Zod throughout                                                   |
| Component quality       | C+    | Consistent, but accessibility near-zero and no responsiveness                |
| Schema rigor            | B−    | Good coverage, loose constraints, duplicated enums                           |
| Theming                 | B     | Strong token set; `mode` field unused, no light/dark pairing, bespoke format |
| Testing                 | C     | Domain logic tested (~10–15% overall); no e2e, no UI, no coverage tool       |
| CI/CD & tooling         | C     | **Tests not gated in CI**; no Prettier, no dependabot                        |
| Project hygiene         | C−    | No LICENSE file, CONTRIBUTING, monitoring, analytics                         |

---

## 2. Key issues found in the codebase

### Correctness / architecture

- **Version drift (Critical).** Envelope `v1.0` and Page `v2.0` coexist; composites
  hardcode `"1.0"`. Migration is one-way and composite definitions don't survive
  share-links. (`lib/schemas/envelope.ts`, `lib/sandbox/validate.ts`)
- **No graceful degradation (High).** One unknown component or one props failure
  flips `validatePage` to `success: false` for the _entire page_. Mature SDUI systems
  degrade per-section instead (see §4.4).
- **Composite registry lifecycle (High).** Global mutable registry, silent ID
  overwrite, localStorage-only — so a shared page referencing a custom composite
  renders "unknown component" for the recipient. No import/export.
- **Primitive props unvalidated at render (Medium).** `PrimitiveNode.props` is
  `Record<string, unknown>`; corrupted localStorage renders via unsafe casts.
- **State-sync fragility (Medium).** ref-flag `isToolbarUpdate` coordination, JSON
  parsed twice per cycle, shallow-copied example props
  (`{...item.example.props}` should be `structuredClone`).

### Components / accessibility

- **Accessibility near-zero (Critical for "on par").** Exactly one ARIA attribute
  in the whole codebase; no keyboard nav, no focus management/trap in modal/sheet,
  unlabeled icon buttons.
- **No responsive design (High).** Fixed grid columns (`PricingTable`,
  `InfoCardGrid`, `Footer`, `StatsRow`); zero `@media` queries.
- **Hardcoded variant colors** in `NoticeBox`/`PromoBanner` bypass theme tokens;
  index-as-key throughout `.map()` calls.

### Schemas / theming

- Loose constraints (unbounded arrays, `amount` as free string); duplicated variant
  enums across 4+ schemas; `shared.ts` underused.
- `theme.mode` is in the schema but **never read**; no light variant for Enterprise Dark.
- `meta.viewport` only allows `"mobile"` while docs example shows `"desktop"` (drift).

---

## 3. How Sandy compares to the field

| Category                                                                                                                                                                                     | What leaders do                                                                                                                                                                                                                                      | Sandy's gap                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Playgrounds** — Storybook, Sandpack                                                                                                                                                        | Args/controls auto-UI, a11y addon, interaction tests, visual regression (Chromatic), in-browser bundling                                                                                                                                             | No controls-style prop UI; no a11y/visual testing                                                          |
| **Low-code builders** — [Puck](https://github.com/puckeditor/puck), [Builder.io](https://www.builder.io/), [Plasmic](https://docs.plasmic.app/), [Craft.js](https://craft.js.org/), GrapesJS | Drag-drop canvas + layer tree, JSON output, own-your-data, source codegen, slots, per-breakpoint model, real-time collab                                                                                                                             | No visual canvas/layer tree, no codegen, no collab, no per-breakpoint model                                |
| **Schema-driven forms** — [rjsf](https://github.com/rjsf-team/react-jsonschema-form), [JSONForms](https://jsonforms.io/), [Uniforms](https://github.com/vazco/uniforms)                      | Auto-generate editor UI from schema, `liveValidate`, error-summary + focus-first-error, localized messages                                                                                                                                           | Hand-written JSON; no schema-driven prop editor; simpler error UX                                          |
| **Design tokens** — [Style Dictionary v4](https://styledictionary.com/info/dtcg/), [Tokens Studio](https://docs.tokens.studio/), Panda, Radix Colors                                         | [W3C DTCG](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) `.tokens.json` interop, token aliasing (primitive→semantic→component), orthogonal theme axes, export/codegen, Figma sync | Bespoke flat presets; no aliasing/tiers, no DTCG, no export, no Figma round-trip, no runtime custom themes |
| **Server-driven UI** — Adaptive Cards, Airbnb, DoorDash                                                                                                                                      | Per-element `fallback`/`drop` with bubbling, capability `requires` + version gating, data-binding/templating, declarative actions, per-section status/telemetry                                                                                      | `version` inert, `slots` declared but unused, no fallback, no binding, no action model                     |

**The most commonly-expected-but-missing features:** accessibility, visual/e2e
testing, schema-driven prop editing, DTCG token import/export, and a visual
canvas. Sandy is already _ahead_ on registry-validated rendering + portable token
theming combined — no surveyed tool fuses both the way Sandy does.

---

## 4. The Roadmap

Six phases, ordered by leverage. Each is independently shippable.

### Phase 0 — Stop the bleeding (½–1 day) · _do first_

Cheap, high-confidence fixes that prevent regressions.

- Add `npm run test` to CI (`.github/workflows/ci.yml`) and to `.husky/pre-push`.
  **Broken tests can currently merge to master.**
- Add Prettier + `format` script + lint-staged integration.
- `structuredClone` for example props; flush editor debounce on unmount.
- Add a real `LICENSE` file (README claims MIT), `.editorconfig`, `dependabot.yml`.
- Enable `vitest --coverage` (c8) with a floor on `lib/`.

### Phase 1 — Data model integrity (2–3 days)

- **Resolve version drift:** make Page `v2.0` canonical; mark Envelope `v1.0`
  legacy-migrate-only with a deprecation warning; realign composite version.
- **Per-section graceful degradation:** extend the data model so an unknown/invalid
  section degrades to a placeholder + logs, instead of failing the whole page
  (Adaptive Cards `fallback`/`drop` + Airbnb `SectionContainer` status pattern).
- **Validate primitive props at render** with the existing per-primitive Zod
  schemas (fail to an error placeholder, not a crash).
- **Schema-migration scaffold** (`{component: {from→to: fn}}`) plus a min-version
  gate, so component props can evolve — table stakes for SDUI longevity.
- URL-size guard + user feedback when share serialization fails.
- Reconcile `meta.viewport` schema with docs.

### Phase 2 — Accessibility (1–2 weeks) · _biggest "on par" gap_

- ARIA pass on all 21 components (labels on icon buttons, roles,
  `aria-current`/`aria-expanded`).
- Keyboard nav + focus management/trap in `ModalPreview` and `BottomSheet`;
  visible focus-ring token.
- Move hardcoded `NoticeBox`/`PromoBanner` colors into theme tokens; add
  WCAG-contrast tests for presets.
- Wire `@axe-core` into the test suite so a11y regressions are caught.
- _Differentiator:_ a Puck-style built-in heading-outline / a11y checker panel.

### Phase 3 — Responsiveness & theming (1 week)

- Mobile-first `@media` fallbacks for the fixed-grid components.
- **Make `theme.mode` actually work** — light/dark token sets per brand (add
  Enterprise Light).
- Introduce a **tiered token model** (primitive → semantic → component) with
  aliasing, so a brand is defined as "remap the semantic layer."
- Validate token overrides with a `CustomThemeSchema` before merge.
- Extract shared schemas/enums into `shared.ts` (`buttonSchema`, `variantEnum`,
  `alignEnum`); tighten array/string constraints.

### Phase 4 — Testing & quality bar (1 week)

- **Playwright e2e** for top flows: JSON→render, theme switch, section
  add/reorder, error recovery, share-link round-trip, builder save→use.
- Component interaction tests (Toolbar, PropertyEditor, TokenEditor).
- Extend schema tests to all 21 components (currently ~8); add `tokensToCSSVars`
  - preset-shape tests.
- `next/bundle-analyzer` (Monaco is the prime suspect); optional error monitoring (Sentry).
- Add CONTRIBUTING.md, PR/issue templates, CHANGELOG.

### Phase 5 — Differentiating features (2–4 weeks) · _upgrade beyond par_

Pick based on product direction:

- **Schema-driven prop editor** — auto-generate a form from each component's Zod
  schema (rjsf/JSONForms/Uniforms-style; Uniforms already supports Zod). Highest
  UX leverage for non-JSON users.
- **DTCG token import/export** (`.tokens.json`) for Figma / Tokens Studio interop
  and standard codegen.
- **Composite import/export** + make composites shareable (embed definitions in
  the share payload or export as `.json`).
- **Data binding / templating** — `${}` / `$data` / `$when` / `$index` expression
  layer (Adaptive Cards Templating); author layout once, bind data separately.
  Stays within Sandy's "no code in JSON" stance.
- **Declarative action model** (`verb` + `data`, no embedded code) — interactions
  as data, aligned with the no-eval/no-function-props rules.
- **Implement the inert `slots`** — nested/section composition (Puck `zones`,
  Craft.js `linkedNodes`).
- **Codegen polish** — extend "copy as React/HTML" with framework variants and an
  embeddable iframe/preview URL.

---

## 5. Recommendation

1. **Do Phase 0 + Phase 1 now** — cheap, fix real correctness bugs, and close the
   most embarrassing gap (tests not gated; whole-page failure on one bad section).
2. **Treat Phase 2 (accessibility) as the flagship upgrade** — it's the clearest
   thing separating Sandy from best-in-class tools and is almost entirely absent today.
3. **Phase 5's schema-driven editor + DTCG tokens** are where Sandy can leapfrog
   comparable OSS sandboxes.

---

## Appendix — Sources

**Low-code builders:** [Puck](https://github.com/puckeditor/puck) ·
[Builder.io](https://www.builder.io/) · [Plasmic](https://docs.plasmic.app/) ·
[Craft.js](https://craft.js.org/) · [GrapesJS](https://github.com/GrapesJS/grapesjs)

**Schema-driven forms:** [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form) ·
[JSONForms](https://jsonforms.io/) · [Uniforms](https://github.com/vazco/uniforms)

**Design tokens:** [Style Dictionary / DTCG](https://styledictionary.com/info/dtcg/) ·
[W3C DTCG stable release](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) ·
[DTCG format](https://www.designtokens.org/tr/drafts/format/) ·
[Tokens Studio](https://docs.tokens.studio/) · [Radix Colors](https://github.com/radix-ui/colors) ·
[Open Props](https://github.com/argyleink/open-props)

**Server-driven UI:** [Adaptive Cards schema](https://github.com/microsoft/AdaptiveCards) ·
[AC fallback (#2019)](https://github.com/microsoft/AdaptiveCards/issues/2019) ·
[SDUI patterns discussion](https://github.com/MobileNativeFoundation/discussions/discussions/47) ·
[InfoQ: Airbnb SDUI](https://www.infoq.com/news/2021/07/airbnb-server-driven-ui/)
