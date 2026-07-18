# Phase A - Make the composite library trustworthy

_Date: 2026-07-18_
_Status: approved design, pending implementation plan_

## Context

Sandy's stated goal is a tool a designer reaches for instead of Figma for design-system
work. The felt blocker is "there is no real library concept" for composite components.

Investigation found that part of that feeling is not a missing feature but a broken one:
the composite library already exists, and it silently lies. This phase fixes the lying.
Browsing (Phase B) and component expressiveness (Phase C) are separate specs and are
explicitly out of scope here.

## The bugs, reproduced

Reproduced end-to-end with Playwright against `master` (`e2e/composite-staleness.spec.ts`).
A composite named "Price Tag" was seeded into `localStorage` exactly as the app persists
it, placed on a page, and that page opened as a shared link.

**On load**, the preview rendered the error fallback:

```
⚠ custom_price_tag_abc123
Unknown component: "custom_price_tag_abc123"
```

**After a single spacebar keystroke in the JSON editor**, with no other change, the same
page rendered correctly: `Composite Rendered OK`.

Measured counts of the string "Unknown component" in the preview:

| Moment              | Occurrences |
| ------------------- | ----------- |
| On load             | 2           |
| After one keystroke | 0           |

The Add Section picker's last entry read `custom_price_tag_abc123 / Repro composite`
rather than `Price Tag`.

## Root cause

`compositeRegistry` (`lib/registry/composite-registry.ts:7`) is a module-level mutable
object. React cannot observe mutations to it.

The single validation gate runs in a memo whose dependency list is `[jsonText]`
(`app/sandbox/page.tsx:128-162`). Saved composites are registered in a mount effect
(`app/sandbox/page.tsx:102-109`) that never touches `jsonText`. On first render the memo
runs _before_ that effect, resolves the section against an empty registry, produces
"Unknown component", and is then never recomputed - React reuses the memoized result
because its one dependency has not changed.

Two user-visible symptoms share this single cause:

1. A shared or reloaded link referencing a saved composite shows "Unknown component"
   until the JSON text is touched.
2. Editing a composite already placed on the canvas leaves the preview rendering the
   previous version.

A third, independent defect: the picker renders the raw registry `key`
(`components/sandbox/toolbar.tsx:140`) while the user-entered name sits unused at
`lib/registry/composite-registry.ts:38`.

## Design

### 1. Make the registry observable

Rejected alternative: adding `composites` to the memo's dependency array. That works only
because `setComposites` currently happens to be called next to every `registerComposite`,
so component state doubles as an accidental change signal. Any future path that registers
without that `setState` - bundle import, seeded examples, the Phase B library panel -
silently reintroduces the bug, and the failure mode ("your component renders the old
version") is one you notice only after shipping a wrong screenshot.

Instead, registration itself becomes the signal. `lib/registry/composite-registry.ts`
gains a minimal subscribable store:

```ts
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  for (const l of listeners) l();
}

export function subscribeToComposites(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCompositeVersion() {
  return version;
}
```

`registerComposite` and `unregisterComposite` call `emit()`. Readers subscribe with
React's own primitive for external mutable stores:

```ts
const registryVersion = useSyncExternalStore(
  subscribeToComposites,
  getCompositeVersion,
  () => 0, // server snapshot: the registry is client-only
);
```

The validation memo's dependencies become `[jsonText, registryVersion]`. Both symptoms
resolve through one mechanism, and every future reader is correct by construction.

`getServerSnapshot` must return a stable constant so SSR and hydration agree.

**Accepted residual:** first render still precedes the mount effect, so a URL containing
composites computes "Unknown component" once and self-heals a frame later. This ships as
is and gets checked during visual verification. If the error panel visibly flashes, the
fallback is a `compositesLoaded` flag that suppresses unknown-component errors until the
first load completes. That state is not added speculatively.

### 2. Show the name, not the id

`components/sandbox/toolbar.tsx:140` renders `metadata.name` (falling back to `key`), with
the existing description line underneath. Built-ins are unaffected in substance; the
composite entry changes from `custom_price_tag_abc123` to `Price Tag`. The raw id remains
visible in the JSON, which is where it is actually needed.

### 3. Warn before breaking a composite that is in use

Editing prop bindings on a composite that sections already reference degrades silently at
edit time. `lib/composite/binding-diff.ts` classifies the damage into three buckets, and
the builder shows a live inline banner (not a save-time modal, so the consequence is
visible while editing rather than after committing to it):

- **Unbound prop:** the generated schema is a non-strict `z.object`, so the now-unknown
  key is stripped at validation. No error, and the value stays in the JSON - it just stops
  being applied by `applyBindings`.
- **Newly required prop:** existing sections omit it, so they fail validation.
- **Retyped prop:** a changed `type`, or a narrowed `enum`, rejects values already saved.

Requiredness alone is not breakage. `generateSchemaFromBindings` attaches `.default()`
whenever the default's runtime type matches the declared type, and the builder seeds
`default: ""` on every binding it creates - so a "required" string binding still accepts a
section that omits it. `diffBindings` mirrors that rule rather than reading `required`
directly, and its tests assert each verdict against the real generated schema so the two
cannot drift apart silently.

No automatic migration. Rewriting user data based on a guessed rename mapping is a larger
feature with its own failure modes, and is not justified until this warning proves
insufficient.

### 4. Stop silently discarding saved components

`loadComposites()` (`lib/composite/storage.ts:17-28`) filters through `isValidDefinition`
and drops anything that fails, with no signal. For a library this is silent data loss:
a malformed entry means a component vanishes and the user is never told.

Report the count of dropped entries so the UI can surface "2 saved components could not be
loaded". Recovery and repair are out of scope; being told is the requirement.

This arrives as a new `notice` variant of `SandboxError` rather than a validation error,
because nothing is wrong with the user's JSON. `ErrorPanel` keeps showing "Valid"
alongside notices - otherwise one unreadable stored entry would suppress the valid
indicator for the rest of the session.

## Testing

Test-first. Each item below fails against `master` before the corresponding change.

- **Unit** (`__tests__/registry/composite-registry.test.ts`): `subscribeToComposites`
  notifies on register and unregister; `getCompositeVersion` increments; unsubscribe stops
  delivery.
- **Unit** (`__tests__/composite/storage.test.ts`): `loadComposites` reports the number of
  dropped invalid entries.
- **Unit**: the binding-diff helper for the in-use warning - removed key, renamed required
  key, and compatible additive change (which must not warn).
- **E2E** (`e2e/composite-staleness.spec.ts`, promoted from the throwaway repro): a shared
  link referencing a saved composite renders it without any keystroke; editing a composite
  on the canvas updates the preview; the picker shows the composite's name.
- **Visual verification**: load a composite-bearing link and confirm no error flash, in
  both light and dark preview modes.

## Out of scope

Browsing UI, previews, search, categories, duplicate, export-all (Phase B). Nested
containers and variants (Phase C). Automatic prop migration on rename. Moving composite
storage off `localStorage`.

## Definition of done

`npm run format:check && npm test && npm run build && npm run lint` green, e2e green,
visually verified in light and dark, shipped as a PR and merged.
