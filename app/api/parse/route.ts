import { nvidiaComplete } from "@/lib/nvidia";
import { ParseError, parseAppliances } from "@/lib/parseAppliances";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 500) {
    return Response.json({ error: "Describe your appliances in 1–500 characters" }, { status: 400 });
  }
  try {
    return Response.json({ appliances: await parseAppliances(text, nvidiaComplete) });
  } catch (e) {
    if (e instanceof ParseError) return Response.json({ error: e.message }, { status: 422 });
    if ((e as { status?: number }).status === 429) {
      return Response.json({ error: "AI is busy, try again in a minute" }, { status: 429 });
    }
    console.error("parse failed", e);
    return Response.json({ error: "AI service unavailable, try again or add appliances manually" }, { status: 502 });
  }
}
