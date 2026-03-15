import { EnvelopeSchema, PageSchema } from "@/lib/schemas/envelope";
import { getRegistryItem } from "@/lib/registry";
import type {
  Envelope,
  Page,
  SandboxError,
  ValidatedSection,
  PageValidationResult,
} from "@/lib/registry/types";
import type { z } from "zod";

function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "root";
    return `${path}: ${issue.message}`;
  });
}

export function validateEnvelope(
  data: unknown
): { success: true; data: Envelope } | { success: false; errors: string[] } {
  const result = EnvelopeSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as Envelope };
  }
  return { success: false, errors: formatZodErrors(result.error) };
}

export function validateComponentProps(
  schema: z.ZodType,
  props: unknown
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
  return {
    version: "2.0",
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

export function validatePage(data: unknown): PageValidationResult {
  const errors: SandboxError[] = [];
  const validSections: ValidatedSection[] = [];

  const pageResult = PageSchema.safeParse(data);
  if (!pageResult.success) {
    errors.push({ type: "validation", messages: formatZodErrors(pageResult.error) });
    return { success: false, sections: [], errors };
  }

  const page = pageResult.data as Page;
  let hasErrors = false;

  for (let i = 0; i < page.sections.length; i++) {
    const section = page.sections[i];
    const sectionLabel = `Section ${i + 1} (${section.component})`;

    const item = getRegistryItem(section.component);
    if (!item) {
      errors.push({
        type: "validation",
        messages: [`Unknown component: "${section.component}"`],
        sectionId: section.id,
        sectionLabel,
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
      hasErrors = true;
      continue;
    }

    validSections.push({
      id: section.id,
      component: item.component,
      componentName: section.component,
      props: propsResult.data as Record<string, unknown>,
    });
  }

  return {
    success: !hasErrors,
    sections: validSections,
    errors,
  };
}
