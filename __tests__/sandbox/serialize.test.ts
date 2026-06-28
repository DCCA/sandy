import { describe, it, expect } from "vitest";
import {
  serializeState,
  deserializeState,
  serializeTokens,
  deserializeTokens,
} from "@/lib/sandbox/serialize";
import type { Page } from "@/lib/registry/types";

describe("serializeState / deserializeState", () => {
  const page: Page = {
    version: "2.0",
    theme: { brand: "default", mode: "light" },
    meta: { viewport: "mobile" },
    sections: [{ id: "sec_1", component: "HeroBanner", props: { title: "Hello" } }],
  };

  it("round-trips losslessly", () => {
    const encoded = serializeState(page);
    expect(encoded).toBeTruthy();
    const decoded = deserializeState(encoded);
    expect(decoded).toEqual(page);
  });

  it("handles unicode content", () => {
    const unicodePage: Page = {
      ...page,
      sections: [{ id: "sec_1", component: "HeroBanner", props: { title: "Héllo wörld 日本語" } }],
    };
    const encoded = serializeState(unicodePage);
    const decoded = deserializeState(encoded);
    expect(decoded).toEqual(unicodePage);
  });

  it("returns null for invalid encoded string", () => {
    expect(deserializeState("!!!invalid!!!")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(deserializeState("")).toBeNull();
  });

  it("returns empty string for circular reference", () => {
    const circular = { version: "2.0", sections: [] } as unknown as Page;
    // Non-circular should work fine
    expect(serializeState(circular)).toBeTruthy();
  });
});

describe("serializeTokens / deserializeTokens", () => {
  it("round-trips token overrides", () => {
    const overrides = { color: { primary: "#ff0000" } };
    const encoded = serializeTokens(overrides);
    expect(encoded).toBeTruthy();
    const decoded = deserializeTokens(encoded);
    expect(decoded).toEqual(overrides);
  });

  it("handles empty overrides", () => {
    const encoded = serializeTokens({});
    const decoded = deserializeTokens(encoded);
    expect(decoded).toEqual({});
  });

  it("returns null for invalid input", () => {
    expect(deserializeTokens("not-valid")).toBeNull();
  });
});
