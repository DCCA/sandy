export type ParseResult = { success: true; data: unknown } | { success: false; error: string };

export function parseJSON(raw: string): ParseResult {
  try {
    const data = JSON.parse(raw);
    return { success: true, data };
  } catch (e) {
    const message = e instanceof SyntaxError ? e.message : "Invalid JSON";
    return { success: false, error: message };
  }
}
