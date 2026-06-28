# Sandy — keikaku status

_Last updated: 2026-06-28_

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
- Stack healthy: Next.js 16.1.6 (clears CVE-2025-55182), Zod 4.3.6 (`z.toJSONSchema` in use),
  React 19.2.3. No AI dependency yet; no `app/api/` yet.

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
