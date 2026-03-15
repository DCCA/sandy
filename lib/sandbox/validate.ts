import { EnvelopeSchema } from "@/lib/schemas/envelope";
import type { Envelope, SandboxError, ValidationResult } from "@/lib/registry/types";
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

export function validateFull(
  data: unknown,
  getSchema: (key: string) => z.ZodType | undefined
): ValidationResult {
  const errors: SandboxError[] = [];

  const envelopeResult = validateEnvelope(data);
  if (!envelopeResult.success) {
    errors.push({ type: "validation", messages: envelopeResult.errors });
    return { success: false, errors };
  }

  const envelope = envelopeResult.data;
  const schema = getSchema(envelope.component);
  if (!schema) {
    errors.push({
      type: "validation",
      messages: [`Unknown component: "${envelope.component}"`],
    });
    return { success: false, errors };
  }

  const propsResult = validateComponentProps(schema, envelope.props);
  if (!propsResult.success) {
    errors.push({ type: "validation", messages: propsResult.errors });
    return { success: false, errors };
  }

  return { success: true, data: { ...envelope, props: propsResult.data as Record<string, unknown> } };
}
