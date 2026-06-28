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

## Build state (2026-06-28)

Phase 1 is **built and shipped** on branch `feat/generative-ui-prompt-to-envelope`:
`lib/ai/generate-envelope.ts`, `app/api/generate/route.ts`,
`components/sandbox/generate-panel.tsx`, toolbar + page wiring, unit + route + e2e tests, docs.
Full gate green locally (typecheck · lint · vitest · build · playwright). Dogfooded live via the
Claude Code CLI (stored login) — real prompts produce envelopes that pass `validatePage`.

## needs_human

To use generation on a fresh machine, run **once**: `claude setup-token` → add
`CLAUDE_CODE_OAUTH_TOKEN=...` to `.env.local` → restart dev. (Where Claude Code is already logged
in, the stored login is used and no token is needed.)

## next_action

Phase 1 done. Candidate follow-ups (from `docs/generative-ui.md` §6): quality evals + telemetry
on validation-failure rate (Phase 2), streaming preview via `streamObject`/SpecStream (Phase 3),
theming-aware generation (Phase 4).
