import { NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion } from "@/lib/chat";

const ColumnSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "date"]),
});

const BodySchema = z.object({
  question: z.string().trim().min(1).max(2000),
  datasetName: z.string().min(1).max(200),
  columns: z.array(ColumnSchema).min(1).max(200),
  rows: z.array(z.record(z.string(), z.any())).min(1).max(20000),
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await answerQuestion({
      question: parsed.data.question,
      datasetName: parsed.data.datasetName,
      columns: parsed.data.columns,
      rows: parsed.data.rows,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    const status =
      message.includes("API key") || message.includes("GROQ_API_KEY")
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
