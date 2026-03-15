export type PrimitiveType =
  | "heading"
  | "paragraph"
  | "button"
  | "image"
  | "spacer"
  | "divider"
  | "container"
  | "badge";

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
  nodes: PrimitiveNode[];
  propBindings: PropBinding[];
  version: "1.0";
};
