import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080f1c",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            border: "3px solid #1AA8D8",
            borderTopColor: "transparent",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
