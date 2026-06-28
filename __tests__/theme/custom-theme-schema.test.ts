import { describe, it, expect } from "vitest";
import { parseThemeOverrides } from "@/lib/theme/schema";

describe("parseThemeOverrides", () => {
  it("accepts a valid partial override", () => {
    const result = parseThemeOverrides({
      color: { primary: "#ff0000" },
      radius: { md: 10 },
    });
    expect(result).toEqual({ color: { primary: "#ff0000" }, radius: { md: 10 } });
  });

  it("accepts nested typography overrides", () => {
    const result = parseThemeOverrides({ typography: { fontSize: { md: 16 } } });
    expect(result).toEqual({ typography: { fontSize: { md: 16 } } });
  });

  it("rejects wrong value types", () => {
    expect(parseThemeOverrides({ radius: { md: "big" } })).toBeNull();
    expect(parseThemeOverrides({ color: { primary: 123 } })).toBeNull();
  });

  it("rejects unknown categories and keys", () => {
    expect(parseThemeOverrides({ evil: { x: 1 } })).toBeNull();
    expect(parseThemeOverrides({ color: { notAToken: "#fff" } })).toBeNull();
  });

  it("treats an empty object as valid (no overrides)", () => {
    expect(parseThemeOverrides({})).toEqual({});
  });
});
