import React, { useState, useEffect, useMemo } from 'react';
import { Player } from '@remotion/player';
import { X, Sparkles, Download, Film, Sliders, Play, Check, AlertCircle, RefreshCw, Layers, Lock } from 'lucide-react';
import { CompilationVideo } from '../remotion/compositions/compilation/CompilationVideo';
import { renderCompilationInBrowser, downloadBlobUrl } from '../lib/renderInBrowser';
import { getApiUrl } from '../config';

const getHighlightKeyword = (text) => {
    if (!text) return 'HE';
    const words = text.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return 'HE';
    const sorted = [...words].sort((a, b) => b.length - a.length);
    return sorted[0].toUpperCase();
};

const formatPunchline = (rawTitle, fallback) => {
    if (!rawTitle) return fallback;
    const clean = rawTitle.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
    return clean.length > 25 ? clean.substring(0, 22) + '...' : clean;
};

const buildCompilationClips = (sourceClips) => {
    if (!sourceClips || sourceClips.length === 0) {
        const slotNumbers = [5, 4, 3, 2, 1];
        const defaultPunchlines = [
            "2B 4A",
            "ninja defuse fail",
            "headshot smoke",
            "dragon rroorr",
            "part 2 cliffhanger"
        ];
        const defaultCaptions = [
            { style: "quote", text: '"Six seven!" :D' },
            { style: "impact", text: "WHY DOES HE SOUND RUSSIAN WHEN HE—", highlightKeyword: "HE" },
            { style: "quote", text: '"Bro is NOT s1mple" 💀' },
            { style: "impact", text: "WAIT TILL YOU SEE WHAT HAPPENS NEXT", highlightKeyword: "SEE" },
            { style: "impact", text: "FOLLOW FOR PART TWO", highlightKeyword: "TWO" },
        ];
        return slotNumbers.map((slotNum, i) => ({
            id: `comp-clip-${slotNum}`,
            slotNumber: slotNum,
            videoUrl: "",
            durationInFrames: 360,
            punchline: defaultPunchlines[i],
            caption: defaultCaptions[i],
        }));
    }

    const count = sourceClips.length;
    // Leave slot 1 as the withheld retention bait
    const totalSlots = Math.max(count + 1, 5);

    return sourceClips.map((c, i) => {
        const rawUrl = c.video_url || c.url || '';
        const videoUrl = rawUrl ? getApiUrl(rawUrl) : '';
        const slotNum = totalSlots - i;
        const rawTitle = c.video_title_for_youtube_short || c.video_title || `Clip #${i + 1}`;
        const punchline = formatPunchline(rawTitle, `Clip #${slotNum}`);
        const durationSec = (c.end && c.start) ? (c.end - c.start) : (c.duration || 12);
        const durationInFrames = Math.max(90, Math.round(durationSec * 30));

        const captionStyle = i % 2 === 0 ? 'quote' : 'impact';
        const captionText = captionStyle === 'quote'
            ? `"${rawTitle}"`
            : rawTitle.toUpperCase();

        return {
            id: `comp-clip-${slotNum}-${i}`,
            slotNumber: slotNum,
            videoUrl,
            durationInFrames,
            punchline,
            caption: {
                style: captionStyle,
                text: captionText,
                highlightKeyword: getHighlightKeyword(rawTitle),
            },
        };
    });
};

