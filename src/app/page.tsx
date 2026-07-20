"use client";

import { useCallback, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { CsvUploader } from "@/components/CsvUploader";
import { DataPreview } from "@/components/DataPreview";
import { GenAIDataChatIcon } from "@/components/GenAIDataChatIcon";
import { buildDataset } from "@/lib/csv";
import type { CsvDataset } from "@/lib/types";
import Papa from "papaparse";

export default function Home() {
  const [dataset, setDataset] = useState<CsvDataset | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);

  const loadSample = useCallback(async () => {
    setLoadingSample(true);
    try {
      const res = await fetch("/samples/sales.csv");
      const text = await res.text();
      const parsed = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      const rows = (parsed.data || []).filter(
        (row) => Object.keys(row).length > 0,
      );
      setDataset(buildDataset("sales.csv", rows));
    } finally {
      setLoadingSample(false);
    }
  }, []);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--bg)]" />
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,var(--blob-a),transparent_70%)] blur-2xl" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,var(--blob-b),transparent_68%)] blur-2xl" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 pb-2 pt-6 sm:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <GenAIDataChatIcon href="https://singareddyai.com" size="lg" />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-soft)]">
              singareddyai.com
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)] sm:text-4xl">
              GenAI Data Chat
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadSample()}
          disabled={loadingSample}
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--ink-soft)] transition hover:border-[var(--accent-soft)] disabled:opacity-50"
        >
          {loadingSample ? "Loading…" : "Try sample sales.csv"}
        </button>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-5 py-6 lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.35fr)] lg:px-8">
        <aside className="space-y-5 rounded-3xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_72%,transparent)] p-5 backdrop-blur-md">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              Your spreadsheet
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Upload a CSV, then ask questions the way you would ask an analyst.
            </p>
          </div>

          <CsvUploader onLoaded={setDataset} />

          {dataset ? (
            <>
              <DataPreview dataset={dataset} />
              <button
                type="button"
                onClick={() => setDataset(null)}
                className="text-sm text-[var(--muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
              >
                Clear dataset
              </button>
            </>
          ) : (
            <ol className="space-y-2 text-sm text-[var(--muted)]">
              <li>1. Upload CSV or load the sample</li>
              <li>2. Review inferred column types</li>
              <li>3. Ask in plain English</li>
            </ol>
          )}
        </aside>

        <ChatPanel dataset={dataset} />
      </main>
    </div>
  );
}
