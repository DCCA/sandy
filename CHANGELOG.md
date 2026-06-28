# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims to
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Generative UI Phase 1 — "Generate from prompt" (local-only): a toolbar action
  that turns a natural-language description into a validated page envelope via the
  Claude Code CLI on the user's Claude subscription (no metered API key). Output is
  re-validated through the existing render gate; the action is hidden when the CLI
  is unavailable (e.g. on the deployed build). New `/api/generate` route,
  `lib/ai/generate-envelope.ts`, and `components/sandbox/generate-panel.tsx`.
- W3C DTCG design-token import/export (`.tokens.json`) in the token editor, for
  interop with Figma, Style Dictionary, and Tokens Studio.
- Composite (custom component) import/export as portable `.json` bundles, so
  user-built components are no longer trapped in one browser's localStorage.
- Per-section graceful degradation: unknown/invalid sections render an in-place
  placeholder instead of disappearing, preserving page order.
- Functional light/dark `theme.mode` with per-brand variants (dark for
  default/Acme, light for Enterprise Dark) via `getThemeTokens`.
- `CustomThemeSchema` validation for URL-supplied token overrides.
- Render-time validation of composite primitive props.
- Accessibility pass across all registry components (ARIA, semantic HTML, alt
  text, scoped `:focus-visible` ring) with a `jest-axe` test suite.
- Responsive auto-fit grids so multi-column components wrap on narrow screens.
- Playwright end-to-end tests for the core sandbox flows.
- Prettier, EditorConfig, Dependabot, LICENSE, CONTRIBUTING, bundle analyzer,
  and Vitest coverage tooling.

### Changed

- CI now runs format check and the test suite (previously ungated); pre-push
  runs tests.
- `meta.viewport` accepts `mobile | tablet | desktop` (was `mobile` only).
- Hardcoded variant colors in notice/promo/badge now use semantic theme tokens.

### Fixed

- Example props are deep-cloned when adding a section.
- The Monaco editor debounce timer is cleared on unmount.
- Oversized state is no longer silently written to the share URL.
