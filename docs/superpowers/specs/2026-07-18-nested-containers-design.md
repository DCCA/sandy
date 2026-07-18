# Phase C - Raising the component ceiling

_Date: 2026-07-18_
_Status: implemented_

## Context

Third of three phases on making Sandy usable as a daily design-system tool.
[Phase A](./2026-07-18-composite-library-trust-design.md) made the composite library
correct; [Phase B](./2026-07-18-component-library-design.md) gave it a browsing surface.
This phase removes the ceiling on what a composite can express.

## The problem

A composite could only ever be a **flat stack** of primitives. `builder-node-tree.tsx`
carried the comment "display only - nested operations not supported", and it was accurate:

- `handleAddPrimitive` always appended to the top-level `nodes` array, so there was no way
  to put anything inside a container.
- `handleMoveNode`, `handleDeleteNode` and the selection lookup all searched only the
  top-level array, so a nested node could not be selected, reordered, deleted, or have its
  own properties edited.
- The node tree rendered children, but hid every action button on them.

A designer could add a container, watch it render as an empty box, and never put anything
in it. That rules out most real components - a card is a container with a heading and a
body inside it.

## What was already there

The limitation was **only** in the builder UI. Everything underneath already supported
nesting:

- `PrimitiveNode` has `children`, and `ContainerRenderer` renders them.
- `applyBindings` / `setNestedValue` walk arbitrary paths, so a binding can target
  `[0, "children", 1, "props", "text"]`.
- `getBindableTargets` in `builder-bindings.tsx` already recursed into `children`, so the
  binding picker would have offered nested targets the moment any existed.
- The renderer has a `MAX_DEPTH` of 2 and silently drops anything deeper.

So this phase adds no data model change, no migration, and no new persistence concern.

## Design

Tree manipulation moves out of the component and into pure, immutable helpers in
`lib/composite/tree.ts`: `findNode`, `insertNode`, `removeNode`, `moveNode`,
`updateNodeProps`, `depthOf`. Keeping them pure is what makes the recursive cases testable
without rendering anything, and the builder's handlers collapse to one call each.

Two rules are worth stating because they are decisions, not consequences:

**Where a new primitive lands.** If the selected node is a container with room, the new
node goes inside it; otherwise it goes to the top level. The palette states which - "into
selected container" or "at top level" - because the alternative is the user clicking and
finding out. Selecting a non-container retargets it back to the top level.

**How deep nesting can go.** `MAX_NEST_DEPTH` is 2, matching the renderer's `MAX_DEPTH`.
A node the user can build but the renderer refuses to draw is worse than one they cannot
build, so `insertNode` is only offered a container shallower than the ceiling. The tree
test asserts the two constants agree, so moving one without the other fails.

`moveNode` reorders a node **within its own sibling list** only. Dragging across parents is
a different interaction with its own affordances and is not attempted here.

## Testing

- **Unit** (`__tests__/composite/tree.test.ts`, 22 cases): each helper against a fixture
  nested two levels deep - finding, inserting at each level, refusing to nest into a
  non-container, removing a container along with its children, reordering within a parent
  without escaping it, no-ops at list boundaries, and immutability of the input on every
  mutating helper.
- **E2E** (`e2e/nested-containers.spec.ts`): adding into a selected container, the palette
  retargeting as selection changes, nested nodes being deletable, a nested node's own
  properties being editable, and saving a nested component - asserted against the persisted
  definition, so a flattened stack would fail even if the UI looked right.

## Out of scope

Dragging nodes between parents. Nesting beyond the renderer's depth of 2. Wrapping existing
nodes in a new container. Multi-select.
