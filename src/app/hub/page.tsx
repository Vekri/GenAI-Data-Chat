import type { Metadata } from "next";
import { GenAIDataChatIcon } from "@/components/GenAIDataChatIcon";

export const metadata: Metadata = {
  title: "Singareddy AI",
  description: "GenAI Data Chat — natural language Q&A over CSVs.",
};

const APP_URL = "https://genai-data-chat.vercel.app";

export default function HubPage() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[var(--bg)]" />

      <GenAIDataChatIcon
        href={APP_URL}
        size="lg"
        showLabel
        linkTarget="_self"
        ariaLabel="Open GenAI Data Chat"
        title="GenAI Data Chat"
      />
    </div>
  );
}
