import { Composio } from "@composio/core";
import type { Roast } from "./claude";

export type SendRoastEmailInput = {
  to: string;
  roast: Roast;
  shareUrl: string;
};

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Email feature not yet configured");
    this.name = "EmailNotConfiguredError";
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.COMPOSIO_API_KEY && process.env.COMPOSIO_USER_ID);
}

export async function sendRoastEmail(input: SendRoastEmailInput): Promise<void> {
  if (!isEmailConfigured()) throw new EmailNotConfiguredError();

  const userId = process.env.COMPOSIO_USER_ID as string;

  const composio = new Composio();
  const session = await composio.create(userId);

  const html = renderRoastHtml(input);
  const subject = `🔥 Your roast: ${truncate(input.roast.title, 80)}`;

  await session.execute("GMAIL_SEND_EMAIL", {
    recipient_email: input.to,
    subject,
    body: html,
    is_html: true,
  });
}

function renderRoastHtml({ roast, shareUrl }: SendRoastEmailInput): string {
  const callouts = roast.callouts
    .map(
      (c, i) => `
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:32px;color:#ff5b1c;font-family:ui-monospace,Menlo,monospace;font-size:14px;font-weight:700;">${String(i + 1).padStart(2, "0")}</td>
          <td style="padding:8px 0;color:#d4d4d8;font-size:15px;line-height:1.5;">${escapeHtml(c)}</td>
        </tr>`,
    )
    .join("");

  const paragraphs = roast.roast
    .split(/\n\n+/)
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;color:#e4e4e7;font-size:16px;line-height:1.6;">${escapeHtml(p)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(roast.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0a0a0b;border:1px solid #27272a;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #27272a;background:linear-gradient(135deg,rgba(71,20,0,0.5),transparent);">
                <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#ff5b1c;margin-bottom:10px;">verdict</div>
                <h1 style="margin:0;font-size:28px;line-height:1.15;color:#ffffff;font-weight:900;letter-spacing:-0.5px;">${escapeHtml(roast.title)}</h1>
                <p style="margin:14px 0 0;font-size:17px;color:#a1a1aa;line-height:1.4;">${escapeHtml(roast.verdict)}</p>
                <div style="display:inline-block;margin-top:18px;padding:6px 14px;border:1px solid #c42d00;background:rgba(196,45,0,0.18);border-radius:9999px;color:#ffa771;font-family:ui-monospace,Menlo,monospace;font-size:13px;">${escapeHtml(roast.vibes)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">${paragraphs}</td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #27272a;">
                <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#71717a;margin-bottom:12px;">specific crimes</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${callouts}</table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #27272a;background:rgba(39,39,42,0.4);">
                <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#71717a;margin-bottom:8px;">the kind word</div>
                <p style="margin:0;color:#e4e4e7;font-size:15px;line-height:1.5;">${escapeHtml(roast.redemption)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #27272a;background:linear-gradient(135deg,#0a0a0b,rgba(71,20,0,0.3));text-align:center;">
                <p style="margin:0 0 14px;color:#a1a1aa;font-size:14px;">Want agents that don't get roasted? Composio gives you 1,000+ pre-built tools — auth, retries, and observability handled.</p>
                <a href="https://composio.dev?utm_source=roastmyagent&utm_medium=email&utm_campaign=roast_email" style="display:inline-block;padding:11px 22px;background:#ffffff;color:#000000;text-decoration:none;font-family:ui-monospace,Menlo,monospace;font-size:13px;font-weight:700;border-radius:8px;">try composio →</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;text-align:center;border-top:1px solid #27272a;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#52525b;">
                <a href="${escapeHtml(shareUrl)}" style="color:#a1a1aa;text-decoration:none;">view on roastmyagent.co</a>
                &nbsp;·&nbsp;roasted by claude
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
