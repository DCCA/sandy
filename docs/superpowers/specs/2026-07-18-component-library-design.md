# Phase B - The component library surface

_Date: 2026-07-18_
_Status: implemented_

## Context

Second of three phases on making Sandy usable as a daily design-system tool. The stated
blocker was "there is no real library concept" for composite components.

[Phase A](./2026-07-18-composite-library-trust-design.md) fixed the correctness half: the
registry was invisible to React, so saved components rendered "Unknown component" on load
and went stale on edit. This phase builds the browsing surface on top of that. Phase C
(nested containers, so composites can express real structure) is separate.

## The problem

Saved composites had no home. They appeared as a flat row of pills in the toolbar - name
plus three icon buttons each - which does not survive more than a handful of components,
and shows no preview of what any of them actually look like. There was no search, no
grouping, no duplicate, no way to export the set, and no sense of what you had worked on
recently. A "library" you cannot look at is a list, not a library.

## Design

### Data model

`CompositeDefinition` gains three optional fields: `category`, `createdAt`, `updatedAt`.

All three are optional on purpose. Components saved before this change have none of them,
and the storage validator must keep accepting those - a library that silently drops your
older components to gain a sort order is a bad trade. Missing `updatedAt` sorts last and
renders as "-"; missing `category` groups under "Uncategorized".

`saveComposite` stamps `updatedAt` on every write and preserves the original `createdAt`
across edits, then **returns the stamped definition** so callers can keep component state
in sync with what was actually written rather than with what they asked to write.

### The panel

`components/sandbox/component-library.tsx` is a full-screen overlay in the same visual
language as the component builder. It is purely presentational - it takes `composites` and
callbacks, and never touches storage or the registry itself, so the page stays the single
place that owns those side effects.

Each card renders a **live preview** of the composite, themed with the active token set.
Theming is per card: each `LibraryCard` owns its own ref and applies `--sandy-*` variables
to its own preview element, never to `document.documentElement`. Each preview is wrapped in
its own error boundary, so one broken definition cannot take the library down with it.

Search filters name, description and category together. Category chips filter alongside it.
Sort is most-recently-updated first. Empty states distinguish "you have nothing yet" from
"nothing matches this search", because those need different offers.

The overlay is a **named region** (`aria-label="Component library"`) rather than a bare
div: it renders on top of the sandbox without unmounting it, so assistive technology and
tests both need a way to scope to this surface instead of matching the page underneath.

### Toolbar

The pill row is replaced by a single "Library" button carrying a count. Every action the
pills offered still exists, on the cards, plus duplicate and export-all.

### Fixed along the way

Composites stack their nodes in a column flex, whose default `align-items: stretch` was
blowing the `inline-block` badge and button primitives out to the component's full width.
Both now set `align-self: flex-start` and `width: fit-content`, which also holds inside
nested containers. This was visible in every composite preview and in exported output.

## Testing

- **Unit**: `identity.test.ts` covers id generation, copy naming against collisions, and
  that duplication deep-clones rather than sharing structure. `component-library.test.tsx`
  covers rendering, search, category filter, sort with missing timestamps, empty states,
  each callback, and a jest-axe pass.
- **E2E** (`e2e/component-library.spec.ts`): listing order, search across all three fields,
  duplicate surviving a reload, delete, edit opening the builder, and export-all's
  filename. Queries are scoped to the library region because the sandbox is still rendered
  behind the overlay.
- The Phase A e2e specs were updated to reach Edit through the library rather than the
  removed pills.

## Out of scope

Nested containers and variants (Phase C). Delete confirmation - the pills deleted
immediately and this matches that; there is no dialog primitive to build it on yet.
Editing categories anywhere but the builder. Virtualization, which is unnecessary at tens
of components. Moving storage off `localStorage`.
