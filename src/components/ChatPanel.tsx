"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage, ChatResponse, CsvDataset } from "@/lib/types";

type Props = {
  dataset: CsvDataset | null;
};

const SUGGESTIONS = [
  "How many rows are in this dataset?",
  "What are the top 5 values by total?",
  "Summarize the numeric columns",
];

export function ChatPanel({ dataset }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [dataset?.id]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  async function ask(question: string) {
    if (!dataset || !question.trim() || busy) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          datasetName: dataset.name,
          columns: dataset.columns,
          rows: dataset.rows,
        }),
      });

      const data = (await res.json()) as ChatResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          sql: data.sql,
          table: data.table,
          error: data.error,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Something went wrong answering that question.",
          error: "request_failed",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <section className="flex h-full min-h-[28rem] flex-col rounded-3xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_78%,transparent)] shadow-[0_24px_80px_rgba(4,20,28,0.28)] backdrop-blur-md">
      <header className="border-b border-[var(--border)] px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Conversation
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Ask your data
        </h2>
      </header>

      <div
        ref={scrollerRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5"
      >
        {!dataset ? (
          <EmptyState
            title="Upload a CSV to begin"
            body="Once a file is loaded, ask questions in plain English. Answers include the query used and a result preview."
          />
        ) : messages.length === 0 ? (
          <EmptyState
            title={`Ready: ${dataset.name}`}
            body="Try a suggestion below, or ask anything about the columns you see in the preview."
          />
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        {busy ? (
          <p className="animate-pulse text-sm text-[var(--muted)]">
            Thinking through your spreadsheet…
          </p>
        ) : null}
      </div>

      {dataset ? (
        <div className="space-y-3 border-t border-[var(--border)] px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => void ask(s)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--ink-soft)] transition hover:border-[var(--accent-soft)] hover:text-[var(--ink)] disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              placeholder="e.g. Which region had the highest revenue?"
              className="min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] placeholder:text-[var(--muted)] focus:ring-2"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="my-auto max-w-md rounded-2xl border border-dashed border-[var(--border)] px-5 py-8">
      <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
    </div>
  );
}
