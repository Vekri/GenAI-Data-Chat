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
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(20000),
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = BodySchema.parse(json);

    const result = await answerQuestion({
      question: body.question,
      datasetName: body.datasetName,
      columns: body.columns,
      rows: body.rows,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload.", details: err.flatten() },
        { status: 400 },
      );
    }

    const message = err instanceof Error ? err.message : "Unexpected error.";
    const status =
      message.includes("API key") || message.includes("GROQ_API_KEY")
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
