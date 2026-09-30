import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1/interactions";

export async function POST(req: Request) {
  try {
    const { question, parcel, building, floor, unit } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        answer:
          "AI assistant is ready, but GEMINI_API_KEY is not configured. Add it to .env.local to enable Gemini insights.",
      });
    }

    const context = JSON.stringify({ parcel, building, floor, unit }).slice(0, 18000);

    const systemInstruction =
      "You are the property intelligence assistant for NEXUS-3D. " +
      "Answer only from the supplied property data. Be concise, factual, and useful " +
      "for a municipal/property-management demo. Do not invent missing facts. " +
      "If the requested information is not present, clearly say it is not available.";

    const input =
      `User question: ${question}\n\n` +
      `Selected property data:\n${context}`;

    const response = await fetch(GEMINI_INTERACTIONS_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        system_instruction: systemInstruction,
        input,
        generation_config: {
          max_output_tokens: 500,
          thinking_level: "low",
        },
        store: false,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ??
            data?.error ??
            "Gemini Interactions API request failed.",
        },
        { status: 502 },
      );
    }

    const answer =
      typeof data?.output_text === "string"
        ? data.output_text.trim()
        : data?.steps
            ?.filter((step: { type?: string }) => step.type === "model_output")
            ?.flatMap(
              (step: {
                content?: Array<{ type?: string; text?: string }>;
              }) => step.content ?? [],
            )
            ?.filter((part: { type?: string }) => part.type === "text")
            ?.map((part: { text?: string }) => part.text ?? "")
            ?.join("\n")
            ?.trim();

    return NextResponse.json({
      answer: answer || "No insight was returned.",
      model: GEMINI_MODEL,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate property insight." },
      { status: 500 },
    );
  }
}
