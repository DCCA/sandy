export type PrimitiveType =
  "heading" | "paragraph" | "button" | "image" | "spacer" | "divider" | "container" | "badge";

export type PrimitiveNode = {
  id: string;
  type: PrimitiveType;
  props: Record<string, unknown>;
  children?: PrimitiveNode[];
};

export type PropBinding = {
  propKey: string;
  label: string;
  type: "string" | "boolean" | "number" | "enum";
  enumValues?: string[];
  default?: unknown;
  required: boolean;
  targetPath: (string | number)[];
};

export type CompositeDefinition = {
  id: string;
  name: string;
  description?: string;
  /** Free-text grouping shown in the library. Absent means "Uncategorized". */
  category?: string;
  nodes: PrimitiveNode[];
  propBindings: PropBinding[];
  /**
   * Epoch millis. Optional because components saved before the library existed have
   * neither - the library treats a missing timestamp as oldest rather than dropping
   * the component.
   */
  createdAt?: number;
  updatedAt?: number;
  version: "1.0";
};
