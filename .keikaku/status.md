# Sandy — keikaku status

_Last updated: 2026-06-30_

## Goal

Registry-only JSON→UI sandbox that a **designer** can use as a Figma replacement for
design-system work. Core safety invariant: arbitrary JSON never becomes arbitrary JSX —
only `registry lookup → Zod validate → render`.

## Where things stand

- Upgrade roadmap (`ROADMAP.md` Phases 0–4 + most of Phase 5) is **shipped**: schema-driven
  prop editor, DTCG token I/O, composite import/export, a11y pass, responsiveness, e2e,
  CI gating.
- Latest strategic decision (`docs/generative-ui.md`): **adopt generative UI, narrowly** —
  generate Sandy's existing Zod Page envelope, re-validated through the render gate. Phase 1 =
  "prompt-to-envelope."
- Stack hardened (2026-06-30): Next.js 16.2.9, React 19.2.7, Zod 4.4.3; `npm audit` **clean
  (0 vulnerabilities)**; deps current via Dependabot, with `eslint` 10 / `typescript` 6 held
  back deliberately (see ignore rules in `.github/dependabot.yml`). `CLAUDE.md` refreshed to
  the current architecture (Page v2.0, composite builder, gen-UI, export); codebase trimmed
  by a repo-wide ponytail over-engineering audit.

## Current initiative

**Generative UI Phase 1 — Prompt-to-Envelope (subscription-powered, local).**
Full plan: `/home/dcca/.claude/plans/you-are-keikaku-advancing-drifting-hejlsberg.md` (approved).

