"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { buildDataset } from "@/lib/csv";
import type { CsvDataset } from "@/lib/types";

type Props = {
  onLoaded: (dataset: CsvDataset) => void;
  disabled?: boolean;
};

export function CsvUploader({ onLoaded, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const parseFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a .csv file.");
        return;
      }

      setBusy(true);
      setError(null);

      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (result) => {
          setBusy(false);
          if (result.errors.length) {
            setError(result.errors[0]?.message || "Failed to parse CSV.");
            return;
          }
          const rows = (result.data || []).filter(
            (row) => Object.keys(row).length > 0,
          );
          if (!rows.length) {
            setError("CSV has no data rows.");
            return;
          }
          if (rows.length > 20000) {
            setError("Please upload a CSV with 20,000 rows or fewer.");
            return;
          }
          onLoaded(buildDataset(file.name, rows));
        },
        error: (err) => {
          setBusy(false);
          setError(err.message);
        },
      });
    },
    [onLoaded],
  );

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          "group relative w-full overflow-hidden rounded-2xl border border-dashed px-5 py-8 text-left transition",
          "bg-[color-mix(in_oklab,var(--surface)_88%,transparent)]",
          dragging
            ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]"
            : "border-[var(--border)] hover:border-[var(--accent-soft)]",
          disabled || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_80%_at_20%_0%,var(--accent-glow),transparent_60%)]" />
        <p className="relative font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]">
          {busy ? "Parsing CSV…" : "Drop a CSV or browse"}
        </p>
        <p className="relative mt-1 text-sm text-[var(--muted)]">
          Up to 20,000 rows. Columns are inferred automatically.
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) parseFile(file);
          e.target.value = "";
        }}
      />
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
