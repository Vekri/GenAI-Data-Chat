import type { Metadata } from "next";
import { GenAIDataChatIcon } from "@/components/GenAIDataChatIcon";

export const metadata: Metadata = {
  title: "Singareddy AI",
  description: "AI apps for data, analytics, and natural language CSV chat.",
};

const APP_URL = "https://genai-data-chat.vercel.app";

export default function HubPage() {
  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--bg)]" />
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,var(--blob-a),transparent_70%)] blur-2xl" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,var(--blob-b),transparent_68%)] blur-2xl" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-soft)]">
            AI apps portal
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
            Singareddy <span className="text-[var(--accent)]">AI</span>
          </h1>
        </div>
        <p className="hidden text-sm text-[var(--muted)] sm:block">singareddyai.com</p>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-16 sm:px-8">
        <section className="rounded-3xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_72%,transparent)] p-6 backdrop-blur-md sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Apps
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            Click an app icon to open it. GenAI Data Chat lets you upload a CSV and ask
            questions in plain English.
          </p>

          <div className="mt-8 flex flex-wrap gap-8">
            <GenAIDataChatIcon
              href={APP_URL}
              size="lg"
              showLabel
              linkTarget="_self"
              ariaLabel="Open GenAI Data Chat"
              title="GenAI Data Chat"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
