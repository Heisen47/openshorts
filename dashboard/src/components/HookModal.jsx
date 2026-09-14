import React, { useState } from 'react';
import { X, Sparkles, Loader2, Maximize, MoveVertical, Zap, Palette } from 'lucide-react';
import RemotionPreview from './RemotionPreview';

const ENTRANCE_OPTIONS = [
    { value: 'spring', label: 'Bounce' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'none', label: 'None' },
];

const THEME_OPTIONS = [
    { value: 'obsidian', label: 'Obsidian Glass', badge: '⚡ WAIT FOR IT' },
    { value: 'cyber', label: 'Cyber Glow', badge: '🔥 MUST WATCH' },
    { value: 'minimal', label: 'Minimal Dark', badge: null },
    { value: 'clean-white', label: 'Crisp White', badge: '💡 POV' },
];

export default function HookModal({ isOpen, onClose, onGenerate, isProcessing, videoUrl, initialText, durationInSeconds, existingSubtitles, existingHook }) {
    const [text, setText] = useState(existingHook?.text || initialText || 'POV: You are using the viral hook feature');
    const [position, setPosition] = useState(existingHook?.position || 'top');
    const [size, setSize] = useState(existingHook?.size || 'M');
    const [theme, setTheme] = useState(existingHook?.theme || 'obsidian');
    const [entranceAnimation, setEntranceAnimation] = useState(existingHook?.entranceAnimation || 'spring');
    const [displayDuration, setDisplayDuration] = useState(existingHook?.displayDurationSec || 5);

    if (!isOpen) return null;

    // Build hook config for Remotion preview
    const hookConfig = {
        text: text || 'Enter your text...',
        position,
        size,
        theme,
        entranceAnimation,
        displayDurationSec: displayDuration,
    };

    const useRemotionPreview = !!videoUrl;

    // Fallback preview styles
    const getPositionClass = () => {
        switch (position) {
            case 'center': return 'items-center justify-center';
            case 'bottom': return 'items-center justify-end pb-[20%]';
            case 'top': default: return 'items-center justify-start pt-[14%]';
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'S': return { fontSize: '15px', maxWidth: '82%' };
            case 'L': return { fontSize: '24px', maxWidth: '92%' };
            case 'M': default: return { fontSize: '19px', maxWidth: '88%' };
        }
    };

    const getFallbackThemeStyle = () => {
        switch (theme) {
            case 'cyber':
                return {
                    background: 'linear-gradient(135deg, rgba(12, 16, 28, 0.95), rgba(6, 9, 18, 0.98))',
                    border: '1.5px solid rgba(34, 211, 238, 0.5)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 25px rgba(34, 211, 238, 0.25)',
                    color: '#FFFFFF',
                    badgeBg: 'rgba(34, 211, 238, 0.2)',
                    badgeBorder: 'rgba(34, 211, 238, 0.5)',
                    badgeText: '#22D3EE',
                    badgeLabel: '🔥 MUST WATCH',
                };
            case 'clean-white':
                return {
                    background: 'linear-gradient(180deg, #FFFFFF, #F1F5F9)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                    color: '#0F172A',
                    badgeBg: 'rgba(0, 0, 0, 0.06)',
                    badgeBorder: 'rgba(0, 0, 0, 0.12)',
                    badgeText: '#1E293B',
                    badgeLabel: '💡 POV',
                };
            case 'minimal':
                return {
                    background: 'rgba(10, 10, 14, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                    color: '#F8FAFC',
                    badgeLabel: null,
                };
            case 'obsidian':
            default:
                return {
                    background: 'linear-gradient(145deg, rgba(20, 22, 32, 0.94), rgba(10, 11, 16, 0.97))',
                    border: '1.5px solid rgba(255, 255, 255, 0.16)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.85), 0 0 30px rgba(234, 179, 8, 0.15)',
                    color: '#FFFFFF',
                    badgeBg: 'rgba(234, 179, 8, 0.15)',
                    badgeBorder: 'rgba(234, 179, 8, 0.4)',
                    badgeText: '#FBBF24',
                    badgeLabel: '⚡ WAIT FOR IT',
                };
        }
    };

    const currentThemeStyle = getFallbackThemeStyle();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row gap-6 max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10"
                >
                    <X size={20} />
                </button>

                {/* Left: Preview */}
                <div className="flex-1 flex flex-col items-center justify-center bg-black rounded-lg border border-white/5 overflow-hidden relative aspect-[9/16] max-h-[600px]">
                    {useRemotionPreview ? (
                        <RemotionPreview
                            videoUrl={videoUrl}
                            durationInSeconds={durationInSeconds || 30}
                            hook={hookConfig}
                            subtitles={existingSubtitles || null}
                        />
                    ) : (
                        <>
                            <video src={videoUrl} className="w-full h-full object-contain opacity-50" muted playsInline />
                            <div className={`absolute w-full px-8 text-center transition-all duration-300 pointer-events-none flex flex-col h-full ${getPositionClass()}`}>
                                <div
                                    className="font-extrabold rounded-2xl transition-all duration-200 flex flex-col items-center text-center backdrop-blur-md"
                                    style={{
                                        ...getSizeStyle(),
                                        background: currentThemeStyle.background,
                                        border: currentThemeStyle.border,
                                        boxShadow: currentThemeStyle.boxShadow,
                                        color: currentThemeStyle.color,
                                        padding: '16px 20px',
                                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        letterSpacing: '-0.01em',
                                        lineHeight: 1.35,
                                    }}
                                >
                                    {currentThemeStyle.badgeLabel && (
                                        <div
                                            className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1"
                                            style={{
                                                backgroundColor: currentThemeStyle.badgeBg,
                                                border: `1px solid ${currentThemeStyle.badgeBorder}`,
                                                color: currentThemeStyle.badgeText,
                                            }}
                                        >
                                            {currentThemeStyle.badgeLabel}
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">
                                        {text || "Enter your text..."}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="w-full md:w-80 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="text-yellow-400" /> Viral Hook
                    </h3>

                    <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {/* Text Input */}
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Text</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={3}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50 resize-none font-sans font-semibold text-sm"
                                placeholder="Enter text that will stop the scroll..."
                            />
                        </div>

                        {/* Theme Control */}
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                                <Palette size={13} className="text-amber-400" /> Aesthetic Theme
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {THEME_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setTheme(opt.value)}
                                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-0.5 ${theme === opt.value
                                            ? 'bg-amber-400/10 text-amber-300 border-amber-400 shadow-sm shadow-amber-400/10'
                                            : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-zinc-200'
                                            }`}
                                    >
                                        <span>{opt.label}</span>
                                        <span className="text-[9px] text-zinc-500 font-normal truncate">
                                            {opt.badge || 'Clean aesthetic'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Position Control */}
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <MoveVertical size={12} /> Position
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['top', 'center', 'bottom'].map((pos) => (
                                    <button
                                        key={pos}
                                        type="button"
                                        onClick={() => setPosition(pos)}
                                        className={`py-2 px-1 rounded-lg text-xs font-bold capitalize transition-all border ${position === pos
                                            ? 'bg-white text-black border-white'
                                            : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        {pos}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Control */}
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Maximize size={12} /> Size
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['S', 'M', 'L'].map((sz) => (
                                    <button
                                        key={sz}
                                        type="button"
                                        onClick={() => setSize(sz)}
                                        className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${size === sz
                                            ? 'bg-white text-black border-white'
                                            : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        {sz === 'S' ? 'Small' : sz === 'M' ? 'Medium' : 'Large'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Entrance Animation */}
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Zap size={12} /> Entrance
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {ENTRANCE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setEntranceAnimation(opt.value)}
                                        className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${entranceAnimation === opt.value
                                            ? 'bg-white text-black border-white'
                                            : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Display Duration */}
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Duration: {displayDuration}s</label>
                            <input
                                type="range"
                                min="2"
                                max="15"
                                value={displayDuration}
                                onChange={(e) => setDisplayDuration(parseInt(e.target.value))}
                                className="w-full accent-yellow-500"
                            />
                            <div className="flex justify-between text-[10px] text-zinc-500">
                                <span>2s</span>
                                <span>15s</span>
                            </div>
                        </div>

                        <div className="p-3 bg-amber-400/5 rounded-xl border border-amber-400/20 text-[11px] text-zinc-300">
                            <strong className="text-amber-400">Pro Tip:</strong> Obsidian Glass with punchy POV / curiosity gap boosts 3-second retention by 30%+.
                        </div>
                    </div>

                    <button
                        onClick={() => onGenerate({
                            text, position, size, theme,
                            // Remotion data
                            remotion: hookConfig,
                        })}
                        disabled={isProcessing || !text.trim()}
                        className="w-full py-3.5 mt-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        {isProcessing ? 'Generating...' : 'Apply Viral Hook'}
                    </button>
                </div>
            </div>
        </div>
    );
}
