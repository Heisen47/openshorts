import React from "react";
import { Composition } from "remotion";
import { ShortVideo } from "./compositions/ShortVideo";
import { CompilationVideo } from "./compositions/compilation/CompilationVideo";
import type { ShortVideoProps, CompilationVideoProps } from "./lib/types";
import { shortVideoPropsSchema, compilationVideoPropsSchema } from "./lib/types";

const DEFAULT_PROPS: ShortVideoProps = {
  videoUrl: "",
  durationInFrames: 900, // 30s at 30fps
  fps: 30,
  width: 1080,
  height: 1920,
  subtitles: {
    captions: [
      { text: "This", startMs: 0, endMs: 400 },
      { text: "is", startMs: 400, endMs: 600 },
      { text: "a", startMs: 600, endMs: 750 },
      { text: "demo", startMs: 750, endMs: 1200 },
      { text: "of", startMs: 1200, endMs: 1400 },
      { text: "animated", startMs: 1400, endMs: 2000 },
      { text: "subtitles", startMs: 2000, endMs: 2800 },
      { text: "in", startMs: 2800, endMs: 3000 },
      { text: "Remotion", startMs: 3000, endMs: 3800 },
      { text: "with", startMs: 4000, endMs: 4300 },
      { text: "word", startMs: 4300, endMs: 4700 },
      { text: "level", startMs: 4700, endMs: 5100 },
      { text: "highlighting", startMs: 5100, endMs: 6000 },
    ],
    position: "bottom",
    style: {
      fontFamily: "Arial",
      fontSize: 52,
      fontColor: "#FFFFFF",
      highlightColor: "#FFDD00",
      borderColor: "#000000",
      borderWidth: 3,
      bgColor: "#000000",
      bgOpacity: 0,
      animation: "pop",
    },
  },
  hook: {
    text: "POV: You just discovered OpenShorts",
    position: "top",
    size: "M",
    entranceAnimation: "spring",
    displayDurationSec: 5,
  },
  effects: {
    segments: [
      {
        startSec: 2,
        endSec: 5,
        zoom: 1.2,
        zoomCenterX: 0.5,
        zoomCenterY: 0.35,
        brightness: 1.05,
        contrast: 1.1,
        saturate: 1.15,
      },
      {
        startSec: 8,
        endSec: 12,
        zoom: 1.15,
        zoomCenterX: 0.5,
        zoomCenterY: 0.4,
        brightness: 1,
        contrast: 1,
        saturate: 1,
      },
    ],
  },
};



const DEFAULT_COMPILATION_PROPS: CompilationVideoProps = {
  width: 720,
  height: 1280,
  fps: 30,
  durationInFrames: 1800, // 60s total
  contentRegion: {
    top: 330,
    height: 680,
  },
  overlay: {
    hookText: "Wait for the last one 💙😭",
    seriesTitle: "CS2 FUNNY MOMENTS",
    totalSlots: 5,
    keepSlot1Blank: true,
  },
  clips: [
    {
      id: "clip-5",
      slotNumber: 5,
      videoUrl: "",
      durationInFrames: 360, // 12s
      punchline: "2B 4A",
      caption: {
        style: "quote",
        text: '"Six seven!" :D',
      },
    },
    {
      id: "clip-4",
      slotNumber: 4,
      videoUrl: "",
      durationInFrames: 360, // 12s
      punchline: "ninja defuse fail",
      caption: {
        style: "impact",
        text: "WHY DOES HE SOUND RUSSIAN WHEN HE—",
        highlightKeyword: "HE",
      },
    },
    {
      id: "clip-3",
      slotNumber: 3,
      videoUrl: "",
      durationInFrames: 360, // 12s
      punchline: "headshot through smoke",
      caption: {
        style: "quote",
        text: '"Bro is NOT s1mple" 💀',
      },
    },
    {
      id: "clip-2",
      slotNumber: 2,
      videoUrl: "",
      durationInFrames: 360, // 12s
      punchline: "dragon rroorr",
      caption: {
        style: "impact",
        text: "WAIT TILL YOU SEE WHAT HAPPENS NEXT",
        highlightKeyword: "SEE",
      },
    },
    {
      id: "clip-cliffhanger",
      slotNumber: 1, // Deliberately keeps slot 1 punchline blank on screen
      videoUrl: "",
      durationInFrames: 360, // 12s
      punchline: "part 2 cliffhanger",
      caption: {
        style: "impact",
        text: "FOLLOW FOR PART TWO",
        highlightKeyword: "TWO",
      },
    },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShortVideo"
        schema={shortVideoPropsSchema}
        component={ShortVideo}
        durationInFrames={DEFAULT_PROPS.durationInFrames}
        fps={DEFAULT_PROPS.fps}
        width={DEFAULT_PROPS.width}
        height={DEFAULT_PROPS.height}
        defaultProps={DEFAULT_PROPS}
      />
      <Composition
        id="CompilationVideo"
        schema={compilationVideoPropsSchema}
        component={CompilationVideo}
        durationInFrames={DEFAULT_COMPILATION_PROPS.durationInFrames || 1800}
        fps={DEFAULT_COMPILATION_PROPS.fps || 30}
        width={DEFAULT_COMPILATION_PROPS.width || 720}
        height={DEFAULT_COMPILATION_PROPS.height || 1280}
        defaultProps={DEFAULT_COMPILATION_PROPS}
      />
    </>
  );
};

