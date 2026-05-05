# 🔥 Roast Your Agent

Paste your AI agent code. Get publicly humiliated by Claude. Share the screenshot.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS v4
- Claude Sonnet 4.6 via `@anthropic-ai/sdk`
- Upstash Redis for share links (optional — falls back to in-memory for local dev)

## Run locally

```bash
pnpm install
ANTHROPIC_API_KEY=sk-ant-... pnpm dev
```

Visit http://localhost:3000.

## Deploy to Vercel

1. Push to GitHub.
2. Import to Vercel.
3. Set env vars:
   - `ANTHROPIC_API_KEY` — required.
   - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — strongly recommended in production. Without these, share links only live in the current Vercel function instance and will 404 from another region. Free tier on [upstash.com](https://upstash.com).
4. Ship.

## Routes

| Route | What |
|---|---|
| `/` | Paste form |
| `/api/roast` (POST) | Calls Claude, persists, returns `{ id, roast }` |
| `/r/[id]` | Shareable result page |
| `/r/[id]/opengraph-image` | Dynamic 1200×630 OG image — the screenshot fuel |

## Notes

- 30k character input cap.
- No rate limiting yet. If this goes viral, slap an Upstash rate-limit on `/api/roast` ASAP.
- The system prompt is in `src/lib/claude.ts`. Tune the snark to taste.
