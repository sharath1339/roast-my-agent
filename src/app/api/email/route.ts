import { NextResponse } from "next/server";
import { EmailNotConfiguredError, sendRoastEmail } from "~/lib/email";
import { checkRateLimit, getClientIp } from "~/lib/ratelimit";
import { getRoast } from "~/lib/store";

export const runtime = "nodejs";
export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, "email");
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.resetSeconds / 60);
    return NextResponse.json(
      { error: `Too many email requests. Try again in ${minutes} min.` },
      { status: 429 },
    );
  }

  let body: { email?: unknown; roastId?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; roastId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const roastId = typeof body.roastId === "string" ? body.roastId.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That doesn't look like an email." }, { status: 400 });
  }
  if (!roastId) {
    return NextResponse.json({ error: "Missing roastId." }, { status: 400 });
  }

  const stored = await getRoast(roastId);
  if (!stored) {
    return NextResponse.json({ error: "Roast not found." }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const shareUrl = `${origin}/r/${roastId}`;

  try {
    await sendRoastEmail({ to: email, roast: stored.roast, shareUrl });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof EmailNotConfiguredError) {
      return NextResponse.json(
        { error: "Email feature is being wired up. Try again soon." },
        { status: 503 },
      );
    }
    console.error("[email] failure", err);
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return NextResponse.json(
      { error: "Couldn't send the email. Try again in a minute.", detail },
      { status: 500 },
    );
  }
}
