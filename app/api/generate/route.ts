import { NextResponse } from "next/server";
import { z } from "zod";
import { generateEnvelope, isGenerationAvailable } from "@/lib/ai/generate-envelope";

// Spawns the Claude CLI — must run on the Node.js runtime, not the edge.
export const runtime = "nodejs";

const RequestSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(2000, "Prompt is too long"),
});

/** Capability probe so the client can show/hide the Generate action. */
export function GET() {
  return NextResponse.json({ available: isGenerationAvailable() });
}

export async function POST(request: Request) {
  if (!isGenerationAvailable()) {
    return NextResponse.json(
      {
        error:
          "Generation is unavailable here. Run `claude setup-token`, set CLAUDE_CODE_OAUTH_TOKEN, and restart the dev server.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  try {
    const { page, validation } = await generateEnvelope(parsed.data.prompt);
    return NextResponse.json({ page, validation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
