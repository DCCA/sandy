import { toJSONSchema } from "zod";
import type { z } from "zod";

export type FieldDescriptor =
  | {
      kind: "string";
      key: string;
      label: string;
      required: boolean;
      default?: string;
      enum?: string[];
    }
  | { kind: "boolean"; key: string; label: string; required: boolean; default?: boolean }
  | { kind: "number"; key: string; label: string; required: boolean; default?: number }
  | { kind: "object"; key: string; label: string; required: boolean; fields: FieldDescriptor[] }
  | {
      kind: "array";
      key: string;
      label: string;
      required: boolean;
      itemFields: FieldDescriptor[];
      minItems?: number;
      maxItems?: number;
    };

type JSONSchemaProperty = {
  type?: string;
  enum?: string[];
  default?: unknown;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  items?: JSONSchemaProperty;
  minItems?: number;
  maxItems?: number;
  additionalProperties?: boolean;
};

type JSONSchemaRoot = JSONSchemaProperty & {
  $schema?: string;
};

function keyToLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function propertyToField(
  key: string,
  prop: JSONSchemaProperty,
  required: boolean,
): FieldDescriptor | null {
  if (prop.type === "boolean") {
    return {
      kind: "boolean",
      key,
      label: keyToLabel(key),
      required,
      default: typeof prop.default === "boolean" ? prop.default : undefined,
    };
  }

  if (prop.type === "number" || prop.type === "integer") {
    return {
      kind: "number",
      key,
      label: keyToLabel(key),
      required,
      default: typeof prop.default === "number" ? prop.default : undefined,
    };
  }

  if (prop.type === "string") {
    if (prop.enum && prop.enum.length > 0) {
      return {
        kind: "string",
        key,
        label: keyToLabel(key),
        required,
        default: typeof prop.default === "string" ? prop.default : undefined,
        enum: prop.enum,
      };
    }
    return {
      kind: "string",
      key,
      label: keyToLabel(key),
      required,
      default: typeof prop.default === "string" ? prop.default : undefined,
    };
  }

  if (prop.type === "object" && prop.properties) {
    const fields = objectPropertiesToFields(prop.properties, prop.required ?? []);
    return {
      kind: "object",
      key,
      label: keyToLabel(key),
      required,
      fields,
    };
  }

  if (prop.type === "array" && prop.items) {
    const itemFields =
      prop.items.type === "object" && prop.items.properties
        ? objectPropertiesToFields(prop.items.properties, prop.items.required ?? [])
        : [];
    return {
      kind: "array",
      key,
      label: keyToLabel(key),
      required,
      itemFields,
      minItems: prop.minItems,
      maxItems: prop.maxItems,
    };
  }

  // Fallback: treat unknown types as string
  return {
    kind: "string",
    key,
    label: keyToLabel(key),
    required,
  };
}

function objectPropertiesToFields(
  properties: Record<string, JSONSchemaProperty>,
  requiredKeys: string[],
): FieldDescriptor[] {
  const fields: FieldDescriptor[] = [];
  for (const [key, prop] of Object.entries(properties)) {
    const isRequired = requiredKeys.includes(key);
    const field = propertyToField(key, prop, isRequired);
    if (field) fields.push(field);
  }
  return fields;
}

export function schemaToFields(schema: z.ZodType): FieldDescriptor[] {
  try {
    const jsonSchema = toJSONSchema(schema) as JSONSchemaRoot;
    if (jsonSchema.type !== "object" || !jsonSchema.properties) {
      return [];
    }
    return objectPropertiesToFields(jsonSchema.properties, jsonSchema.required ?? []);
  } catch {
    return [];
  }
}
