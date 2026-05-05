import { NextResponse } from "next/server";
import { roastCode } from "~/lib/claude";
import { checkRateLimit, getClientIp } from "~/lib/ratelimit";
import { newId, saveRoast } from "~/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, "roast");
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.resetSeconds / 60);
    return NextResponse.json(
      {
        error: `Easy there, hot stuff. Limit is ${rl.limit} roasts per hour. Try again in ${minutes} min.`,
      },
      {
        status: 429,
        headers: {
          "x-ratelimit-limit": String(rl.limit),
          "x-ratelimit-remaining": String(rl.remaining),
          "x-ratelimit-reset": String(rl.resetSeconds),
        },
      },
    );
  }

  let body: { code?: unknown; language?: unknown };
  try {
    body = (await req.json()) as { code?: unknown; language?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const language = typeof body.language === "string" ? body.language : undefined;

  if (!code) {
    return NextResponse.json({ error: "Paste some code first. I can't roast air." }, { status: 400 });
  }
  if (code.length > 30_000) {
    return NextResponse.json(
      { error: "30k characters max — yes, I'm sure your monorepo is special." },
      { status: 400 },
    );
  }

  try {
    const roast = await roastCode(code, language);
    const id = newId();
    await saveRoast({
      id,
      roast,
      language,
      preview: code.slice(0, 200),
      createdAt: Date.now(),
    });
    return NextResponse.json({ id, roast });
  } catch (err) {
    console.error("[roast] failure", err);
    const msg = err instanceof Error ? err.message : "Something broke while roasting.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
