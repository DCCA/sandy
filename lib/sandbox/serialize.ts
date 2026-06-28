import type { Page } from "@/lib/registry/types";
import type { ThemeTokens, DeepPartial } from "@/lib/theme/types";
import { parseThemeOverrides } from "@/lib/theme/schema";
import { isLegacyEnvelope, migrateEnvelopeToPage } from "./validate";

export function serializeState(page: Page): string {
  try {
    const json = JSON.stringify(page);
    return btoa(encodeURIComponent(json));
  } catch {
    return "";
  }
}

export function deserializeState(encoded: string): Page | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);
    if (isLegacyEnvelope(data)) {
      return migrateEnvelopeToPage(data);
    }
    return data as Page;
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
    // Validate the shape/types of the override payload (it comes from the URL)
    // before trusting it; malformed input is dropped rather than merged.
    return parseThemeOverrides(JSON.parse(json));
  } catch {
    return null;
  }
}