export default function CompilationModal({
    isOpen,
    onClose,
    clips = [],
    initialHook = "Wait for the last one 💙😭",
    initialKeepSlot1Blank = true,
}) {
    // 1. Overlay settings: watermark is hardcoded to cs__clipz_
    const [hookText, setHookText] = useState(initialHook);
    const seriesTitle = "cs__clipz_";
    const [keepSlot1Blank, setKeepSlot1Blank] = useState(initialKeepSlot1Blank);

    // 2. Map existing clips into compilation
    const [compilationClips, setCompilationClips] = useState(() => buildCompilationClips(clips));

    // Keep compilation clips synced whenever clips prop updates or modal opens
    useEffect(() => {
        if (clips && clips.length > 0) {
            setCompilationClips(buildCompilationClips(clips));
        }
    }, [clips, isOpen]);

    const [isRendering, setIsRendering] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [renderedUrl, setRenderedUrl] = useState(null);
    const [renderError, setRenderError] = useState(null);

    // Total duration
    const totalFrames = useMemo(() => {
        return compilationClips.reduce((sum, c) => sum + (c.durationInFrames || 360), 0);
    }, [compilationClips]);

    const inputProps = useMemo(() => ({
        width: 720,
        height: 1280,
        fps: 30,
        durationInFrames: totalFrames,
        contentRegion: { top: 330, height: 680 },
        overlay: {
            hookText,
            seriesTitle,
            totalSlots: compilationClips.length,
            keepSlot1Blank,
        },
        clips: compilationClips,
    }), [hookText, seriesTitle, keepSlot1Blank, compilationClips, totalFrames]);

    const updateClip = (index, field, value) => {
        setCompilationClips((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const updateCaption = (index, captionField, value) => {
        setCompilationClips((prev) => {
            const updated = [...prev];
            const currentCaption = updated[index].caption || { style: "quote", text: "" };
            updated[index] = {
                ...updated[index],
                caption: { ...currentCaption, [captionField]: value },
            };
            return updated;
        });
    };

    const handleRender = async () => {
        setIsRendering(true);
        setRenderProgress(0);
        setRenderError(null);
        try {
            const url = await renderCompilationInBrowser({
                clips: compilationClips,
                overlay: inputProps.overlay,
                contentRegion: inputProps.contentRegion,
                fps: 30,
                width: 720,
                height: 1280,
                onProgress: (p) => setRenderProgress(Math.round(p * 100)),
            });
            setRenderedUrl(url);
        } catch (err) {
            console.error("Compilation render failed:", err);
            setRenderError(err?.message || "Failed to render compilation");
        } finally {
            setIsRendering(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-6xl bg-[#0e0e11] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/20 to-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                            <Film size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                Countdown Compilation Studio
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                    720x1280 9:16
                                </span>
                            </h2>
                            <p className="text-xs text-zinc-400">
                                CS2 / Gaming edit style with persistent watermark, countdown list & retention hook
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
                    {/* Left Column: Remotion Live Player (720x1280 aspect ratio) */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center bg-black/50 border border-white/5 rounded-xl p-4">
                        <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                            <Player
                                component={CompilationVideo}
                                inputProps={inputProps}
                                durationInFrames={totalFrames}
                                fps={30}
                                compositionWidth={720}
                                compositionHeight={1280}
                                style={{ width: '100%', height: '100%' }}
                                controls
                                autoPlay
                                loop
                            />
                        </div>
                        <span className="text-[11px] text-zinc-500 mt-2">
                            Interactive Player Preview (30 FPS • ~{Math.round(totalFrames / 30)}s total)
                        </span>
                    </div>

                    {/* Right Column: Settings & Clip Slots */}
                    <div className="lg:col-span-7 flex flex-col space-y-5 overflow-y-auto pr-1 custom-scrollbar">
                        {/* 1. Global Persistent Overlay Settings */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                                    <Layers size={14} className="text-yellow-400" /> Persistent Overlay
                                </span>
                                <span className="text-[10px] text-zinc-400">Stays across entire video</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        Top Hook Line
                                    </label>
                                    <input
                                        type="text"
                                        value={hookText}
                                        onChange={(e) => setHookText(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 text-white text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 transition-colors"
                                        placeholder="Wait for the last one 💙😭"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        Watermark Title (Hardcoded)
                                    </label>
                                    <div className="w-full bg-black/40 border border-red-500/40 text-red-500 text-xs font-black rounded-lg px-3 py-2 flex items-center justify-between">
                                        <span className="tracking-wide">cs__clipz_</span>
                                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 flex items-center gap-1">
                                            <Lock size={10} /> Locked
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Slot 1 Part 2 Bait Toggle */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div>
                                    <span className="text-xs font-semibold text-zinc-200 block">
                                        Slot #1 "Part 2" Hook Bait
                                    </span>
                                    <span className="text-[11px] text-zinc-400">
                                        Deliberately keeps slot #1 blank on screen to farm retention & follow bait
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setKeepSlot1Blank(!keepSlot1Blank)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                        keepSlot1Blank
                                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                    }`}
                                >
                                    {keepSlot1Blank ? 'ACTIVE (Blank Bait)' : 'REVEAL #1'}
                                </button>
                            </div>
                        </div>

                        {/* 2. Numbered Countdown Slots & Per-Clip Captions */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                                    <Sliders size={14} className="text-primary" /> Countdown Slots & Captions
                                </span>
                                <span className="text-[10px] text-zinc-400">Syncs as clips play</span>
                            </div>

                            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                                {compilationClips.map((clip, idx) => (
                                    <div
                                        key={clip.id}
                                        className="bg-black/40 border border-white/5 rounded-lg p-3 space-y-2 hover:border-white/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-md bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 text-xs font-black flex items-center justify-center">
                                                    {clip.slotNumber}
                                                </span>
                                                <span className="text-xs font-bold text-white">
                                                    Slot #{clip.slotNumber} Punchline
                                                </span>
                                                {clip.slotNumber === 1 && keepSlot1Blank && (
                                                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                        Withheld Bait
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-zinc-500">
                                                {Math.round((clip.durationInFrames || 360) / 30)}s
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                value={clip.punchline}
                                                onChange={(e) => updateClip(idx, 'punchline', e.target.value)}
                                                placeholder={`Slot ${clip.slotNumber} label (e.g. 2B 4A)`}
                                                className="w-full bg-black/50 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-yellow-400"
                                            />

                                            {/* Caption Style Selector */}
                                            <select
                                                value={clip.caption?.style || 'quote'}
                                                onChange={(e) => updateCaption(idx, 'style', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary"
                                            >
                                                <option value="quote">Style A: Quote Under Title</option>
                                                <option value="impact">Style B: Impact Meme (Orange Highlight)</option>
                                            </select>
                                        </div>

                                        {/* Caption text & keyword */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                value={clip.caption?.text || ''}
                                                onChange={(e) => updateCaption(idx, 'text', e.target.value)}
                                                placeholder={
                                                    clip.caption?.style === 'impact'
                                                        ? 'WHY DOES HE SOUND RUSSIAN...'
                                                        : '"Six seven!" :D'
                                                }
                                                className="sm:col-span-2 w-full bg-black/50 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary"
                                            />

                                            {clip.caption?.style === 'impact' && (
                                                <input
                                                    type="text"
                                                    value={clip.caption?.highlightKeyword || ''}
                                                    onChange={(e) => updateCaption(idx, 'highlightKeyword', e.target.value)}
                                                    placeholder="Keyword (Orange)"
                                                    className="w-full bg-black/50 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Export / Actions */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">Generate Full MP4 Compilation</span>
                                <span className="text-[11px] text-zinc-400">
                                    Renders 720x1280 60fps/30fps compilation directly in browser
                                </span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {renderedUrl ? (
                                    <button
                                        onClick={() => downloadBlobUrl(renderedUrl, `${seriesTitle.toLowerCase().replace(/\s+/g, '_')}_compilation.mp4`)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl shadow-lg transition-all"
                                    >
                                        <Download size={15} /> Download MP4
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleRender}
                                        disabled={isRendering}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                                            isRendering
                                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-black font-black'
                                        }`}
                                    >
                                        {isRendering ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" />
                                                Rendering ({renderProgress}%)
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={14} /> Render Compilation
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {renderError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                                <AlertCircle size={14} /> {renderError}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
