import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

interface OutroOverlayProps {
  text?: string;
  durationSec?: number;
}

export const OutroOverlay: React.FC<OutroOverlayProps> = ({
  text = "Follow me for more such content",
  durationSec = 2.0,
}) => {
  const { durationInFrames, fps } = useVideoConfig();
  const outroFrames = Math.min(durationInFrames, Math.round(durationSec * fps));
  const startFrame = Math.max(0, durationInFrames - outroFrames);

  return (
    <Sequence from={startFrame} durationInFrames={outroFrames} layout="none">
      <OutroScreen text={text} outroFrames={outroFrames} />
    </Sequence>
  );
};

interface OutroScreenProps {
  text: string;
  outroFrames: number;
}

const OutroScreen: React.FC<OutroScreenProps> = ({ text, outroFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth fade into pitch black (first 10-12 frames)
  const fadeProgress = interpolate(frame, [0, Math.min(12, outroFrames)], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Spring entrance for outro content
  const contentSpring = spring({
    frame: Math.max(0, frame - 3),
    fps,
    config: { mass: 0.8, stiffness: 180, damping: 14 },
  });

  const contentScale = interpolate(contentSpring, [0, 1], [0.85, 1]);
  const contentOpacity = interpolate(contentSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        opacity: fadeProgress,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          opacity: contentOpacity,
          transform: `scale(${contentScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "85%",
          padding: "20px",
        }}
      >
        {/* Sleek Follow Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 24px",
            borderRadius: 9999,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1.5px solid rgba(251, 191, 36, 0.6)",
            boxShadow: "0 0 25px rgba(251, 191, 36, 0.25)",
            marginBottom: 28,
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#FBBF24",
              textTransform: "uppercase",
            }}
          >
            + Follow
          </span>
        </div>

        {/* Main Outro CTA Text */}
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.25,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            margin: 0,
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.8)",
          }}
        >
          {text}
        </h1>

        {/* Sleek Minimal Accent Divider */}
        <div
          style={{
            width: 90,
            height: 3,
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            borderRadius: 9999,
            marginTop: 32,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
