import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/ai/generate-envelope", () => ({
  generateEnvelope: vi.fn(),
  isGenerationAvailable: vi.fn(),
}));

import { GET, POST } from "@/app/api/generate/route";
import { generateEnvelope, isGenerationAvailable } from "@/lib/ai/generate-envelope";

const mockedGenerate = vi.mocked(generateEnvelope);
const mockedAvailable = vi.mocked(isGenerationAvailable);

function postRequest(body: unknown) {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("GET /api/generate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reports availability", async () => {
    mockedAvailable.mockReturnValue(true);
    const res = GET();
    expect(await res.json()).toEqual({ available: true });
  });
});

describe("POST /api/generate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the generated page and validation", async () => {
    mockedAvailable.mockReturnValue(true);
    const page = {
      version: "2.0",
      sections: [{ id: "sec_1", component: "HeroBanner", props: {} }],
    };
    const validation = { success: true, sections: [], renderItems: [], errors: [] };
    mockedGenerate.mockResolvedValue({ page, validation } as never);

    const res = await POST(postRequest({ prompt: "a hero banner" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ page, validation });
    expect(mockedGenerate).toHaveBeenCalledWith("a hero banner");
  });

  it("rejects an empty prompt", async () => {
    mockedAvailable.mockReturnValue(true);
    const res = await POST(postRequest({ prompt: "" }));
    expect(res.status).toBe(400);
    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it("rejects an oversized prompt", async () => {
    mockedAvailable.mockReturnValue(true);
    const res = await POST(postRequest({ prompt: "x".repeat(2001) }));
    expect(res.status).toBe(400);
  });

  it("returns 503 when generation is unavailable", async () => {
    mockedAvailable.mockReturnValue(false);
    const res = await POST(postRequest({ prompt: "a hero" }));
    expect(res.status).toBe(503);
    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it("returns 500 with a message when generation throws", async () => {
    mockedAvailable.mockReturnValue(true);
    mockedGenerate.mockRejectedValue(new Error("Generation failed: boom"));
    const res = await POST(postRequest({ prompt: "a hero" }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/boom/);
  });
});
