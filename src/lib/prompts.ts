import type { CsvColumn } from "./types";

const MAX_SAMPLE_ROWS = 8;

export function buildSchemaPrompt(
  datasetName: string,
  columns: CsvColumn[],
  sampleRows: Record<string, unknown>[],
): string {
  const colLines = columns
    .map((c) => `- ${JSON.stringify(c.name)} (${c.type})`)
    .join("\n");

  const sample = sampleRows.slice(0, MAX_SAMPLE_ROWS);

  return [
    `Dataset name: ${datasetName}`,
    `Columns:`,
    colLines,
    `Sample rows (JSON):`,
    JSON.stringify(sample, null, 2),
  ].join("\n");
}

export const PLAN_SYSTEM_PROMPT = `You are a data analyst that converts natural language questions into a JSON query plan for tabular CSV data.

Return ONLY JSON with this shape:
{
  "plan": {
    "select": [{ "column": string|null, "agg": "none"|"count"|"sum"|"avg"|"min"|"max", "as": string? }],
    "where": [{ "column": string, "op": "eq"|"neq"|"gt"|"gte"|"lt"|"lte"|"contains", "value": string|number|boolean|null }],
    "groupBy": string[],
    "orderBy": [{ "column": string, "dir": "asc"|"desc" }],
    "limit": number|null
  },
  "rationale": string
}

Rules:
- Use only column names that exist in the schema.
- For row counts use agg "count" with column null.
- Prefer aggregations for summary questions.
- Default limit to 50 for row listings; use null only when a single aggregate answer is expected.
- If the question cannot be answered from the schema, set "plan" to null and explain in rationale.`;

export const ANSWER_SYSTEM_PROMPT = `You are GenAI Data Chat, a concise data analyst.
Given the user's question, the query that was run, and the result rows, write a clear natural-language answer.
- Lead with the direct answer.
- Mention key numbers.
- If the result is empty, say so and suggest a follow-up.
- Do not invent values that are not in the result.
- Keep the answer under 180 words unless the user asked for detail.`;
