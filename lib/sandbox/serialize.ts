import type { Envelope } from "@/lib/registry/types";
import type { ThemeTokens, DeepPartial } from "@/lib/theme/types";

export function serializeState(envelope: Envelope): string {
  try {
    const json = JSON.stringify(envelope);
    return btoa(encodeURIComponent(json));
  } catch {
    return "";
  }
}

export function deserializeState(encoded: string): Envelope | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as Envelope;
  } catch {
    return null;
  }
}

export function serializeTokens(overrides: DeepPartial<ThemeTokens>): string {
  try {
    const json = JSON.stringify(overrides);
    return btoa(encodeURIComponent(json));
  } catch {
    return "";
  }
}

export function deserializeTokens(encoded: string): DeepPartial<ThemeTokens> | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as DeepPartial<ThemeTokens>;
  } catch {
    return null;
  }
}
