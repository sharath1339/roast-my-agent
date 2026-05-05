"use client";

import { useState } from "react";

export function ShareBar({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);

  function getUrl(): string {
    if (typeof window === "undefined") return `/r/${id}`;
    return `${window.location.origin}/r/${id}`;
  }

  function copy() {
    const url = getUrl();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const tweet = `My AI agent just got roasted by Claude:\n\n"${title}"\n\nroast yours →`;
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(getUrl())}`;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <a
        href={tweetHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
      >
        post on x
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
      >
        {copied ? "copied!" : "copy link"}
      </button>
    </div>
  );
}
