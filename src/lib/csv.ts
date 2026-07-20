import type { CsvColumn, CsvDataset } from "./types";

const BOOLEAN_TRUE = new Set(["true", "yes", "y", "1"]);
const BOOLEAN_FALSE = new Set(["false", "no", "n", "0"]);

function inferType(values: unknown[]): CsvColumn["type"] {
  const samples = values
    .map((v) => (typeof v === "string" ? v.trim() : v))
    .filter((v) => v !== null && v !== undefined && v !== "");

  if (samples.length === 0) return "string";

  if (
    samples.every(
      (v) =>
        typeof v === "boolean" ||
        (typeof v === "string" &&
          (BOOLEAN_TRUE.has(v.toLowerCase()) ||
            BOOLEAN_FALSE.has(v.toLowerCase()))),
    )
  ) {
    return "boolean";
  }

  if (
    samples.every((v) => {
      if (typeof v === "number") return Number.isFinite(v);
      if (typeof v !== "string") return false;
      const normalized = v.replace(/,/g, "");
      return normalized !== "" && !Number.isNaN(Number(normalized));
    })
  ) {
    return "number";
  }

  if (
    samples.every((v) => {
      if (typeof v !== "string") return false;
      const time = Date.parse(v);
      return !Number.isNaN(time);
    })
  ) {
    return "date";
  }

  return "string";
}

function coerceValue(value: unknown, type: CsvColumn["type"]): unknown {
  if (value === null || value === undefined || value === "") return null;

  if (type === "number") {
    if (typeof value === "number") return value;
    const n = Number(String(value).replace(/,/g, ""));
    return Number.isNaN(n) ? null : n;
  }

  if (type === "boolean") {
    if (typeof value === "boolean") return value;
    const lower = String(value).trim().toLowerCase();
    if (BOOLEAN_TRUE.has(lower)) return true;
    if (BOOLEAN_FALSE.has(lower)) return false;
    return null;
  }

  return typeof value === "string" ? value.trim() : value;
}

export function buildDataset(
  name: string,
  rawRows: Record<string, unknown>[],
): CsvDataset {
  const headers = Object.keys(rawRows[0] ?? {});
  const columns: CsvColumn[] = headers.map((name) => ({
    name,
    type: inferType(rawRows.map((row) => row[name])),
  }));

  const rows = rawRows.map((row) => {
    const next: Record<string, unknown> = {};
    for (const col of columns) {
      next[col.name] = coerceValue(row[col.name], col.type);
    }
    return next;
  });

  return {
    id: crypto.randomUUID(),
    name,
    columns,
    rows,
    rowCount: rows.length,
  };
}

export function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}
