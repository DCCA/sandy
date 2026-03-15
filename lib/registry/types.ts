import type { ComponentType } from "react";
import type { z } from "zod";

export type Section = {
  id: string;
  component: string;
  props: Record<string, unknown>;
};

export type Page = {
  version: string;
  theme?: {
    brand: string;
    mode: "light" | "dark";
  };
  meta?: {
    viewport?: Viewport;
    locale?: string;
  };
  sections: Section[];
};

export type RegistryItem = {
  component: ComponentType<Record<string, unknown>>;
  schema: z.ZodType;
  example: Section;
  metadata: {
    name: string;
    description?: string;
    supportsTheme?: boolean;
  };
};

export type Envelope = {
  component: string;
  version: string;
  props: Record<string, unknown>;
  theme?: {
    brand: string;
    mode: "light" | "dark";
  };
  slots?: Record<string, unknown>;
  meta?: {
    viewport?: Viewport;
    locale?: string;
  };
};

export type Viewport = "mobile";

export type SandboxError = {
  type: "parse" | "validation" | "runtime";
  messages: string[];
  sectionId?: string;
  sectionLabel?: string;
};

export type ValidatedSection = {
  id: string;
  component: ComponentType<Record<string, unknown>>;
  componentName: string;
  props: Record<string, unknown>;
};

export type PageValidationResult =
  | { success: true; sections: ValidatedSection[]; errors: SandboxError[] }
  | { success: false; sections: ValidatedSection[]; errors: SandboxError[] };
