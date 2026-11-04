import { ImageResponse } from "next/og";

export const alt = "FingerFox free typing games and online typing test";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "76px",
          backgroundColor: "#171715",
          color: "#f5f5f4",
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              backgroundColor: "#e8ddc4",
              color: "#171715",
              fontSize: "36px",
              fontWeight: 700,
            }}
          >
            f
          </div>
          <div style={{ fontSize: "36px", fontWeight: 700 }}>fingerfox</div>
        </div>
        <div style={{ marginTop: "64px", fontSize: "68px", fontWeight: 700, letterSpacing: "-2px" }}>
          Find your typing rhythm.
        </div>
        <div style={{ marginTop: "24px", color: "#b8b8b2", fontSize: "30px" }}>
          Free typing games and online typing tests
        </div>
        <div style={{ marginTop: "54px", color: "#e8ddc4", fontSize: "22px" }}>
          finger-fox.vercel.app
        </div>
      </div>
    ),
    size,
  );
}
