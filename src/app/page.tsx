"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LOADING_LINES = [
  "analyzing your prompt-engineering crimes",
  "counting hardcoded API keys",
  "measuring system prompt bloat",
  "checking for ReAct loops with no escape hatch",
  "auditing your regex-on-LLM-output decisions",
  "calling your tooling 'optimistic'",
  "sharpening knives",
  "consulting the elder devs",
  "rendering disappointment",
];

const PLACEHOLDER = `// paste your agent code here.
// the worse it is, the funnier the roast.

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function agent(input: string) {
  const SYSTEM = "You are a world-class expert. Be helpful and accurate. Always think step by step. Don't make mistakes. Be careful. Be smart.";

  const res = await client.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{ role: "user", content: input }],
  });

  return JSON.parse(res.content[0].text); // we love living dangerously
}
`;

export default function Home() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0] ?? "roasting");
  const router = useRouter();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError("Paste some code first. I can't roast air.");
      return;
    }

    setPending(true);
    intervalRef.current = window.setInterval(() => {
      setLoadingLine(LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)] ?? "roasting");
    }, 1400);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        throw new Error(data.error ?? "Failed to roast.");
      }
      router.push(`/r/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something broke. Even Claude is judging you.");
      setPending(false);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <header className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-burn-700/50 bg-burn-900/30 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-burn-300">
          <span className="size-1.5 animate-pulse rounded-full bg-burn-500" />
          powered by claude
        </div>
        <h1 className="font-mono text-5xl font-black leading-[0.9] tracking-tight text-white sm:text-7xl">
          roast my
          <br />
          <span className="text-burn-500">agent</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-zinc-400">
          Paste your AI agent code. Get publicly humiliated by Claude. Share the receipts.
          <br />
          <span className="text-zinc-500">It's a code review, but it hates you.</span>
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
        <div className="relative flex flex-1 flex-col rounded-2xl border border-zinc-800 bg-zinc-950 transition focus-within:border-burn-500/60 focus-within:shadow-[0_0_0_4px_rgba(255,91,28,0.06)]">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 font-mono text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-zinc-700" />
              <span className="size-2 rounded-full bg-zinc-700" />
              <span className="size-2 rounded-full bg-zinc-700" />
              <span className="ml-3">agent.{detectLang(code)}</span>
            </div>
            <span>{code.length.toLocaleString()} / 30,000</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="min-h-[420px] flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-700 focus:outline-none"
            rows={18}
            disabled={pending}
            maxLength={30_000}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-burn-700/50 bg-burn-900/30 px-4 py-3 text-sm text-burn-300">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-500">
            We don't store your code, just the roast. Don't paste secrets — but if you do, we'll
            roast that too.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-lg bg-burn-500 px-6 py-3 font-mono text-sm font-bold text-black transition hover:bg-burn-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {pending ? `${loadingLine}…` : "🔥 roast me"}
          </button>
        </div>
      </form>

      <footer className="mt-12 flex items-center justify-between font-mono text-xs text-zinc-600">
        <span>
          made by <span className="text-zinc-400">sharath</span> at{" "}
          <a
            href="https://composio.dev?utm_source=roastmyagent&utm_medium=footer&utm_campaign=homepage"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-burn-300"
          >
            composio
          </a>{" "}
          · roasts by claude
        </span>
        <span>v0.1</span>
      </footer>
    </main>
  );
}

function detectLang(code: string): string {
  if (!code.trim()) return "ts";
  if (/^\s*(import\s+.+\s+from\s+["']|export\s+(default\s+)?(async\s+)?function|const\s+\w+\s*=\s*\()/m.test(code))
    return "ts";
  if (/^\s*(def\s+\w+\(|from\s+\w+\s+import|import\s+\w+\s*$)/m.test(code)) return "py";
  if (/^\s*package\s+main/m.test(code)) return "go";
  if (/^\s*(fn\s+\w+\(|use\s+\w+::)/m.test(code)) return "rs";
  return "ts";
}