A toolbar "Generate from prompt" action → local Next.js route spawns the **Claude Code CLI**
(`claude -p`, authed by the user's subscription via `CLAUDE_CODE_OAUTH_TOKEN`) → returns a Page
envelope → re-validated by `validatePage()` → loaded into the editor for human review/render.

### Decisions locked this session

- **No paid API.** Runs on the Claude subscription via the Claude Code headless CLI. (The Agent
  SDK and metered APIs are ruled out — the Agent SDK does not permit subscription auth.)
- **Local-only feature.** Works on the designer's machine; the deployed Vercel site stays the
  pure JSON sandbox with Generate hidden/disabled.
- **Full Page generation** (one or more registry sections).
- **Model contract:** enum+catalog JSON Schema for the CLI; `validatePage()` is the hard gate.

## Build state

Phase 1 is **merged to `master`** (PR #9, commit `22ed57c`): `lib/ai/generate-envelope.ts`,
`app/api/generate/route.ts`, `components/sandbox/generate-panel.tsx`, toolbar + page wiring,
unit + route + e2e tests, docs. A loading state on the Generate button followed (PR #10,
`8fad9fe`). Full gate green locally and in CI (typecheck · lint · vitest · build · playwright).
Dogfooded live via the Claude Code CLI (stored login) — real prompts produce envelopes that pass
`validatePage` and render in light and dark.

## needs_human

To use generation on a fresh machine, run **once**: `claude setup-token` → add
`CLAUDE_CODE_OAUTH_TOKEN=...` to `.env.local` → restart dev. (Where Claude Code is already logged
in, the stored login is used and no token is needed.)

## next_action

Phase 1 done. Candidate follow-ups (from `docs/generative-ui.md` §6): quality evals + telemetry
on validation-failure rate (Phase 2), streaming preview via `streamObject`/SpecStream (Phase 3),
theming-aware generation (Phase 4). Smaller polish: wire an `AbortController`/cancel so a slow
generation can be cancelled instead of waiting out the 120s timeout (noted in review).

## Session log

### 2026-06-30 — Housekeeping: docs refresh, dep hygiene, 0 CVEs, ponytail cleanup

**Where we were:** Gen-UI Phase 1 shipped (2026-06-28). But `CLAUDE.md` had drifted behind the
code (still documented a single-component Envelope v1.0; no mention of the composite builder,
gen-UI route, export, or the test stack). Several open Dependabot PRs, 16 `npm audit`
vulnerabilities, and stale remote branches were outstanding.

**What we did:**

- **Refreshed `CLAUDE.md`** to the real architecture: Page v2.0 (`sections[]`) model, composite
  component builder, prompt-to-Page gen-UI route, JSON/HTML/React export, Vitest/Playwright/jest-axe
  test stack, DTCG + custom themes (PR #12).
- **Resolved every open PR + pruned stale branches.** Merged the GitHub Actions bumps (checkout@v7,
  setup-node@v6, upload-artifact@v7 — clears the Node 20 deprecation; #3/#4/#5, #4 needed a manual
  `ci.yml` rebase), production deps (next 16.2.9, react 19.2.7, zod 4.4.3, lucide 1.22; #7, #16),
  and the safe dev-deps (#14/#15). Deleted 2 squash-merged `claude/*` branches.
- **Stopped the recurring broken dev-deps PR.** Its group kept failing on `eslint` 9→10 (ESLint 10
  removed `context.getFilename()`, which the `eslint-plugin-react` bundled by `eslint-config-next`
  still calls) plus an untested `typescript` 5→6. Landed the safe subset and added Dependabot
  `ignore` rules for both majors with reasons (#14).
- **`npm audit`: 16 → 0** (#17). 12 cleared by `npm audit fix` (transitive only); the last 2
  (postcss <8.5.10 in `next`, dompurify ≤3.4.10 in `monaco-editor`) fixed via `overrides`
  (postcss ^8.5.10, dompurify ^3.4.11) — avoiding the `--force` fix that would downgrade `next` to 9.3.3.
- **Ponytail over-engineering audit, applied** (#18, ~-240 source lines): deleted dead
  `clearCompositeRegistry`, deduped `CollapsibleSection` + `slugify` into shared modules, merged
  `exportComposites`, un-exported internal-only symbols, dropped dead `@testing-library/jest-dom`,
  moved the `shadcn` CLI to devDependencies. Visually verified the token + property editors.
- **Restored the 3 shadcn primitives** (Card/Tooltip/Badge) the audit had removed, kept as an
  intentional design-system palette (#19), each marked with a `// ponytail:` keep comment (#20).

**Decisions:**

- **Hold `eslint` 9 and `typescript` 5** via Dependabot ignore rules — ESLint 10 breaks linting
  through `eslint-config-next`; TS 6 is an untested major. Lift each once upstream/ a migration is ready.
- **Fix bundled-dep CVEs with `overrides`, not `npm audit fix --force`** — the forced fix downgrades
  `next` to 9.3.3, which is unacceptable.
- **Keep the shadcn Card/Tooltip/Badge primitives** as design-system surface (reversing the audit's
  delete), marked so a future audit won't re-flag them.

**Pending / next:**

- [ ] Lift the Dependabot `eslint`/`typescript` major holds once `eslint-config-next` supports
      ESLint 10 and a deliberate TS 6 migration is done.
- [ ] (carried) Gen-UI Phase 2 evals + telemetry; streaming preview (Phase 3); theming-aware
      generation (Phase 4); cancel/AbortController polish for in-flight generation.

### 2026-06-28 — Generative UI Phase 1: prompt-to-envelope, shipped

**Where we were:** Roadmap Phases 0–4 + most of Phase 5 shipped; the generative-UI research doc
(PR #8) had just landed with an "adopt-narrowly" decision but no implementation. No `app/api/`,
no AI dependency.

**What we did:**

- Planned, then built **Generative UI Phase 1** — a "Generate from prompt" toolbar action that
  emits Sandy's validated Page envelope, re-validated through the existing render gate (PR #9,
  `22ed57c`). New `lib/ai/generate-envelope.ts`, `app/api/generate/route.ts`,
  `components/sandbox/generate-panel.tsx`, toolbar + page wiring; unit + route + e2e tests; docs
  (`.env.example`, README, CHANGELOG, `docs/generative-ui.md`).
- Added a **loading state** to the Generate button (PR #10, `8fad9fe`).
- Verified: 239 unit tests, build, 7 Playwright e2e — green locally and in CI for both PRs.
- Dogfooded live with the real CLI (banking + SaaS-landing prompts; light + dark).

**Decisions:**

- **No metered API — subscription only.** Generation runs via the **Claude Code headless CLI**
  (`claude -p --json-schema`), not the Vercel AI SDK or the Claude Agent SDK (the Agent SDK
  forbids subscription auth). Consequence: a **local-only** feature; the deployed build hides it.
- **Model contract:** enum + per-component field catalog (rendered from each component's JSON
  Schema) in the prompt; `validatePage()` is the hard gate.
- Dogfooding fixed two fidelity bugs (arrays-of-primitives mis-described; invented icon names);
  an adversarial review fixed three (prompt arg-injection via `--`, raw-stderr leak, theme sync).

**Pending / next:**

- [ ] Phase 2 — quality evals + telemetry on the validation-failure rate.
- [ ] Streaming preview (Phase 3); theming-aware generation (Phase 4).
- [ ] Polish: cancel/AbortController for in-flight generation (avoid waiting out the 120s timeout).
