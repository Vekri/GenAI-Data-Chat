export type CsvColumn = {
  name: string;
  type: "string" | "number" | "boolean" | "date";
};

export type CsvDataset = {
  id: string;
  name: string;
  columns: CsvColumn[];
  rows: Record<string, unknown>[];
  rowCount: number;
};

export type ChatRole = "user" | "assistant";

export type ResultTable = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sql?: string;
  table?: ResultTable;
  error?: string;
};

export type ChatRequest = {
  question: string;
  datasetName: string;
  columns: CsvColumn[];
  rows: Record<string, unknown>[];
};

export type ChatResponse = {
  answer: string;
  sql?: string;
  table?: ResultTable;
  error?: string;
};
