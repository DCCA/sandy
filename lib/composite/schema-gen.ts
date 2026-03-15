import { z } from "zod";
import type { PropBinding } from "./types";

export function generateSchemaFromBindings(bindings: PropBinding[]): z.ZodType {
  const shape: Record<string, z.ZodType> = {};

  for (const binding of bindings) {
    let field: z.ZodType;

    switch (binding.type) {
      case "boolean": {
        const base = z.boolean();
        field = typeof binding.default === "boolean" ? base.default(binding.default) : base;
        break;
      }
      case "number": {
        const base = z.number();
        field = typeof binding.default === "number" ? base.default(binding.default) : base;
        break;
      }
      case "enum": {
        if (binding.enumValues && binding.enumValues.length > 0) {
          const base = z.enum(binding.enumValues);
          field = typeof binding.default === "string" ? base.default(binding.default) : base;
        } else {
          field = z.string();
        }
        break;
      }
      case "string":
      default: {
        const base = z.string();
        field = typeof binding.default === "string" ? base.default(binding.default) : base;
        break;
      }
    }

    if (!binding.required) {
      field = field.optional();
    }

    shape[binding.propKey] = field;
  }

  return z.object(shape);
}
