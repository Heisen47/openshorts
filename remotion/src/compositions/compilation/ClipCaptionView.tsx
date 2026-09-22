import React from "react";
import type { ClipCaption } from "../../lib/types";

interface ClipCaptionViewProps {
  caption?: ClipCaption | null;
}

/**
 * Per-clip caption component.
 * Style A: Quote-style caption positioned under title.
 * Style B: Impact-meme caption directly over gameplay footage with 1 keyword in contrasting orange.
 */
export const ClipCaptionView: React.FC<ClipCaptionViewProps> = ({ caption }) => {
  if (!caption || !caption.text) return null;

  if (caption.style === "quote") {
    return (
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 0,
          width: "100%",
          padding: "0 28px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 25,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: 34,
            fontWeight: 800,
            color: "#FFFFFF",
            textAlign: "center",
            textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 10px rgba(0,0,0,0.9)",
            letterSpacing: "0.5px",
            lineHeight: 1.25,
          }}
        >
          {caption.text}
        </span>
      </div>
    );
  }

  // Style B: Impact-meme caption over gameplay footage
  const fullText = caption.text;
  const keyword = caption.highlightKeyword?.trim();

  let renderedContent: React.ReactNode = fullText;

  if (keyword) {
    // Split text by keyword case-insensitively while preserving match
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = fullText.split(regex);

    renderedContent = parts.map((part, index) => {
      const isMatch = part.toLowerCase() === keyword.toLowerCase();
      if (isMatch) {
        return (
          <span
            key={index}
            style={{
              color: "#FF6B00", // Contrasting vibrant orange
              WebkitTextStroke: "2.5px #000000",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))",
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 600,
        left: 0,
        width: "100%",
        padding: "0 36px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 25,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: "'Impact', 'Anton', 'Montserrat', 'Arial Black', sans-serif",
          fontSize: 38,
          fontWeight: 900,
          color: "#FFFFFF",
          textTransform: "uppercase",
          textAlign: "center",
          WebkitTextStroke: "2px #000000",
          textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 14px rgba(0,0,0,0.95)",
          letterSpacing: "1px",
          lineHeight: 1.2,
        }}
      >
        {renderedContent}
      </span>
    </div>
  );
};
