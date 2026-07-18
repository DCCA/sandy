import type { PropBinding } from "./types";

export type BindingImpact = {
  /** Props that are no longer bound, so their saved value stops being applied. */
  droppedProps: string[];
  /** Props that existing sections must now supply, so those sections fail validation. */
  newRequiredProps: string[];
  /** Props whose accepted values changed, so a saved value may no longer validate. */
  retypedProps: string[];
};

/**
 * Whether generateSchemaFromBindings would attach a usable `.default()` for this binding.
 * It only applies a default when the value's runtime type matches the declared type, and
 * an enum with no values degrades to a bare z.string() with no default at all.
 */
function hasUsableDefault(b: PropBinding): boolean {
  switch (b.type) {
    case "boolean":
      return typeof b.default === "boolean";
    case "number":
      return typeof b.default === "number";
    case "enum":
      return (b.enumValues?.length ?? 0) > 0 && typeof b.default === "string";
    default:
      return typeof b.default === "string";
  }
}

/**
 * Whether the generated schema would reject a section that omits this prop. A binding
 * flagged "required" in the builder is still satisfied by a default, so requiredness
 * alone does not mean an existing section breaks.
 */
function requiresValue(b: PropBinding): boolean {
  return b.required && !hasUsableDefault(b);
}

/** Whether saved values that were valid under `prev` might be rejected under `next`. */
function acceptsFewerValues(prev: PropBinding, next: PropBinding): boolean {
  if (prev.type !== next.type) return true;
  if (next.type !== "enum") return false;

  const nextValues = new Set(next.enumValues ?? []);
  // An enum with no values degrades to a bare string, which accepts strictly more.
  if (nextValues.size === 0) return false;
  return (prev.enumValues ?? []).some((v) => !nextValues.has(v));
}

/**
 * Compare a composite's prop bindings before and after an edit, to find what the change
 * does to sections already using it. Mirrors generateSchemaFromBindings, because the
 * question being answered is "would the regenerated schema still accept what's saved".
 * False negatives are the dangerous direction here: a missed case means silent breakage.
 */
export function diffBindings(prev: PropBinding[], next: PropBinding[]): BindingImpact {
  const nextByKey = new Map(next.map((b) => [b.propKey, b]));
  const prevByKey = new Map(prev.map((b) => [b.propKey, b]));

  const droppedProps: string[] = [];
  const newRequiredProps: string[] = [];
  const retypedProps: string[] = [];

  for (const before of prev) {
    if (!nextByKey.has(before.propKey)) droppedProps.push(before.propKey);
  }

  for (const after of next) {
    const before = prevByKey.get(after.propKey);

    if (!before) {
      // Newly exposed prop that existing sections cannot possibly supply.
      if (requiresValue(after)) newRequiredProps.push(after.propKey);
      continue;
    }

    // Tightened in place: optional (or defaulted) becomes genuinely mandatory.
    if (!requiresValue(before) && requiresValue(after)) {
      newRequiredProps.push(after.propKey);
    }

    if (acceptsFewerValues(before, after)) retypedProps.push(after.propKey);
  }

  return { droppedProps, newRequiredProps, retypedProps };
}

export function isBreaking(impact: BindingImpact): boolean {
  return (
    impact.droppedProps.length > 0 ||
    impact.newRequiredProps.length > 0 ||
    impact.retypedProps.length > 0
  );
}
