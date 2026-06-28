import { describe, it, expect } from "vitest";
import {
  buildComponentCatalog,
  buildGenerationSchema,
  buildSystemPrompt,
  formatCatalog,
  parseClaudeResult,
  generateEnvelope,
  isGenerationAvailable,
  buildClaudeArgs,
  type ClaudeRunner,
} from "@/lib/ai/generate-envelope";
import { getRegistryKeys } from "@/lib/registry";
import { iconNames } from "@/lib/icons";

describe("buildComponentCatalog", () => {
  it("covers every registered component key", () => {
    const catalog = buildComponentCatalog();
    expect(catalog.map((c) => c.key).sort()).toEqual([...getRegistryKeys()].sort());
  });

  it("derives real field names from each component schema", () => {
    const catalog = buildComponentCatalog();
    const accountHeader = catalog.find((c) => c.key === "AccountHeader");
    const props = accountHeader?.schema.properties ?? {};
    expect(Object.keys(props)).toContain("greeting");
    expect(Object.keys(props)).toContain("userName");
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

  it("constrains icon fields to the supported icon set", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Any "icon" field MUST be one of');
    for (const name of iconNames) expect(prompt).toContain(name);
  });

  it("renders arrays of primitives with their item type (regression: not [{}])", () => {
    // PricingTable.tiers[].features is string[]; the model must be told [string],
    // otherwise it emits objects and fails validation.
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/features\*?:\[string\]/);
    expect(prompt).not.toContain("features*:[{  }]");
  });

  it("marks required fields, renders enums and array item types", () => {
    const text = formatCatalog([
      {
        key: "Demo",
        description: "demo",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            variant: { type: "string", enum: ["a", "b"] },
            tags: { type: "array", items: { type: "string" } },
          },
          required: ["title"],
        },
      },
    ]);
    expect(text).toContain("title*:string");
    expect(text).toContain("variant:enum[a|b]");
    expect(text).toContain("tags:[string]");
  });
});

describe("buildClaudeArgs", () => {
  const base = { schema: { type: "object" }, systemPrompt: "sys" };

  it("places the prompt as a positional after `--`", () => {
    const args = buildClaudeArgs({ ...base, prompt: "make a hero" });
    expect(args[args.length - 1]).toBe("make a hero");
    expect(args[args.length - 2]).toBe("--");
  });

  it("keeps a dash-leading prompt as the final positional (injection guard)", () => {
    const args = buildClaudeArgs({ ...base, prompt: "--dangerously-skip-permissions" });
    // It must come after the `--` terminator, never be parsed as a flag.
    expect(args[args.length - 1]).toBe("--dangerously-skip-permissions");
    expect(args.indexOf("--")).toBe(args.length - 2);
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
