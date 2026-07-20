type Props = {
  href?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  linkTarget?: "_self" | "_blank" | "_top";
  ariaLabel?: string;
  title?: string;
};

const sizes = {
  sm: { tile: "h-11 w-11 rounded-xl", icon: 28, label: "text-xs" },
  md: { tile: "h-14 w-14 rounded-2xl", icon: 36, label: "text-sm" },
  lg: { tile: "h-24 w-24 rounded-[1.35rem]", icon: 60, label: "text-sm" },
};

export function GenAIDataChatIcon({
  href = "https://genai-data-chat.vercel.app",
  size = "md",
  showLabel = false,
  className = "",
  linkTarget = "_self",
  ariaLabel = "Open GenAI Data Chat",
  title = "GenAI Data Chat",
}: Props) {
  const s = sizes[size];

  const tile = (
    <span
      className={[
        "app-icon-tile group relative grid shrink-0 place-items-center overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(4,20,28,0.4)] transition",
        "hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_14px_36px_rgba(61,207,182,0.22)] active:translate-y-0 active:scale-[0.98]",
        s.tile,
        className,
      ].join(" ")}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_20%_0%,rgba(61,207,182,0.22),transparent_65%)]" />
      <GenAIDataChatMark size={s.icon} />
    </span>
  );

  const content = (
    <span className="inline-flex flex-col items-center gap-2">
      {tile}
      {showLabel ? (
        <span
          className={[
            "max-w-[7rem] text-center font-[family-name:var(--font-display)] font-semibold leading-tight text-[var(--ink)]",
            s.label,
          ].join(" ")}
        >
          GenAI Data Chat
        </span>
      ) : null}
    </span>
  );

  return (
    <a
      href={href}
      target={linkTarget}
      rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
      className="inline-flex cursor-pointer outline-none ring-[var(--accent)] focus-visible:ring-2 rounded-2xl"
      aria-label={ariaLabel}
      title={title}
    >
      {content}
    </a>
  );
}

export function GenAIDataChatMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="10" y="12" width="28" height="36" rx="4" fill="#14303b" stroke="#7ee0cd" strokeWidth="2" />
      <path d="M16 22h16M16 28h20M16 34h12" stroke="#7ee0cd" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M36 30c0-5.5 4.5-10 10-10h2c5.5 0 10 4.5 10 10v8c0 1.7-1.3 3-3 3h-12l-5 5v-5h-2c-1.7 0-3-1.3-3-3v-8z"
        fill="#3dcfb6"
      />
      <circle cx="42" cy="32" r="1.6" fill="#042019" />
      <circle cx="47" cy="32" r="1.6" fill="#042019" />
      <circle cx="52" cy="32" r="1.6" fill="#042019" />
    </svg>
  );
}
