import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  registerComposite,
  unregisterComposite,
  subscribeToComposites,
  getCompositeVersion,
  getCompositeItem,
} from "@/lib/registry/composite-registry";
import type { CompositeDefinition } from "@/lib/composite/types";

const def = (id: string, name = "Price Tag"): CompositeDefinition => ({
  id,
  name,
  version: "1.0",
  nodes: [{ id: "n1", type: "heading", props: { text: "Hi", level: "h2" } }],
  propBindings: [
    {
      propKey: "title",
      label: "Title",
      type: "string",
      required: true,
      targetPath: [0, "props", "text"],
    },
  ],
});

const Dummy = () => null;

describe("composite registry as an observable store", () => {
  beforeEach(() => {
    // Leave no registrations behind between tests.
    unregisterComposite("custom_a");
    unregisterComposite("custom_b");
  });

  it("notifies subscribers when a composite is registered", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToComposites(listener);

    registerComposite(def("custom_a"), Dummy);

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("notifies subscribers when a composite is unregistered", () => {
    registerComposite(def("custom_a"), Dummy);
    const listener = vi.fn();
    const unsubscribe = subscribeToComposites(listener);

    unregisterComposite("custom_a");

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("advances the version on every mutation so memo dependencies change", () => {
    const before = getCompositeVersion();

    registerComposite(def("custom_a"), Dummy);
    const afterRegister = getCompositeVersion();

    unregisterComposite("custom_a");
    const afterUnregister = getCompositeVersion();

    expect(afterRegister).toBeGreaterThan(before);
    expect(afterUnregister).toBeGreaterThan(afterRegister);
  });

  it("returns a stable version when nothing mutates", () => {
    // useSyncExternalStore re-renders forever if the snapshot is not referentially stable.
    const a = getCompositeVersion();
    const b = getCompositeVersion();
    expect(a).toBe(b);
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToComposites(listener);
    unsubscribe();

    registerComposite(def("custom_a"), Dummy);

    expect(listener).not.toHaveBeenCalled();
  });

  it("still registers the component so it can be looked up", () => {
    registerComposite(def("custom_b", "Price Tag"), Dummy);
    const item = getCompositeItem("custom_b");

    expect(item).toBeDefined();
    expect(item?.metadata.name).toBe("Price Tag");
  });
});
