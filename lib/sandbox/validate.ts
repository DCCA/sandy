import { EnvelopeSchema, PageSchema } from "@/lib/schemas/envelope";
import { getRegistryItem } from "@/lib/registry";
import type {
  Envelope,
  Page,
  SandboxError,
  SectionRenderItem,
  ValidatedSection,
  PageValidationResult,
} from "@/lib/registry/types";
import type { z } from "zod";

/** Current canonical page-envelope version. */
export const PAGE_VERSION = "2.0";
/** Deprecated single-component envelope version (auto-migrated to a Page). */
export const ENVELOPE_VERSION = "1.0";
/** Major versions this build knows how to render. */
const SUPPORTED_MAJORS = new Set(["1", "2"]);

let warnedLegacyEnvelope = false;

function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "root";
    return `${path}: ${issue.message}`;
  });
}

export function validateEnvelope(
  data: unknown,
): { success: true; data: Envelope } | { success: false; errors: string[] } {
  const result = EnvelopeSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as Envelope };
  }
  return { success: false, errors: formatZodErrors(result.error) };
}

export function validateComponentProps(
  schema: z.ZodType,
  props: unknown,
): { success: true; data: unknown } | { success: false; errors: string[] } {
  const result = schema.safeParse(props);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error as z.ZodError),
  };
}

export function isLegacyEnvelope(data: unknown): data is Envelope {
  return (
    typeof data === "object" &&
    data !== null &&
    "component" in data &&
    typeof (data as Record<string, unknown>).component === "string" &&
    !("sections" in data)
  );
}

export function migrateEnvelopeToPage(envelope: Envelope): Page {
  if (!warnedLegacyEnvelope && typeof console !== "undefined") {
    warnedLegacyEnvelope = true;
    console.warn(
      `[sandy] Legacy v${ENVELOPE_VERSION} envelope detected and auto-migrated to a v${PAGE_VERSION} page. ` +
        `The single-component envelope format is deprecated; use the { version: "${PAGE_VERSION}", sections: [...] } page format.`,
    );
  }
  return {
    version: PAGE_VERSION,
    theme: envelope.theme,
    meta: envelope.meta,
    sections: [
      {
        id: "sec_1",
        component: envelope.component,
        props: envelope.props,
      },
    ],
  };
}

/** Returns a non-fatal warning if a page declares a major version this build doesn't know. */
function versionWarning(version: string | undefined): SandboxError | null {
  if (!version) return null;
  const major = version.split(".")[0];
  if (SUPPORTED_MAJORS.has(major)) return null;
  return {
    type: "validation",
    messages: [
      `Unknown page version "${version}". This build supports major versions ${[...SUPPORTED_MAJORS].join(", ")}; rendering may be incomplete.`,
    ],
  };
}

export function validatePage(data: unknown): PageValidationResult {
  const errors: SandboxError[] = [];
  const validSections: ValidatedSection[] = [];
  const renderItems: SectionRenderItem[] = [];

  const pageResult = PageSchema.safeParse(data);
  if (!pageResult.success) {
    errors.push({ type: "validation", messages: formatZodErrors(pageResult.error) });
    return { success: false, sections: [], renderItems: [], errors };
  }

  const page = pageResult.data as Page;
  let hasErrors = false;

  const versionWarn = versionWarning(page.version);
  if (versionWarn) errors.push(versionWarn);

  for (let i = 0; i < page.sections.length; i++) {
    const section = page.sections[i];
    const sectionLabel = `Section ${i + 1} (${section.component})`;

    const item = getRegistryItem(section.component);
    if (!item) {
      const messages = [`Unknown component: "${section.component}"`];
      errors.push({
        type: "validation",
        messages,
        sectionId: section.id,
        sectionLabel,
      });
      renderItems.push({
        kind: "error",
        id: section.id,
        componentName: section.component,
        messages,
      });
      hasErrors = true;
      continue;
    }

    const propsResult = validateComponentProps(item.schema, section.props);
    if (!propsResult.success) {
      errors.push({
        type: "validation",
        messages: propsResult.errors,
        sectionId: section.id,
        sectionLabel,
      });
      renderItems.push({
        kind: "error",
        id: section.id,
        componentName: section.component,
        messages: propsResult.errors,
      });
      hasErrors = true;
      continue;
    }

    const validated: ValidatedSection = {
      id: section.id,
      component: item.component,
      componentName: section.component,
      props: propsResult.data as Record<string, unknown>,
    };
    validSections.push(validated);
    renderItems.push({ kind: "ok", section: validated });
  }

  return {
    success: !hasErrors,
    sections: validSections,
    renderItems,
    errors,
  };
}
