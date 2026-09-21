import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 20% 15%, rgba(39,179,207,0.35), transparent 45%), radial-gradient(circle at 85% 85%, rgba(42,69,150,0.35), transparent 45%), #080f1c",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 92,
            height: 92,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              border: "5px solid #1AA8D8",
              borderTopColor: "transparent",
              transform: "rotate(45deg)",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: -1,
          }}
        >
          Elite Escape Tourism
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            color: "#1AA8D8",
            letterSpacing: 1,
          }}
        >
          Holidays · Global Visa · Tours
        </div>
      </div>
    ),
    { ...size },
  );
}
