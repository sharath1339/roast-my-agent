import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmailForm } from "~/components/email-form";
import { ShareBar } from "~/components/share-bar";
import { getRoast } from "~/lib/store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getRoast(id);
  if (!data) return { title: "Roast not found — Roast My Agent" };

  const title = `${data.roast.title} — Roast My Agent`;
  const description = data.roast.verdict;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: `/r/${id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/r/${id}/opengraph-image`],
    },
  };
}

export default async function RoastPage({ params }: Props) {
  const { id } = await params;
  const data = await getRoast(id);
  if (!data) notFound();

  const { roast } = data;
  const paragraphs = roast.roast.split(/\n\n+/).filter(Boolean);

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-10">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <Link
        href="/"
        className="mb-6 inline-block font-mono text-xs text-zinc-500 transition hover:text-zinc-300"
      >
        ← roast another
      </Link>

      <article className="overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black shadow-2xl shadow-burn-900/20">
        <header className="relative overflow-hidden border-b border-zinc-800 px-8 py-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-burn-900/40 via-transparent to-transparent" />
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-burn-500">
            <span className="size-1.5 rounded-full bg-burn-500" />
            verdict
          </div>
          <h1 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            {roast.title}
          </h1>
          <p className="mt-3 text-pretty text-lg text-zinc-400">{roast.verdict}</p>
          <p className="mt-5 inline-block rounded-full border border-burn-700/50 bg-burn-900/30 px-3 py-1 font-mono text-xs text-burn-300">
            {roast.vibes}
          </p>
        </header>

        <section className="space-y-4 px-8 py-8 text-pretty text-base leading-relaxed text-zinc-200 sm:text-lg">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        {roast.callouts.length > 0 && (
          <section className="border-t border-zinc-800 px-8 py-6">
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              specific crimes
            </h2>
            <ul className="space-y-3">
              {roast.callouts.map((c, i) => (
                <li key={i} className="flex gap-3 text-zinc-300">
                  <span className="font-mono text-burn-500">{String(i + 1).padStart(2, "0")}</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="border-t border-zinc-800 bg-zinc-900/40 px-8 py-6">
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            the kind word
          </h2>
          <p className="text-pretty text-zinc-200">{roast.redemption}</p>
        </section>
      </article>

      <EmailForm id={id} title={roast.title} />

      <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-burn-900/30">
        <div className="px-8 py-8">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-burn-300">
            <span className="size-1.5 rounded-full bg-burn-500" />
            the way out
          </div>
          <h2 className="mt-3 text-balance text-2xl font-bold text-white sm:text-3xl">
            Want an agent that doesn't get roasted?
          </h2>
          <p className="mt-3 text-pretty text-zinc-400">
            Stop hand-rolling tool calls, OAuth flows, retry loops, and prompt
            injection guards. Composio is the integration layer for AI agents —
            1,000+ pre-built tools (Gmail, Slack, GitHub, Notion, Linear, …)
            with auth, observability, and execution handled. Drop in 5 lines,
            skip the weekend of glue code.
          </p>
          <a
            href="https://composio.dev?utm_source=roastmyagent&utm_medium=cta&utm_campaign=result_card"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-mono text-sm font-bold text-black transition hover:bg-burn-300"
          >
            try composio →
          </a>
        </div>
      </section>

      <ShareBar id={id} title={roast.title} />

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-block rounded-lg bg-burn-500 px-6 py-3 font-mono text-sm font-bold text-black transition hover:bg-burn-300"
        >
          🔥 roast another
        </Link>
      </div>

      <footer className="mt-12 text-center font-mono text-xs text-zinc-600">
        roasted by claude ·{" "}
        <Link href="/" className="underline hover:text-zinc-400">
          try yours
        </Link>
      </footer>
    </main>
  );
}
