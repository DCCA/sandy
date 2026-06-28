import { describe, it, expect } from "vitest";
import { validatePage, isLegacyEnvelope, migrateEnvelopeToPage } from "@/lib/sandbox/validate";

describe("isLegacyEnvelope", () => {
  it("detects legacy envelope format", () => {
    expect(
      isLegacyEnvelope({
        component: "HeroBanner",
        version: "1.0",
        props: { title: "Hello" },
      }),
    ).toBe(true);
  });

  it("rejects page format", () => {
    expect(
      isLegacyEnvelope({
        version: "2.0",
        sections: [{ id: "sec_1", component: "HeroBanner", props: {} }],
      }),
    ).toBe(false);
  });

  it("rejects null", () => {
    expect(isLegacyEnvelope(null)).toBe(false);
  });

  it("rejects non-object", () => {
    expect(isLegacyEnvelope("string")).toBe(false);
  });

  it("rejects object without component field", () => {
    expect(isLegacyEnvelope({ version: "1.0", props: {} })).toBe(false);
  });
});

describe("migrateEnvelopeToPage", () => {
  it("converts envelope to page format", () => {
    const envelope = {
      component: "HeroBanner",
      version: "1.0",
      props: { title: "Hello" },
      theme: { brand: "default", mode: "light" as const },
      meta: { viewport: "mobile" as const },
    };

    const page = migrateEnvelopeToPage(envelope);
    expect(page.version).toBe("2.0");
    expect(page.theme).toEqual({ brand: "default", mode: "light" });
    expect(page.meta).toEqual({ viewport: "mobile" });
    expect(page.sections).toHaveLength(1);
    expect(page.sections[0]).toEqual({
      id: "sec_1",
      component: "HeroBanner",
      props: { title: "Hello" },
    });
  });

  it("preserves undefined theme and meta", () => {
    const envelope = {
      component: "HeroBanner",
      version: "1.0",
      props: { title: "Hello" },
    };

    const page = migrateEnvelopeToPage(envelope);
    expect(page.theme).toBeUndefined();
    expect(page.meta).toBeUndefined();
  });
});

describe("validatePage", () => {
  it("validates a correct page", () => {
    const result = validatePage({
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      meta: { viewport: "mobile" },
      sections: [
        {
          id: "sec_1",
          component: "HeroBanner",
          props: { title: "Hello" },
        },
      ],
    });
    expect(result.success).toBe(true);
    expect(result.sections).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects invalid page structure", () => {
    const result = validatePage({ invalid: true });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("reports unknown component", () => {
    const result = validatePage({
      version: "2.0",
      sections: [{ id: "sec_1", component: "NonExistent", props: {} }],
    });
    expect(result.success).toBe(false);
    expect(result.errors[0].messages[0]).toContain("Unknown component");
  });

  it("reports invalid props for known component", () => {
    const result = validatePage({
      version: "2.0",
      sections: [{ id: "sec_1", component: "HeroBanner", props: {} }],
    });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("validates multiple sections independently", () => {
    const result = validatePage({
      version: "2.0",
      sections: [
        { id: "sec_1", component: "HeroBanner", props: { title: "Valid" } },
        { id: "sec_2", component: "HeroBanner", props: {} },
      ],
    });
    expect(result.success).toBe(false);
    expect(result.sections).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });

  it("builds ordered render items with in-place error placeholders", () => {
    const result = validatePage({
      version: "2.0",
      sections: [
        { id: "sec_1", component: "HeroBanner", props: { title: "Valid" } },
        { id: "sec_2", component: "NonExistent", props: {} },
        { id: "sec_3", component: "HeroBanner", props: { title: "Also valid" } },
      ],
    });
    // Order preserved across valid + error items (graceful degradation).
    expect(result.renderItems.map((it) => it.kind)).toEqual(["ok", "error", "ok"]);
    const errorItem = result.renderItems[1];
    expect(errorItem.kind).toBe("error");
    if (errorItem.kind === "error") {
      expect(errorItem.id).toBe("sec_2");
      expect(errorItem.componentName).toBe("NonExistent");
      expect(errorItem.messages[0]).toContain("Unknown component");
    }
    // valid sections still exposed separately for export
    expect(result.sections).toHaveLength(2);
  });

  it("warns about an unknown major version without failing structurally", () => {
    const result = validatePage({
      version: "99.0",
      sections: [{ id: "sec_1", component: "HeroBanner", props: { title: "Hi" } }],
    });
    expect(result.errors.some((e) => e.messages[0].includes("Unknown page version"))).toBe(true);
    // the section itself is still valid
    expect(result.sections).toHaveLength(1);
  });
});
