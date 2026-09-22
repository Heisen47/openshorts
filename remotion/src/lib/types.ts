import { z } from "zod";

// --- Word-level caption ---
export interface CaptionWord {
  text: string;
  startMs: number;
  endMs: number;
}

// --- Subtitle config ---
export type SubtitleAnimation = "none" | "word-highlight" | "pop" | "karaoke";
export type SubtitlePosition = "top" | "middle" | "bottom";

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  highlightColor: string;
  borderColor: string;
  borderWidth: number;
  bgColor: string;
  bgOpacity: number;
  animation: SubtitleAnimation;
}

export interface SubtitleConfig {
  captions: CaptionWord[];
  position: SubtitlePosition;
  style: SubtitleStyle;
}

// --- Hook config ---
export type HookPosition = "top" | "center" | "bottom";
export type HookSize = "S" | "M" | "L";
export type HookEntrance = "spring" | "fade" | "slide-up" | "none";
export type HookTheme = "obsidian" | "cyber" | "minimal" | "clean-white";

export interface HookConfig {
  text: string;
  position: HookPosition;
  size: HookSize;
  entranceAnimation: HookEntrance;
  displayDurationSec: number;
  theme?: HookTheme;
}

// --- Effects config ---
export interface EffectSegment {
  startSec: number;
  endSec: number;
  zoom: number;
  zoomCenterX: number;
  zoomCenterY: number;
  brightness: number;
  contrast: number;
  saturate: number;
}

export interface EffectsConfig {
  segments: EffectSegment[];
}

// --- Main composition props ---
export interface ShortVideoProps {
  videoUrl: string;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  subtitles: SubtitleConfig | null;
  hook: HookConfig | null;
  effects: EffectsConfig | null;
  endCta?: string | boolean | null;
}

// --- Zod schemas for validation (used by render service) ---
export const captionWordSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
});

export const subtitleStyleSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number(),
  fontColor: z.string(),
  highlightColor: z.string(),
  borderColor: z.string(),
  borderWidth: z.number(),
  bgColor: z.string(),
  bgOpacity: z.number().min(0).max(1),
  animation: z.enum(["none", "word-highlight", "pop", "karaoke"]),
});

export const subtitleConfigSchema = z.object({
  captions: z.array(captionWordSchema),
  position: z.enum(["top", "middle", "bottom"]),
  style: subtitleStyleSchema,
});

export const hookConfigSchema = z.object({
  text: z.string(),
  position: z.enum(["top", "center", "bottom"]),
  size: z.enum(["S", "M", "L"]),
  entranceAnimation: z.enum(["spring", "fade", "slide-up", "none"]),
  displayDurationSec: z.number().positive(),
  theme: z.enum(["obsidian", "cyber", "minimal", "clean-white"]).optional(),
});

export const effectSegmentSchema = z.object({
  startSec: z.number().min(0),
  endSec: z.number().positive(),
  zoom: z.number().min(0.5).max(3),
  zoomCenterX: z.number().min(0).max(1),
  zoomCenterY: z.number().min(0).max(1),
  brightness: z.number().min(0).max(3),
  contrast: z.number().min(0).max(3),
  saturate: z.number().min(0).max(3),
});

export const effectsConfigSchema = z.object({
  segments: z.array(effectSegmentSchema),
});

export const shortVideoPropsSchema = z.object({
  videoUrl: z.string(),
  durationInFrames: z.number().int().positive(),
  fps: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  subtitles: subtitleConfigSchema.nullable(),
  hook: hookConfigSchema.nullable(),
  effects: effectsConfigSchema.nullable(),
  endCta: z.union([z.string(), z.boolean()]).nullable().optional(),
});

// --- Compilation Video Types & Schemas ---

export type CaptionStyleType = "quote" | "impact";

export interface ClipCaption {
  style: CaptionStyleType;
  text: string;
  highlightKeyword?: string; // Highlighted in contrasting orange for "impact" style
}

export interface CompilationClip {
  id: string;
  videoUrl: string;
  durationInFrames: number;
  slotNumber: number; // e.g. 5, 4, 3, 2, 1
  punchline: string; // Text revealed next to countdown number
  caption?: ClipCaption | null;
}

export interface CompilationOverlayConfig {
  hookText: string; // e.g. "Wait for the last one 💙😭"
  seriesTitle: string; // e.g. "CS2 FUNNY MOMENTS"
  totalSlots: number; // default 5
  keepSlot1Blank: boolean; // default true: slot 1 withheld to bait watch-time / Part 2
  slot1Placeholder?: string;
}

export interface CompilationContentRegion {
  top: number; // default 330
  height: number; // default 680 (330 to 1010)
}

export interface CompilationVideoProps {
  clips: CompilationClip[];
  overlay: CompilationOverlayConfig;
  durationInFrames?: number;
  fps?: number; // default 30
  width?: number; // default 720
  height?: number; // default 1280
  contentRegion?: CompilationContentRegion;
}

export const clipCaptionSchema = z.object({
  style: z.enum(["quote", "impact"]),
  text: z.string(),
  highlightKeyword: z.string().optional(),
});

export const compilationClipSchema = z.object({
  id: z.string(),
  videoUrl: z.string(),
  durationInFrames: z.number().int().positive(),
  slotNumber: z.number().int().min(1).max(20),
  punchline: z.string(),
  caption: clipCaptionSchema.nullable().optional(),
});

export const compilationOverlayConfigSchema = z.object({
  hookText: z.string(),
  seriesTitle: z.string(),
  totalSlots: z.number().int().min(1).default(5),
  keepSlot1Blank: z.boolean().default(true),
  slot1Placeholder: z.string().optional(),
});

export const compilationContentRegionSchema = z.object({
  top: z.number().default(330),
  height: z.number().default(680),
});

export const compilationVideoPropsSchema = z.object({
  clips: z.array(compilationClipSchema),
  overlay: compilationOverlayConfigSchema,
  durationInFrames: z.number().int().positive().optional(),
  fps: z.number().positive().default(30),
  width: z.number().int().positive().default(720),
  height: z.number().int().positive().default(1280),
  contentRegion: compilationContentRegionSchema.optional(),
});

