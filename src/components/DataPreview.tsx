"use client";

import type { CsvDataset } from "@/lib/types";

type Props = {
  dataset: CsvDataset;
};

export function DataPreview({ dataset }: Props) {
  const preview = dataset.rows.slice(0, 5);
  const headers = dataset.columns.map((c) => c.name);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Active dataset
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            {dataset.name}
          </h2>
        </div>
        <p className="font-mono text-xs text-[var(--muted)]">
          {dataset.rowCount.toLocaleString()} rows · {dataset.columns.length}{" "}
          cols
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {dataset.columns.map((col) => (
          <span
            key={col.name}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--ink-soft)]"
          >
            <span className="font-medium">{col.name}</span>
            <span className="font-mono text-[var(--muted)]">{col.type}</span>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-2 font-medium tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr
                key={i}
                className="border-t border-[var(--border)] text-[var(--ink-soft)]"
              >
                {headers.map((h) => (
                  <td key={h} className="max-w-[12rem] truncate px-3 py-2">
                    {formatCell(row[h])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}
