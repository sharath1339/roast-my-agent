"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function EmailForm({ id, title }: { id: string; title: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, roastId: id }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to send.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-6 rounded-2xl border border-burn-700/40 bg-burn-900/20 px-5 py-4 text-center">
        <p className="font-mono text-sm text-burn-300">
          ✓ Roast sent. Check your inbox — and your spam folder, just in case.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:flex-row sm:items-center"
      aria-label={`Email this roast: ${title}`}
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          email me this roast
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@somewhere.com"
          disabled={status === "sending"}
          className="bg-transparent font-mono text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none disabled:opacity-50"
          autoComplete="email"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending" || !email}
        className="shrink-0 rounded-lg bg-zinc-800 px-5 py-2.5 font-mono text-sm font-bold text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "sending…" : "send →"}
      </button>
      {error && (
        <p className="basis-full font-mono text-xs text-burn-300">{error}</p>
      )}
    </form>
  );
}
