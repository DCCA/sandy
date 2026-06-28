import { describe, it, expect } from "vitest";
import {
  buildComponentCatalog,
  buildGenerationSchema,
  buildSystemPrompt,
  formatCatalog,
  parseClaudeResult,
  generateEnvelope,
  isGenerationAvailable,
  type ClaudeRunner,
} from "@/lib/ai/generate-envelope";
import { getRegistryKeys } from "@/lib/registry";

describe("buildComponentCatalog", () => {
  it("covers every registered component key", () => {
    const catalog = buildComponentCatalog();
    expect(catalog.map((c) => c.key).sort()).toEqual([...getRegistryKeys()].sort());
  });

  it("derives real field names from each component schema", () => {
    const catalog = buildComponentCatalog();
    const accountHeader = catalog.find((c) => c.key === "AccountHeader");
    const fieldKeys = accountHeader?.fields.map((f) => f.key) ?? [];
    expect(fieldKeys).toContain("greeting");
    expect(fieldKeys).toContain("userName");
  });
});

describe("buildGenerationSchema", () => {
  it("constrains section.component to the registered keys", () => {
    const schema = buildGenerationSchema(["HeroBanner", "Footer"]) as Record<string, never>;
    const componentSchema = (
      schema as never as {
        properties: { sections: { items: { properties: { component: { enum: string[] } } } } };
      }
    ).properties.sections.items.properties.component;
    expect(componentSchema.enum).toEqual(["HeroBanner", "Footer"]);
  });

  it("requires version and sections and keeps props open", () => {
    const schema = buildGenerationSchema() as {
      required: string[];
      properties: { sections: { items: { properties: { props: { type: string } } } } };
    };
    expect(schema.required).toContain("version");
    expect(schema.required).toContain("sections");
    expect(schema.properties.sections.items.properties.props.type).toBe("object");
  });
});

describe("formatCatalog / buildSystemPrompt", () => {
  it("includes component keys, field names, and the version rule", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("AccountHeader");
    expect(prompt).toContain("userName");
    expect(prompt).toContain('"2.0"');
  });

  it("marks required fields and renders enums", () => {
    const text = formatCatalog([
      {
        key: "Demo",
        description: "demo",
        fields: [
          { kind: "string", key: "title", label: "Title", required: true },
          { kind: "string", key: "variant", label: "Variant", required: false, enum: ["a", "b"] },
        ],
      },
    ]);
    expect(text).toContain("title*:string");
    expect(text).toContain("variant:string enum[a|b]");
  });
});

describe("parseClaudeResult", () => {
  it("prefers the parsed structured_output field", () => {
    const page = { version: "2.0", sections: [] };
    const raw = JSON.stringify({ is_error: false, subtype: "success", structured_output: page });
    const result = parseClaudeResult(raw);
    expect(result).toEqual({ ok: true, page });
  });

  it("falls back to parsing the result string", () => {
    const raw = JSON.stringify({
      is_error: false,
      subtype: "success",
      result: '{"version":"2.0","sections":[]}',
    });
    const result = parseClaudeResult(raw);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.page).toEqual({ version: "2.0", sections: [] });
  });

  it("reports an error when the CLI signals failure", () => {
    const raw = JSON.stringify({ is_error: true, subtype: "error", result: "boom" });
    const result = parseClaudeResult(raw);
    expect(result.ok).toBe(false);
  });

  it("reports an error for non-JSON stdout", () => {
    const result = parseClaudeResult("not json");
    expect(result.ok).toBe(false);
  });
});

describe("generateEnvelope", () => {
  const fakeRunner =
    (page: unknown): ClaudeRunner =>
    async () =>
      JSON.stringify({ is_error: false, subtype: "success", structured_output: page });

  it("returns a valid page that passes the render gate", async () => {
    const page = {
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      sections: [
        {
          id: "sec_1",
          component: "HeroBanner",
          props: { title: "Welcome", align: "left" },
        },
      ],
    };
    const result = await generateEnvelope("a hero", { runner: fakeRunner(page) });
    expect(result.page).toEqual(page);
    expect(result.validation.success).toBe(true);
    expect(result.validation.errors).toHaveLength(0);
  });

  it("returns the page with validation errors for bad props (graceful degradation)", async () => {
    const page = {
      version: "2.0",
      sections: [{ id: "sec_1", component: "HeroBanner", props: {} }], // missing required title
    };
    const result = await generateEnvelope("a hero", { runner: fakeRunner(page) });
    expect(result.validation.success).toBe(false);
    expect(result.validation.errors.length).toBeGreaterThan(0);
    // The page is still returned so the editor can show it for the user to fix.
    expect(result.page).toEqual(page);
  });

  it("throws a clear error when generation fails", async () => {
    const runner: ClaudeRunner = async () =>
      JSON.stringify({ is_error: true, subtype: "error", result: "nope" });
    await expect(generateEnvelope("x", { runner })).rejects.toThrow(/Generation failed/);
  });
});

describe("isGenerationAvailable", () => {
  it("returns a boolean without throwing", () => {
    expect(typeof isGenerationAvailable()).toBe("boolean");
  });
});
