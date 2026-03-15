import type { ComponentType } from "react";
import type { z } from "zod";

export type RegistryItem = {
  component: ComponentType<Record<string, unknown>>;
  schema: z.ZodType;
  example: Envelope;
  metadata: {
    name: string;
    description?: string;
    supportsTheme?: boolean;
    supportsSlots?: boolean;
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
};

export type ValidationResult =
  | { success: true; data: Envelope }
  | { success: false; errors: SandboxError[] };
