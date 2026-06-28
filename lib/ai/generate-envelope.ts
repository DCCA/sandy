/**
 * Prompt-to-envelope generation core.
 *
 * Drives the Claude Code headless CLI (`claude -p`) to produce a Sandy Page
 * envelope from a natural-language prompt, then re-validates the result through
 * the existing render gate (`validatePage`). Generation produces DATA only — it
 * never bypasses the registry-lookup → Zod-validate → render boundary.
 *
 * Auth uses the user's Claude subscription via the Claude Code CLI (stored login
 * or `CLAUDE_CODE_OAUTH_TOKEN`); no metered API key is used. This makes the
 * feature local-only — it is unavailable wherever the `claude` binary / login is
 * absent (e.g. a deployed Vercel build).
 */
import { execFile, execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { toJSONSchema } from "zod";
import { getRegistryKeys, getRegistryItem } from "@/lib/registry";
import { iconNames } from "@/lib/icons";
import { validatePage, PAGE_VERSION } from "@/lib/sandbox/validate";
import type { PageValidationResult } from "@/lib/registry/types";

type JsonSchemaNode = {
  type?: string;
  enum?: unknown[];
  properties?: Record<string, JsonSchemaNode>;
  required?: string[];
  items?: JsonSchemaNode;
};

export type ComponentCatalogEntry = {
  key: string;
  description?: string;
  schema: JsonSchemaNode;
};

/**
 * Build a catalog of every renderable component from the live registry. Field
 * shapes come from each component's own Zod schema (via `toJSONSchema`) so the
 * model is told the exact prop names, types, enums, and array item types.
 */
export function buildComponentCatalog(): ComponentCatalogEntry[] {
  return getRegistryKeys().map((key) => {
    const item = getRegistryItem(key);
    return {
      key,
      description: item?.metadata.description,
      schema: item ? (toJSONSchema(item.schema) as JsonSchemaNode) : { type: "object" },
    };
  });
}

/** Compact type description for a single JSON Schema node. */
function describeType(node: JsonSchemaNode): string {
  if (node.enum && node.enum.length > 0) return `enum[${node.enum.join("|")}]`;
  switch (node.type) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return `[${node.items ? describeType(node.items) : "any"}]`;
    case "object":
      return `{ ${describeObject(node)} }`;
    default:
      return node.type ?? "any";
  }
}

/** Render an object node's properties as `name*:type` (\* marks required). */
function describeObject(node: JsonSchemaNode): string {
  if (!node.properties) return "";
  const required = new Set(node.required ?? []);
  return Object.entries(node.properties)
    .map(([key, child]) => `${key}${required.has(key) ? "*" : ""}:${describeType(child)}`)
    .join(", ");
}

/** Render the catalog as compact text for the model (one line per component). */
export function formatCatalog(catalog: ComponentCatalogEntry[]): string {
  return catalog
    .map((entry) => {
      const desc = entry.description ? ` — ${entry.description}` : "";
      const props = describeObject(entry.schema) || "(no props)";
      return `- ${entry.key}${desc}\n  props: { ${props} }`;
    })
    .join("\n");
}

/**
 * JSON Schema (for the CLI `--json-schema` flag) constraining output to a Page
 * envelope whose section `component` is one of the registered keys. `props` is
 * left open here — exact per-component shapes are described in the system prompt,
 * and the hard enforcement is `validatePage` at render time.
 */
export function buildGenerationSchema(keys: string[] = getRegistryKeys()): Record<string, unknown> {
  return {
    type: "object",
    properties: {
      version: { type: "string" },
      theme: {
        type: "object",
        properties: {
          brand: { type: "string" },
          mode: { type: "string", enum: ["light", "dark"] },
        },
        required: ["brand", "mode"],
        additionalProperties: false,
      },
      meta: {
        type: "object",
        properties: {
          viewport: { type: "string", enum: ["mobile", "tablet", "desktop"] },
          locale: { type: "string" },
        },
        additionalProperties: false,
      },
      sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            component: { type: "string", enum: keys },
            props: { type: "object" },
          },
          required: ["id", "component", "props"],
          additionalProperties: false,
        },
      },
    },
    required: ["version", "sections"],
    additionalProperties: false,
  };
}

/** The system prompt: output rules plus the per-component field catalog. */
export function buildSystemPrompt(
  catalog: ComponentCatalogEntry[] = buildComponentCatalog(),
): string {
  return [
    `You generate a Sandy Page envelope and output ONLY that JSON (no prose).`,
    `Shape: { "version": "${PAGE_VERSION}", "theme"?: { "brand": string, "mode": "light"|"dark" }, "meta"?: { "viewport"?: "mobile"|"tablet"|"desktop", "locale"?: string }, "sections": [ { "id": string, "component": string, "props": object } ] }.`,
    `Rules:`,
    `- version MUST be "${PAGE_VERSION}".`,
    `- Each section id is unique (e.g. "sec_1", "sec_2", ...).`,
    `- component MUST be one of the catalog keys below (exact spelling).`,
    `- props MUST use ONLY the field names listed for that component, with the given types. "*" marks a required field. Do not invent extra fields.`,
    `- Any "icon" field MUST be one of: ${iconNames.join(", ")}. Do not invent icon names (unknown icons render as raw text).`,
    `- Choose components and content that best satisfy the user's request; order sections sensibly.`,
    ``,
    `COMPONENT CATALOG:`,
    formatCatalog(catalog),
  ].join("\n");
}

