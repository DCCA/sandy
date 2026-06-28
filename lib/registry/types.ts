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

export type Viewport = "mobile" | "tablet" | "desktop";

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

/**
 * An ordered, render-ready view of a page's sections. Valid sections render
 * normally; invalid/unknown sections degrade to an in-place placeholder instead
 * of disappearing (server-driven-UI "fallback" pattern), so page order and
 * context are preserved.
 */
export type SectionRenderItem =
  | { kind: "ok"; section: ValidatedSection }
  | { kind: "error"; id: string; componentName: string; messages: string[] };

export type PageValidationResult =
  | {
      success: true;
      sections: ValidatedSection[];
      renderItems: SectionRenderItem[];
      errors: SandboxError[];
    }
  | {
      success: false;
      sections: ValidatedSection[];
      renderItems: SectionRenderItem[];
      errors: SandboxError[];
    };
