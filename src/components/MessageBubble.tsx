"use client";

import type { ChatMessage, ResultTable } from "@/lib/types";

type Props = {
  message: ChatMessage;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <article
      className={[
        "animate-rise max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        isUser
          ? "ml-auto bg-[var(--accent)] text-[var(--accent-ink)]"
          : "mr-auto border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-soft)]",
      ].join(" ")}
    >
      <p className="whitespace-pre-wrap">{message.content}</p>

      {message.sql ? (
        <details className="mt-3 rounded-xl bg-[var(--code-bg)] p-3 text-[var(--code-fg)]">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider opacity-80">
            Query used
          </summary>
          <pre className="mt-2 overflow-x-auto font-mono text-xs leading-5">
            {message.sql}
          </pre>
        </details>
      ) : null}

      {message.table && message.table.rows.length > 0 ? (
        <ResultPreview table={message.table} />
      ) : null}

      {message.error ? (
        <p className="mt-2 text-xs text-[var(--danger)]">{message.error}</p>
      ) : null}
    </article>
  );
}

function ResultPreview({ table }: { table: ResultTable }) {
  const rows = table.rows.slice(0, 12);
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
      <table className="min-w-full text-left text-xs">
        <thead>
          <tr className="text-[var(--muted)]">
            {table.columns.map((col) => (
              <th key={col} className="px-3 py-2 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[var(--border)]">
              {table.columns.map((col) => (
                <td key={col} className="max-w-[10rem] truncate px-3 py-2">
                  {row[col] === null || row[col] === undefined
                    ? "—"
                    : String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.rows.length > rows.length ? (
        <p className="border-t border-[var(--border)] px-3 py-2 text-[11px] text-[var(--muted)]">
          Showing {rows.length} of {table.rows.length} rows
        </p>
      ) : null}
    </div>
  );
}
