import OpenAI from "openai";
import { z } from "zod";
import {
  ANSWER_SYSTEM_PROMPT,
  buildSchemaPrompt,
  PLAN_SYSTEM_PROMPT,
} from "./prompts";
import { describePlan, QueryPlanSchema, runQueryPlan } from "./query";
import type { ChatResponse, CsvColumn } from "./types";

const PlanResponseSchema = z.object({
  plan: QueryPlanSchema.nullable(),
  rationale: z.string().optional(),
});

function getClient() {
  // Prefer Groq (free tier) when GROQ_API_KEY is set.
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return new OpenAI({ apiKey: openaiKey });
  }

  throw new Error(
    "Missing API key. Set GROQ_API_KEY (free at console.groq.com) or OPENAI_API_KEY.",
  );
}

function getModel() {
  if (process.env.GROQ_API_KEY?.trim()) {
    return (
      process.env.GROQ_MODEL?.trim() ||
      process.env.OPENAI_MODEL?.trim() ||
      "llama-3.1-8b-instant"
    );
  }
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON.");
    return JSON.parse(match[0]);
  }
}

async function generatePlan(
  question: string,
  datasetName: string,
  columns: CsvColumn[],
  rows: Record<string, unknown>[],
) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: getModel(),
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: PLAN_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          buildSchemaPrompt(datasetName, columns, rows),
          "",
          `Question: ${question}`,
        ].join("\n"),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  return PlanResponseSchema.parse(extractJson(content));
}

async function summarizeAnswer(
  question: string,
  query: string,
  table: { columns: string[]; rows: Record<string, unknown>[] },
): Promise<string> {
  const client = getClient();
  const previewRows = table.rows.slice(0, 40);
  const completion = await client.chat.completions.create({
    model: getModel(),
    temperature: 0.2,
    messages: [
      { role: "system", content: ANSWER_SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify(
          {
            question,
            query,
            columns: table.columns,
            rowCount: table.rows.length,
            rows: previewRows,
          },
          null,
          2,
        ),
      },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    "I ran the query but could not generate a summary."
  );
}

export async function answerQuestion(input: {
  question: string;
  datasetName: string;
  columns: CsvColumn[];
  rows: Record<string, unknown>[];
}): Promise<ChatResponse> {
  const { question, datasetName, columns, rows } = input;

  if (!rows.length) {
    return { answer: "This dataset has no rows to analyze." };
  }

  const generated = await generatePlan(question, datasetName, columns, rows);

  if (!generated.plan) {
    return {
      answer:
        generated.rationale ||
        "I could not map that question to the uploaded columns. Try rephrasing or ask about a specific column.",
    };
  }

  const queryText = describePlan(generated.plan);

  try {
    const table = runQueryPlan(generated.plan, rows);
    const answer = await summarizeAnswer(question, queryText, table);
    return { answer, sql: queryText, table };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Query failed.";
    return {
      answer: `I built a query plan but could not execute it: ${message}`,
      sql: queryText,
      error: message,
    };
  }
}
