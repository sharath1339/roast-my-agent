import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-mono text-7xl font-black tracking-tight text-burn-500">404</h1>
      <p className="text-balance text-lg text-zinc-400">
        This roast has cooled. Go burn another one.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-burn-500 px-6 py-3 font-mono text-sm font-bold text-black transition hover:bg-burn-300"
      >
        ← roast something
      </Link>
    </main>
  );
}
