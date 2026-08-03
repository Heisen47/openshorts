import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, Cpu, ExternalLink, Info, Sparkles } from 'lucide-react';

export const MODEL_OPTIONS = [
    {
        category: "⚡ Google Gemini Models",
        items: [
            { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", badge: "Default & Fast", desc: "Balanced speed and clip extraction accuracy." },
            { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", badge: "Best Quality", desc: "Deep reasoning model for high-CTR clip selection." },
            { id: "gemini-3-flash-preview", name: "Gemini 3.0 Flash Preview", badge: "Next Gen", desc: "Latest Gemini 3 multimodal architecture." },
            { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", badge: "Ultra Fast", desc: "High-speed low-latency processing." }
        ]
    },
    {
        category: "🇨🇳 Chinese Open Source Models (via OpenRouter / DeepSeek API)",
        items: [
            { id: "deepseek/deepseek-chat", name: "DeepSeek V3", badge: "Top Open Source", desc: "High performance, cost effective, & smart clip detection." },
            { id: "deepseek/deepseek-r1", name: "DeepSeek R1", badge: "Reasoning", desc: "State-of-the-art chain-of-thought analysis for long videos." },
            { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", badge: "Alibaba AI", desc: "Exceptional multilingual & structured JSON generation." }
        ]
    }
];

export default function KeyInput({ 
    onKeySet, 
    savedKey, 
    savedOpenRouterKey = '', 
    onOpenRouterKeySet, 
    selectedModel = 'gemini-2.5-flash', 
    onModelSelect 
}) {
    const [geminiKey, setGeminiKey] = useState(savedKey || '');
    const [openRouterKey, setOpenRouterKey] = useState(savedOpenRouterKey || '');
    const [showGemini, setShowGemini] = useState(false);
    const [showOpenRouter, setShowOpenRouter] = useState(false);
    const [geminiSaved, setGeminiSaved] = useState(!!savedKey);
    const [openRouterSaved, setOpenRouterSaved] = useState(!!savedOpenRouterKey);
    const [model, setModel] = useState(selectedModel);

    useEffect(() => {
        if (savedKey) setGeminiKey(savedKey);
        if (savedOpenRouterKey) setOpenRouterKey(savedOpenRouterKey);
        if (selectedModel) setModel(selectedModel);
    }, [savedKey, savedOpenRouterKey, selectedModel]);

    const isChineseModel = model.startsWith("deepseek") || model.startsWith("qwen") || model.includes("/");

    const handleSaveGemini = () => {
        if (geminiKey.trim().length > 0) {
            onKeySet(geminiKey);
            setGeminiSaved(true);
        }
    };

    const handleSaveOpenRouter = () => {
        if (openRouterKey.trim().length > 0) {
            if (onOpenRouterKeySet) onOpenRouterKeySet(openRouterKey);
            setOpenRouterSaved(true);
        }
    };

    const handleModelChange = (e) => {
        const val = e.target.value;
        setModel(val);
        if (onModelSelect) onModelSelect(val);
    };

    return (
        <div className="bg-surface border border-white/5 rounded-2xl p-6 mb-8 animate-[fadeIn_0.5s_ease-out] space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        <Cpu size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">AI Model & API Key Configuration</h2>
                        <p className="text-xs text-zinc-400">Choose your LLM model for viral moment detection and clip scoring.</p>
                    </div>
                </div>

                {/* LLM Model Selector Dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Selected Model:</span>
                    <select
                        value={model}
                        onChange={handleModelChange}
                        className="bg-black/40 border border-white/10 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                        {MODEL_OPTIONS.map((group, gIdx) => (
                            <optgroup key={gIdx} label={group.category}>
                                {group.items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} ({item.badge})
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
            </div>

            {/* Selected Model Description Banner */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400 shrink-0" />
                    <span className="text-zinc-300">
                        Active Model: <strong className="text-white font-semibold">{model}</strong>
                    </span>
                </div>
                {isChineseModel ? (
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full text-[11px] font-medium">
                        Requires OpenRouter / DeepSeek Key
                    </span>
                ) : (
                    <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full text-[11px] font-medium">
                        Requires Gemini API Key
                    </span>
                )}
            </div>

            {/* Keys Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gemini API Key */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Key size={14} className="text-primary" /> Google Gemini API Key
                        </label>
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-[11px] flex items-center gap-1"
                        >
                            Get Free Key <ExternalLink size={10} />
                        </a>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type={showGemini ? "text" : "password"}
                                value={geminiKey}
                                onChange={(e) => {
                                    setGeminiKey(e.target.value);
                                    setGeminiSaved(false);
                                }}
                                placeholder="AIzaSy..."
                                className="input-field pr-10 font-mono text-xs"
                            />
                            <button
                                type="button"
                                onClick={() => setShowGemini(!showGemini)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                            >
                                {showGemini ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleSaveGemini}
                            disabled={!geminiKey || geminiSaved}
                            className={`px-4 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                                geminiSaved
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                                    : 'bg-primary hover:bg-blue-600 text-white'
                            }`}
                        >
                            {geminiSaved ? <><Check size={14} /> Saved</> : 'Save'}
                        </button>
                    </div>
                </div>

                {/* OpenRouter / DeepSeek API Key */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Key size={14} className="text-purple-400" /> OpenRouter / DeepSeek API Key
                        </label>
                        <a
                            href="https://openrouter.ai/keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline text-[11px] flex items-center gap-1"
                        >
                            Get OpenRouter Key <ExternalLink size={10} />
                        </a>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type={showOpenRouter ? "text" : "password"}
                                value={openRouterKey}
                                onChange={(e) => {
                                    setOpenRouterKey(e.target.value);
                                    setOpenRouterSaved(false);
                                }}
                                placeholder="sk-or-v1-..."
                                className="input-field pr-10 font-mono text-xs"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOpenRouter(!showOpenRouter)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                            >
                                {showOpenRouter ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleSaveOpenRouter}
                            disabled={!openRouterKey || openRouterSaved}
                            className={`px-4 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                                openRouterSaved
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                        >
                            {openRouterSaved ? <><Check size={14} /> Saved</> : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Step-by-Step Guide for OpenRouter Key */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-300 font-semibold mb-1">
                    <Info size={14} className="text-purple-400" /> How to get a free OpenRouter API key for DeepSeek & Qwen:
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-zinc-400 pl-1">
                    <li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline font-mono">openrouter.ai/keys</a> and sign in.</li>
                    <li>Click <strong>"Create Key"</strong>, name it (e.g. <code>OpenShorts</code>), and copy key starting with <code>sk-or-v1-...</code>.</li>
                    <li>Paste key in the field above and click <strong>Save</strong>.</li>
                </ol>
            </div>
        </div>
    );
}
