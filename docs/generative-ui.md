# Generative UI — Research, Conclusions & Recommendations

_Status: research complete · Decision: **Adopt-narrowly** · Audience: Sandy maintainers_

This document summarizes a multi-source, fact-checked review of generative UI
(LLM-generated user interfaces) as of 2025–2026 and answers one question:
**should Sandy adopt generative UI, and if so, how?**

> TL;DR — **Yes, narrowly.** Sandy's architecture (a strictly Zod-validated JSON
> envelope rendered through a controlled component registry, no arbitrary
> JSON→JSX) is _already_ the production-safe generative-UI pattern that the
> industry has converged on. The only missing piece is the generation step: an
> LLM that emits Sandy's existing envelope via the Vercel AI SDK
> `generateObject`/`streamObject` primitive, re-validated through Sandy's render
> gate. Avoid live-code generation and the experimental RSC streaming path.

---

## 1. What "generative UI" means

Generative UI is the use of an LLM to produce a user interface at runtime rather
than (or in addition to) hand-authoring it. In 2025–2026 it splits into three
architecturally distinct approaches with **sharply different safety profiles**:

1. **LLM → structured JSON through a controlled registry** — the model emits JSON
   constrained to a developer-defined component catalog; props are schema-validated
   before rendering; no code reaches the browser.
2. **LLM → live code generation** — the model writes real React/HTML/JS that is
   then executed (v0, bolt.new, Claude Artifacts).
3. **Streaming RSC / tool-calling component selection** — the model picks and
   streams server components via tool calls (Vercel AI SDK `streamUI`/RSC).

---

## 2. The three approaches compared

| Dimension                        | (1) Structured JSON + registry                                                | (2) Live code gen                                | (3) Streaming RSC / `streamUI`                    |
| -------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| How it works                     | LLM emits JSON matched to a Zod/JSON-schema catalog; registry maps spec→React | LLM writes React/HTML/JS that is compiled & run  | LLM tool-calls return streamed server components  |
| Arbitrary-code risk              | **None** (data only)                                                          | **High** (executes model code)                   | Medium–High (server execution path)               |
| Isolation needed                 | None beyond a safe renderer                                                   | Heavyweight (iframe + CSP, WebContainers)        | Server sandboxing; protocol-level risk            |
| Hallucination control            | Strong — output constrained to catalog + validated                            | Weak — free-form code                            | Medium — constrained to defined tools             |
| Theming / design-system fidelity | High — renders your real components/tokens                                    | Variable — model reinvents styling               | High — uses your components                       |
| Production maturity              | Emerging but the safe default (json-render, Thesys C1)                        | Mature products, but only via serious sandboxing | **Experimental — Vercel says not for production** |
| Fit for Sandy                    | **Native fit** (identical model)                                              | Antithetical to registry-only safety             | Maturity + security risk                          |

### Approach 1 — Structured JSON + controlled registry (the safe default)

This is mechanically **identical to Sandy's existing model**. Two reference
implementations:

