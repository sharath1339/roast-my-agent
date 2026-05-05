import type { Metadata } from "next";
import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "Roast My Agent — get publicly humiliated by Claude",
  description:
    "Paste your AI agent code. Get a brutally funny code review from Claude. Share the receipts.",
  openGraph: {
    title: "Roast My Agent",
    description:
      "Paste your AI agent code. Get publicly humiliated by Claude. Devs love getting roasted.",
    type: "website",
    siteName: "Roast My Agent",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roast My Agent",
    description:
      "Paste your AI agent code. Get publicly humiliated by Claude. Devs love getting roasted.",
  },
  metadataBase: process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL("http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