/** Runs the Claude CLI and returns raw stdout. Injectable for tests. */
export type ClaudeRunner = (input: {
  prompt: string;
  schema: Record<string, unknown>;
  systemPrompt: string;
  model?: string;
  signal?: AbortSignal;
}) => Promise<string>;

/** Build the `claude` CLI argv. The prompt is placed after `--` so it is always
 * a positional, even if it starts with a dash (otherwise the CLI parses it as a
 * flag — both a failure mode and an argument-injection surface). */
export function buildClaudeArgs(input: {
  prompt: string;
  schema: Record<string, unknown>;
  systemPrompt: string;
  model?: string;
}): string[] {
  const args = [
    "-p",
    "--output-format",
    "json",
    "--json-schema",
    JSON.stringify(input.schema),
    "--append-system-prompt",
    input.systemPrompt,
  ];
  if (input.model) args.push("--model", input.model);
  args.push("--", input.prompt);
  return args;
}

/** Default runner: spawns `claude -p ... --output-format json --json-schema ...`. */
export const runClaudeCli: ClaudeRunner = ({ prompt, schema, systemPrompt, model, signal }) => {
  const args = buildClaudeArgs({ prompt, schema, systemPrompt, model });

  return new Promise<string>((resolve, reject) => {
    execFile(
      "claude",
      args,
      // Run in a neutral cwd so the host repo's .claude config/hooks don't apply.
      { cwd: tmpdir(), env: process.env, timeout: 120_000, maxBuffer: 16 * 1024 * 1024, signal },
      (error, stdout) => {
        if (error) {
          // The raw error embeds the full command line (system prompt) and the
          // subprocess stderr — log it server-side, surface a generic message.
          console.error("[generate] claude CLI failed:", error);
          reject(new Error("The generation process failed. Check the server logs."));
          return;
        }
        resolve(stdout);
      },
    );
  });
};

type ClaudeResultEnvelope = {
  is_error?: boolean;
  subtype?: string;
  result?: string;
  structured_output?: unknown;
  api_error_status?: unknown;
};

/** Parse the CLI's `--output-format json` payload into a Page candidate. */
export function parseClaudeResult(
  raw: string,
): { ok: true; page: unknown } | { ok: false; error: string } {
  let envelope: ClaudeResultEnvelope;
  try {
    envelope = JSON.parse(raw) as ClaudeResultEnvelope;
  } catch {
    return { ok: false, error: "Could not parse the generator output." };
  }

  if (envelope.is_error || (envelope.subtype && envelope.subtype !== "success")) {
    const detail =
      typeof envelope.result === "string" && envelope.result.length > 0
        ? envelope.result
        : (envelope.subtype ?? "unknown error");
    return { ok: false, error: `Generation failed: ${detail}` };
  }

  if (envelope.structured_output !== undefined && envelope.structured_output !== null) {
    return { ok: true, page: envelope.structured_output };
  }

  if (typeof envelope.result === "string") {
    try {
      return { ok: true, page: JSON.parse(envelope.result) };
    } catch {
      return { ok: false, error: "Generator returned text that was not valid JSON." };
    }
  }

  return { ok: false, error: "Generator returned no structured output." };
}

export type GenerateResult = { page: unknown; validation: PageValidationResult };

/** End-to-end: prompt → CLI → parse → re-validate. */
export async function generateEnvelope(
  userPrompt: string,
  opts: { runner?: ClaudeRunner; model?: string; signal?: AbortSignal } = {},
): Promise<GenerateResult> {
  const runner = opts.runner ?? runClaudeCli;
  const catalog = buildComponentCatalog();
  const schema = buildGenerationSchema();
  const systemPrompt = buildSystemPrompt(catalog);

  const raw = await runner({
    prompt: userPrompt,
    schema,
    systemPrompt,
    model: opts.model ?? process.env.SANDY_GENERATE_MODEL,
    signal: opts.signal,
  });

  const parsed = parseClaudeResult(raw);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  const validation = validatePage(parsed.page);
  return { page: parsed.page, validation };
}

let availableCache: boolean | undefined;

/** Whether prompt generation can run here (the `claude` CLI is reachable). */
export function isGenerationAvailable(): boolean {
  if (availableCache !== undefined) return availableCache;
  try {
    const locator = process.platform === "win32" ? "where" : "which";
    execFileSync(locator, ["claude"], { stdio: "ignore" });
    availableCache = true;
  } catch {
    availableCache = Boolean(process.env.CLAUDE_CODE_OAUTH_TOKEN);
  }
  return availableCache;
}