- **Vercel Labs `json-render`** (Jan 2026): the LLM generates a JSON spec
  constrained to a Zod-schema catalog — _"AI can only use components in your
  catalog"_, _"JSON output matches your schema, every time"_ — props validated
  before render, a registry bridging spec→React, with **progressive streaming**
  of the spec via JSONL RFC-6902 patches.
  ([GitHub](https://github.com/vercel-labs/json-render),
  [InfoQ](https://www.infoq.com/news/2026/03/vercel-json-render/),
  [The New Stack](https://thenewstack.io/vercels-json-render-a-step-toward-generative-ui/),
  [LogRocket](https://blog.logrocket.com/vercel-json-render-dynamic-ui/))
- **Thesys C1**: an OpenAI-compatible middleware between model and frontend that
  _"returns a JSON-based UI specification"_ over a controlled component
  vocabulary; custom components are registered with a name-keyed Zod→JSON schema —
  a controlled, schema-validated registry, directly analogous to Sandy's.
  ([How C1 works](https://docs.thesys.dev/guides/how-c1-works),
  [Implementing the API](https://docs.thesys.dev/guides/implementing-api),
  [Architecture](https://www.thesys.dev/blogs/generative-ui-architecture))

LogRocket sums up the security argument: _"Instead of having the model generate
arbitrary code, you let it generate structured JSON that maps to a predefined set
of components… This constraining approach prevents LLMs from generating malicious
React JS code,"_ combining _"model flexibility with schema validation, predictable
rendering, and a much clearer security story."_

### Approach 2 — Live code generation (flexible, but heavy isolation)

Most flexible, largest attack/error surface — the wrong fit for a registry-only
safety model.

- **bolt.new** _"gives AI models complete control over the entire environment
  including the filesystem, node server, package manager, terminal, and browser
  console"_ (sandboxed via WebContainers).
  ([GitHub](https://github.com/stackblitz/bolt.new))
- **Claude Artifacts** only ship safely because Anthropic built strict iframe +
  CSP sandboxing; their engineers said _"the biggest challenge was building a
  robust sandbox to run the LLM-generated code in."_
  ([Simon Willison](https://simonwillison.net/tags/claude-artifacts/),
  [Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/how-anthropic-built-artifacts))

Takeaway: arbitrary-code generation requires heavyweight isolation that Sandy's
data-only path avoids entirely.

### Approach 3 — Streaming RSC / `streamUI` (experimental + security risk)

- Vercel's **own docs**: _"AI SDK RSC is marked as experimental, and it is not
  recommended for use in stable production environments"_ and they _"strongly
  recommend migrating to AI SDK UI."_
  ([Migrate guide](https://ai-sdk.dev/docs/ai-sdk-rsc/migrating-to-ui),
  [RSC overview](https://ai-sdk.dev/docs/ai-sdk-rsc/overview))
- Reinforced by **CVE-2025-55182 ("React2Shell")** — a **CVSS 10/10**
  unauthenticated RCE from server-side prototype pollution in RSC Flight-protocol
  deserialization, affecting Next.js 15.x/16.x and `react-server-dom-*`
  19.0–19.2.0 (patched in 19.x.y and **Next.js ≥ 16.0.7**).
  ([Datadog](https://securitylabs.datadoghq.com/articles/cve-2025-55182-react2shell-remote-code-execution-react-server-components/),
  [React advisory](https://react.dev/blog/2025/12/03),
  [NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-55182))

> **Action item independent of generative UI:** ensure Sandy runs on **Next.js
> ≥ 16.0.7** to be clear of this CVE class.

---

## 3. The primitives Sandy would use

The **Vercel AI SDK** provides exactly what Sandy needs, with no RSC dependency:

- **`generateObject`** — _"converts your Zod schema to JSON Schema, sends it to the
  model, and validates the response before returning it,"_ yielding type-safe,
  validated output (throws `NoObjectGeneratedError` on failure).
- **`streamObject`** — the streaming counterpart, for progressive preview.
- **Tool calling** — the model selects typed tools each defined with a Zod
  `inputSchema` (the mechanism under `streamUI`), usable without RSC.

([AI SDK intro](https://ai-sdk.dev/docs/introduction),
[generateObject](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-object))

Because Sandy already defines a Zod envelope schema, `generateObject` is the
direct way to make an LLM emit Sandy's validated envelope — which then passes
through Sandy's existing render gate.

---

## 4. The one correctness caveat that matters

Schema/grammar-constrained decoding **guarantees conformance but not quality**.
The NeurIPS 2024 "Grammar-Aligned Decoding" work shows constrained decoding _"can
distort the LLM's distribution, leading to outputs that are grammatical but…
ultimately low-quality."_ ([arXiv 2405.21047](https://arxiv.org/abs/2405.21047))

**Implication:** a _valid_ Sandy envelope is not necessarily a _good_ UI. Schema
validity is necessary but not sufficient. It must be paired with human-in-the-loop
review, an eval set, and a validate-then-reject fallback.

---

## 5. Recommendation — **Adopt-narrowly**

**Add generation that emits Sandy's existing Zod-validated envelope; do not adopt
live-code generation or experimental RSC streaming.**

Sandy's architecture — Zod envelope, registry-only render, no JSON→JSX, scoped
`--sandy-*` token theming, DTCG export — is already the production-safe
generative-UI pattern that `json-render` and Thesys C1 independently converged on.
The only missing piece is the generation step.

### Architecture that fits Sandy's safety model

1. **Generate server-side** via `generateObject` using Sandy's envelope Zod schema
   (or the registry component schemas as a discriminated union). Never let the
   model author code or touch RSC.
2. **Re-validate** the model output through Sandy's existing render gate — this is
   the hard enforcement boundary. Do **not** trust the SDK's own validation alone.
3. **Constrain the catalog** passed to the model to Sandy's registry, so component
   selection is guardrailed.
4. **Stream incrementally** (`streamObject` / SpecStream-style patches) for
   latency/UX, feeding the existing preview pane.
5. **Single Zod source of truth** — generate the model-facing JSON Schema from the
   same Zod definitions to prevent drift.

### Risks & mitigations

| Risk                                               | Mitigation                                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Valid-but-wrong output (distributional distortion) | Human-in-the-loop preview before render; eval set; existing error boundary                   |
| Prompt injection / data exfiltration               | Server-side only; no function props; no remote component loading (already Sandy constraints) |
| Schema drift (model JSON schema vs runtime Zod)    | Generate JSON schema from the same Zod source                                                |
| JSON-borne XSS/injection                           | Keep no-HTML-injection + inline-style-only theming + `safeHref` (already in place)           |
| RSC RCE class (CVE-2025-55182)                     | Avoid the RSC path entirely; run Next.js ≥ 16.0.7                                            |

### What to avoid

- **Live-code generation** — sandbox burden and attack surface antithetical to
  Sandy's registry-only model.
- **RSC `streamUI`** — Vercel-experimental and exposed to the CVE-2025-55182 class.

---

## 6. Phased rollout

1. **Phase 1 — Prompt-to-envelope (internal).** A "generate from prompt" action
   that fills the existing JSON editor with a `generateObject`-produced envelope,
   fully re-validated; **human reviews before render** (no autonomous render).
2. **Phase 2 — Single-component generation** against the registry catalog, with
   quality evals + telemetry on validation-failure / rejection rate.
3. **Phase 3 — Composite/multi-component layouts** via the existing composite
   builder, with streaming preview (`streamObject`/SpecStream).
4. **Phase 4 — Theming-aware generation** that respects the active brand token set,
   leveraging the DTCG export to keep design-system fidelity.

---

## 7. Open questions (worth resolving before/while building)

- What is the empirical validation-failure / rejection rate when an LLM emits
  Sandy's _specific_ envelope via `generateObject`, and how does it scale with
  composite/multi-component layouts?
- Does Zod 4 → JSON Schema conversion preserve Sandy's discriminated-union and
  refinement constraints losslessly for model consumption?
- Can generation respect Sandy's multi-brand token theming / DTCG export at
  generation time, or must theming stay a deterministic post-generation step?
- What is the real latency/cost of `generateObject` vs `streamObject` for a full
  envelope — is patch-based streaming worth the client complexity for the preview
  pane?

---

## 8. Caveats on this research

- **Fast-moving area.** `json-render` and Thesys C1 are 2026-era; `json-render` is
  a Vercel Labs project (Apache-2.0), so its "production-oriented" framing is
  design intent, not proven maturity — two over-claims about its production
  maturity and safety guarantees were **refuted** during verification.
- **Source access.** Several primary docs (ai-sdk.dev, docs.thesys.dev, arxiv.org,
  LogRocket) returned HTTP 403 to direct fetching; verification relied on
  search-indexed verbatim text plus independent corroboration (consistent in every
  case, but direct page rendering was not observed).
- **Enforcement nuance.** Thesys C1's JSON schema mainly informs the LLM at
  generation time and renders through C1's own renderer, whereas Sandy enforces
  Zod as a hard render gate — the registry-pattern analogy holds, but enforcement
  semantics differ.
- **Security is not absolute.** Registry-based JSON is materially safer than code
  generation but not absolutely safe; JSON-borne XSS and unsafe renderer
  implementations remain possible — Sandy's existing constraints are what close
  that gap.

---

## Sources

- Vercel Labs json-render — https://github.com/vercel-labs/json-render · https://json-render.dev
- InfoQ on json-render — https://www.infoq.com/news/2026/03/vercel-json-render/
- The New Stack on json-render — https://thenewstack.io/vercels-json-render-a-step-toward-generative-ui/
- LogRocket on json-render — https://blog.logrocket.com/vercel-json-render-dynamic-ui/
- Thesys C1 — https://docs.thesys.dev/guides/how-c1-works · https://docs.thesys.dev/guides/implementing-api · https://www.thesys.dev/blogs/generative-ui-architecture
- Vercel AI SDK — https://ai-sdk.dev/docs/introduction · https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-object · https://ai-sdk.dev/docs/ai-sdk-rsc/migrating-to-ui · https://ai-sdk.dev/docs/ai-sdk-rsc/overview · https://ai-sdk.dev/docs/reference/ai-sdk-rsc/stream-ui
- bolt.new — https://github.com/stackblitz/bolt.new
- Claude Artifacts — https://simonwillison.net/tags/claude-artifacts/ · https://newsletter.pragmaticengineer.com/p/how-anthropic-built-artifacts
- Grammar-Aligned Decoding (NeurIPS 2024) — https://arxiv.org/abs/2405.21047
- CVE-2025-55182 (React2Shell) — https://securitylabs.datadoghq.com/articles/cve-2025-55182-react2shell-remote-code-execution-react-server-components/ · https://react.dev/blog/2025/12/03 · https://nvd.nist.gov/vuln/detail/CVE-2025-55182

_Method: fan-out web search across 5 angles → source dedup/fetch → 3-vote
adversarial verification (23/25 claims confirmed, 2 refuted) → synthesis._
