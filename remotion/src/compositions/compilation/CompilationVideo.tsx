import React, { useMemo } from "react";
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import type { CompilationVideoProps, CompilationClip } from "../../lib/types";
import { CompilationOverlay } from "./CompilationOverlay";
import { ClipCaptionView } from "./ClipCaptionView";

/**
 * Fallback visual when videoUrl is empty (useful for testing and previews)
 */
const FallbackClipVisual: React.FC<{ clip: CompilationClip; index: number }> = ({ clip, index }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#18181b",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#a1a1aa",
        fontFamily: "system-ui, sans-serif",
        gap: 12,
        border: "1px solid #27272a",
      }}
    >
      <div style={{ fontSize: 48 }}>🎮</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>
        Clip #{index + 1} (Slot {clip.slotNumber})
      </div>
      <div style={{ fontSize: 16, color: "#71717a" }}>{clip.punchline || "Gaming Clip"}</div>
    </div>
  );
};

/**
 * CompilationVideo composition:
 * - 720x1280 canvas (9:16), solid black background.
 * - Fixed content region: y=330 to y=1010 (height 680px), horizontally centered, object-fit contain.
 * - Persistent overlay with hook, red condensed outlined title, and bottom-left countdown list.
 * - Countdown slot reveal logic + slot 1 bait retention.
 * - Hard cuts between clips (no crossfade).
 * - Per-clip captions (Style A quote under title, Style B impact meme over footage).
 */
export const CompilationVideo: React.FC<Record<string, unknown>> = (rawProps) => {
  const props = rawProps as unknown as CompilationVideoProps;
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clips = props.clips || [];
  const overlayConfig = props.overlay || {
    hookText: "Wait for the last one 💙😭",
    seriesTitle: "cs__clipz_",
    totalSlots: 5,
    keepSlot1Blank: true,
  };

  const contentTop = props.contentRegion?.top ?? 330;
  const contentHeight = props.contentRegion?.height ?? 680; // 330 to 1010

  // Calculate cumulative timeline for clips to sync countdown reveal & captions
  const clipRanges = useMemo(() => {
    let accumulated = 0;
    return clips.map((clip) => {
      const start = accumulated;
      const duration = clip.durationInFrames || Math.round(12 * (fps || 30));
      const end = start + duration;
      accumulated = end;
      return { clip, start, end, duration };
    });
  }, [clips, fps]);

  // Determine active clip and all revealed slot punchlines based on currentFrame
  const { activeClip, activeSlotNumber, revealedSlotMap } = useMemo(() => {
    const revealed: Record<number, string> = {};
    let active: CompilationClip | null = null;
    let activeSlot: number | null = null;

    for (const range of clipRanges) {
      if (currentFrame >= range.start) {
        // This clip has played or is currently playing -> reveal its punchline
        revealed[range.clip.slotNumber] = range.clip.punchline;

        if (currentFrame < range.end) {
          active = range.clip;
          activeSlot = range.clip.slotNumber;
        }
      }
    }

    return {
      activeClip: active,
      activeSlotNumber: activeSlot,
      revealedSlotMap: revealed,
    };
  }, [clipRanges, currentFrame]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      {/* Fixed Content Region (y=330 to y=1010) */}
      <div
        style={{
          position: "absolute",
          top: contentTop,
          left: 0,
          width: "100%",
          height: contentHeight,
          backgroundColor: "#000000",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Series>
          {clipRanges.map(({ clip, duration }, idx) => (
            <Series.Sequence key={clip.id || idx} durationInFrames={duration}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000000",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {clip.videoUrl ? (
                  <Video
                    src={clip.videoUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain", // Letterbox/pillarbox natively without distortion
                    }}
                  />
                ) : (
                  <FallbackClipVisual clip={clip} index={idx} />
                )}
              </div>
            </Series.Sequence>
          ))}
        </Series>
      </div>

      {/* Per-Clip Captions Layer: Updates per clip */}
      {activeClip?.caption && <ClipCaptionView caption={activeClip.caption} />}

      {/* Persistent Overlay Layer: Unaffected by clip cuts */}
      <CompilationOverlay
        config={overlayConfig}
        revealedSlotMap={revealedSlotMap}
        activeSlotNumber={activeSlotNumber}
      />
    </AbsoluteFill>
  );
};
