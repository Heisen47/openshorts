import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { HookConfig } from "../lib/types";

interface HookOverlayProps {
  config: HookConfig;
}

const SIZE_SCALE: Record<string, number> = {
  S: 0.82,
  M: 1.0,
  L: 1.25,
};

const POSITION_STYLE: Record<string, React.CSSProperties> = {
  top: { top: "14%", bottom: "auto" },
  center: { top: "50%", bottom: "auto", transform: "translateY(-50%)" },
  bottom: { top: "66%", bottom: "auto" },
};

const THEME_STYLES: Record<
  string,
  {
    container: React.CSSProperties;
    badge?: { bg: string; text: string; label: string; border?: string; shadow?: string };
    text: React.CSSProperties;
  }
> = {
  obsidian: {
    container: {
      background:
        "linear-gradient(145deg, rgba(20, 22, 32, 0.94) 0%, rgba(10, 11, 16, 0.97) 100%)",
      border: "1.5px solid rgba(255, 255, 255, 0.16)",
      boxShadow:
        "0 24px 48px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(234, 179, 8, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    },
    badge: {
      bg: "rgba(234, 179, 8, 0.15)",
      text: "#FBBF24",
      label: "⚡ WAIT FOR IT",
      border: "1px solid rgba(234, 179, 8, 0.4)",
      shadow: "0 0 15px rgba(234, 179, 8, 0.2)",
    },
    text: {
      color: "#FFFFFF",
      textShadow: "0 2px 12px rgba(0, 0, 0, 0.6)",
    },
  },
  cyber: {
    container: {
      background:
        "linear-gradient(135deg, rgba(12, 16, 28, 0.95) 0%, rgba(6, 9, 18, 0.98) 100%)",
      border: "1.5px solid rgba(34, 211, 238, 0.4)",
      boxShadow:
        "0 24px 48px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(34, 211, 238, 0.25), inset 0 1px 1px rgba(34, 211, 238, 0.4)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    },
    badge: {
      bg: "rgba(34, 211, 238, 0.18)",
      text: "#22D3EE",
      label: "🔥 MUST WATCH",
      border: "1px solid rgba(34, 211, 238, 0.5)",
      shadow: "0 0 15px rgba(34, 211, 238, 0.3)",
    },
    text: {
      color: "#FFFFFF",
      textShadow: "0 0 15px rgba(34, 211, 238, 0.3)",
    },
  },
  minimal: {
    container: {
      background: "rgba(10, 10, 12, 0.88)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    },
    text: {
      color: "#F8FAFC",
    },
  },
  "clean-white": {
    container: {
      background:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)",
      border: "1px solid rgba(0, 0, 0, 0.08)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 4px 15px rgba(0, 0, 0, 0.15)",
    },
    badge: {
      bg: "rgba(0, 0, 0, 0.06)",
      text: "#1E293B",
      label: "💡 POV",
      border: "1px solid rgba(0, 0, 0, 0.12)",
    },
    text: {
      color: "#0F172A",
    },
  },
};

export const HookOverlay: React.FC<HookOverlayProps> = ({ config }) => {
  const { fps } = useVideoConfig();
  const displayFrames = Math.round(config.displayDurationSec * fps);

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={displayFrames} layout="none">
        <HookBox config={config} displayFrames={displayFrames} />
      </Sequence>
    </AbsoluteFill>
  );
};

interface HookBoxProps {
  config: HookConfig;
  displayFrames: number;
}

const HookBox: React.FC<HookBoxProps> = ({ config, displayFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = SIZE_SCALE[config.size] ?? 1.0;

  // Entrance animation
  let animOpacity = 1;
  let animScale = 1;
  let animTranslateY = 0;

  switch (config.entranceAnimation) {
    case "spring": {
      const prog = spring({
        frame,
        fps,
        config: { mass: 0.8, stiffness: 200, damping: 15 },
        durationInFrames: 20,
      });
      animScale = interpolate(prog, [0, 1], [0.8, 1]);
      animOpacity = interpolate(prog, [0, 1], [0, 1]);
      break;
    }
    case "fade": {
      animOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      });
      break;
    }
    case "slide-up": {
      const prog = spring({
        frame,
        fps,
        config: { mass: 1, stiffness: 150, damping: 18 },
        durationInFrames: 20,
      });
      animTranslateY = interpolate(prog, [0, 1], [50, 0]);
      animOpacity = interpolate(prog, [0, 1], [0, 1]);
      break;
    }
    default:
      break;
  }

  // Exit fade (last 15 frames)
  const fadeOutStart = displayFrames - 15;
  if (frame > fadeOutStart) {
    animOpacity *= interpolate(frame, [fadeOutStart, displayFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  const positionStyle = POSITION_STYLE[config.position] ?? POSITION_STYLE.top;
  const themeName = config.theme ?? "obsidian";
  const theme = THEME_STYLES[themeName] ?? THEME_STYLES.obsidian;

  // Base font size: 4.6% of 1080 width
  const baseFontSize = 1080 * 0.046;
  const fontSize = Math.round(baseFontSize * scale);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        ...positionStyle,
      }}
    >
      <div
        style={{
          opacity: animOpacity,
          transform: `scale(${animScale}) translateY(${animTranslateY}px)`,
          maxWidth: "88%",
          borderRadius: 24,
          padding: `${22 * scale}px ${28 * scale}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          ...theme.container,
        }}
      >
        {/* Retention Tag / Badge */}
        {theme.badge && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: `${4 * scale}px ${14 * scale}px`,
              borderRadius: 9999,
              backgroundColor: theme.badge.bg,
              border: theme.badge.border,
              boxShadow: theme.badge.shadow,
              marginBottom: 10 * scale,
            }}
          >
            <span
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', 'Inter', -apple-system, system-ui, sans-serif",
                fontSize: Math.round(13 * scale),
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: theme.badge.text,
                textTransform: "uppercase",
              }}
            >
              {theme.badge.label}
            </span>
          </div>
        )}

        {/* Hook text */}
        <span
          style={{
            fontFamily:
              "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize,
            fontWeight: 800,
            lineHeight: 1.32,
            letterSpacing: "-0.015em",
            wordBreak: "break-word",
            ...theme.text,
          }}
        >
          {config.text}
        </span>
      </div>
    </div>
  );
};
