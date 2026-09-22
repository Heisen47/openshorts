import React from "react";
import type { CompilationOverlayConfig } from "../../lib/types";

interface CompilationOverlayProps {
  config: CompilationOverlayConfig;
  revealedSlotMap: Record<number, string>; // slotNumber -> punchline revealed so far
  activeSlotNumber: number | null; // currently playing slot
}

/**
 * Persistent overlay that stays on screen for the entire video.
 * 1. Top Hook line (bold white sans-serif + emojis).
 * 2. Series Title (bold condensed red font with black/white outline stroke).
 * 3. Numbered countdown list at bottom-left over gameplay (1..5 in yellow with black stroke,
 *    revealing punchline in sync with playing clip, intentionally keeping slot 1 blank).
 */
export const CompilationOverlay: React.FC<CompilationOverlayProps> = ({
  config,
  revealedSlotMap,
  activeSlotNumber,
}) => {
  const totalSlots = config.totalSlots || 5;
  const slots = Array.from({ length: totalSlots }, (_, i) => i + 1);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      {/* 1. Hook Line (Top of frame) */}
      <div
        style={{
          position: "absolute",
          top: 55,
          left: 0,
          width: "100%",
          padding: "0 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: 34,
            fontWeight: 800,
            color: "#FFFFFF",
            textAlign: "center",
            textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 12px rgba(0,0,0,0.85)",
            letterSpacing: "0.2px",
            lineHeight: 1.25,
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.9))",
          }}
        >
          {config.hookText}
        </div>
      </div>

      {/* 2. Series Watermark (Below hook, bold condensed red font with black/white outline stroke, hardcoded cs__clipz_) */}
      <div
        style={{
          position: "absolute",
          top: 135,
          left: 0,
          width: "100%",
          padding: "0 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Impact', 'Anton', 'Arial Black', 'Montserrat', sans-serif",
            fontSize: 54,
            fontWeight: 900,
            color: "#FF1E1E", // Bold punchy red
            letterSpacing: "2.5px",
            textAlign: "center",
            lineHeight: 1.1,
            // Layered outline stroke: sharp black stroke with white outer pop shadow
            WebkitTextStroke: "2.5px #000000",
            textShadow: `
              -2px -2px 0 #FFFFFF,
               2px -2px 0 #FFFFFF,
              -2px  2px 0 #FFFFFF,
               2px  2px 0 #FFFFFF,
               0 4px 12px rgba(0,0,0,0.95)
            `,
          }}
        >
          cs__clipz_
        </div>
      </div>

      {/* 3. Numbered countdown list (Bottom-left, over the gameplay region) */}
      <div
        style={{
          position: "absolute",
          bottom: 300, // Located right over lower gameplay area (region ends at y=1010, height=1280, so 1280-1010=270)
          left: 28,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxWidth: "85%",
        }}
      >
        {slots.map((num) => {
          // If slot 1 and keepSlot1Blank is true, deliberately keep blank (watch-time retention bait)
          const isSlot1 = num === 1;
          const isBlankSlot1 = isSlot1 && config.keepSlot1Blank;
          const punchline = isBlankSlot1 ? "" : revealedSlotMap[num] || "";
          const isActive = activeSlotNumber === num;

          return (
            <div
              key={num}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                transition: "all 0.15s ease",
              }}
            >
              {/* Number: bold yellow with black outline */}
              <span
                style={{
                  fontFamily: "'Impact', 'Anton', 'Arial Black', sans-serif",
                  fontSize: 34,
                  fontWeight: 900,
                  color: isActive ? "#FFF500" : "#FFDD00",
                  WebkitTextStroke: "2px #000000",
                  textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.9)",
                  letterSpacing: "0.5px",
                  minWidth: "30px",
                }}
              >
                {num}.
              </span>

              {/* Punchline label appended next to number when revealed */}
              <span
                style={{
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: isActive ? "#FFFFFF" : "#EAEAEA",
                  WebkitTextStroke: "1.5px #000000",
                  textShadow: "-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 2px 8px rgba(0,0,0,0.9)",
                  letterSpacing: "0.3px",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {punchline}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
