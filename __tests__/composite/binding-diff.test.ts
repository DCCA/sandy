import { describe, it, expect } from "vitest";
import { diffBindings, isBreaking } from "@/lib/composite/binding-diff";
import { generateSchemaFromBindings } from "@/lib/composite/schema-gen";
import type { PropBinding } from "@/lib/composite/types";

// Bindings as the builder actually creates them: it always seeds `default: ""` and
// exposes no way to edit it (components/sandbox/builder-bindings.tsx). Tests that omit
// `default` model a shape the UI never produces, and would hide false positives.
const binding = (propKey: string, over: Partial<PropBinding> = {}): PropBinding => ({
  propKey,
  label: propKey,
  type: "string",
  default: "",
  required: true,
  targetPath: [0, "props", "text"],
  ...over,
});

/** Ground truth: would the regenerated schema reject what a section already has saved? */
function schemaRejects(bindings: PropBinding[], props: Record<string, unknown>): boolean {
  return !generateSchemaFromBindings(bindings).safeParse(props).success;
}

describe("diffBindings", () => {
  it("flags a removed binding, whose saved value stops being applied", () => {
    const impact = diffBindings([binding("title"), binding("subtitle")], [binding("title")]);

    expect(impact.droppedProps).toEqual(["subtitle"]);
    expect(isBreaking(impact)).toBe(true);
  });

  it("treats a rename as both a drop and a new requirement", () => {
    const prev = [binding("title", { default: undefined })];
    const next = [binding("heading", { default: undefined })];
    const impact = diffBindings(prev, next);

    expect(impact.droppedProps).toEqual(["title"]);
    expect(impact.newRequiredProps).toEqual(["heading"]);
    expect(schemaRejects(next, { title: "Hi" })).toBe(true);
  });

  it("does not flag an added optional binding", () => {
    const impact = diffBindings(
      [binding("title")],
      [binding("title"), binding("note", { required: false })],
    );

    expect(isBreaking(impact)).toBe(false);
  });

  it("does not flag relaxing a binding from required to optional", () => {
    const impact = diffBindings([binding("title")], [binding("title", { required: false })]);

    expect(isBreaking(impact)).toBe(false);
  });

  it("does not claim breakage when a required binding carries a usable default", () => {
    // The builder seeds default: "" on every string binding, so the schema is
    // z.string().default("") - which accepts a section that omits the prop entirely.
    const next = [binding("title"), binding("price")];
    const impact = diffBindings([binding("title")], next);

    expect(schemaRejects(next, { title: "Hi" })).toBe(false);
    expect(isBreaking(impact)).toBe(false);
  });

  it("flags a required binding with no usable default", () => {
    // Switching the type to number leaves default: "" unusable, so no default attaches.
    const next = [binding("title"), binding("count", { type: "number" })];
    const impact = diffBindings([binding("title")], next);

    expect(schemaRejects(next, { title: "Hi" })).toBe(true);
    expect(impact.newRequiredProps).toEqual(["count"]);
  });

  it("flags an existing optional binding being tightened to required", () => {
    const prev = [binding("count", { type: "number", required: false })];
    const next = [binding("count", { type: "number", required: true })];
    const impact = diffBindings(prev, next);

    expect(schemaRejects(next, {})).toBe(true);
    expect(impact.newRequiredProps).toEqual(["count"]);
  });

  it("flags a type change that invalidates saved values", () => {
    const prev = [binding("count")];
    const next = [binding("count", { type: "number" })];
    const impact = diffBindings(prev, next);

    expect(schemaRejects(next, { count: "5" })).toBe(true);
    expect(impact.retypedProps).toEqual(["count"]);
  });

  it("flags a narrowed enum that invalidates saved values", () => {
    const prev = [binding("variant", { type: "enum", enumValues: ["a", "b", "c"] })];
    const next = [binding("variant", { type: "enum", enumValues: ["a", "b"] })];
    const impact = diffBindings(prev, next);

    expect(schemaRejects(next, { variant: "c" })).toBe(true);
    expect(impact.retypedProps).toEqual(["variant"]);
  });

  it("does not flag a widened enum", () => {
    const prev = [binding("variant", { type: "enum", enumValues: ["a"] })];
    const next = [binding("variant", { type: "enum", enumValues: ["a", "b"] })];

    expect(isBreaking(diffBindings(prev, next))).toBe(false);
  });

  it("does not flag an unchanged binding set", () => {
    expect(isBreaking(diffBindings([binding("title")], [binding("title")]))).toBe(false);
  });
});
