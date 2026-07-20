import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://singareddyai.com"),
  title: {
    default: "GenAI Data Chat",
    template: "%s · Singareddy AI",
  },
  description:
    "Natural language Q&A over uploaded CSVs — by Singareddy AI (singareddyai.com)",
  applicationName: "GenAI Data Chat",
  keywords: [
    "GenAI Data Chat",
    "Singareddy AI",
    "CSV chat",
    "natural language analytics",
  ],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
    shortcut: ["/favicon.svg"],
  },
  openGraph: {
    title: "GenAI Data Chat",
    description: "Natural language Q&A over uploaded CSVs",
    url: "https://singareddyai.com",
    siteName: "Singareddy AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
