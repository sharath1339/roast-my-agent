import { ImageResponse } from "next/og";
import { getRoast } from "~/lib/store";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Roast My Agent";

export default async function Image(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await getRoast(id);

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#09090b",
            color: "#fafafa",
            fontSize: 64,
            fontWeight: 900,
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          roast not found
        </div>
      ),
      size,
    );
  }

  const { roast } = data;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #09090b 0%, #1a0a00 100%)",
          color: "white",
          padding: "60px 70px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#ff5b1c",
            fontSize: 22,
            letterSpacing: 4,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              background: "#ff5b1c",
            }}
          />
          roast my agent
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: "white",
          }}
        >
          “{truncate(roast.title, 80)}”
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: "#a1a1aa",
            lineHeight: 1.3,
          }}
        >
          {truncate(roast.verdict, 140)}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "12px 22px",
              borderRadius: 9999,
              border: "2px solid #ec3b00",
              background: "rgba(236,59,0,0.12)",
              color: "#ffa771",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {truncate(roast.vibes, 60)}
          </div>
          <div
            style={{
              display: "flex",
              color: "#71717a",
              fontSize: 22,
              fontWeight: 500,
            }}
          >
            roasted by claude · composio.dev
          </div>
        </div>
      </div>
    ),
    size,
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
