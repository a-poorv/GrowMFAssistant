"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, Info, ExternalLink, AlertTriangle, CheckCircle2, Plus } from "lucide-react";

type Citation = {
    label: string;
    url: string;
};

type ChatResponse = {
    type: "FACTUAL" | "ADVISORY" | "ERROR";
    reply: string;
    citation: Citation | null;
    updatedAt: string | null;
};

// Helper to convert URLs in text to clickable links
const formatResponseText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
                >
                    {part.length > 50 ? part.substring(0, 47) + "..." : part}
                    <ExternalLink size={12} />
                </a>
            );
        }
        return part;
    });
};

export default function Home() {
    const [query, setQuery] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");
    const [response, setResponse] = useState<ChatResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const examples = [
        "What is the expense ratio of Groww Liquid Fund?",
        "What is the lock-in period of Groww ELSS Tax Saver Fund?",
        "How can I invest in Groww Nifty Total Market Index Fund?",
        "What is the exit load if I withdraw on Day 4?",
        "Which benchmark does the Index fund track?"
    ];

    const [placeholder, setPlaceholder] = useState(examples[0]);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                i = (i + 1) % examples.length;
                setPlaceholder(examples[i]);
                setIsFading(false);
            }, 500);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = async (text: string = query) => {
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        setSubmittedQuery(text);
        setQuery("");
        setResponse(null);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            setResponse(data);
        } catch (error) {
            setResponse({
                type: "ERROR",
                reply: "I could not find this information in official sources.",
                citation: null,
                updatedAt: null
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setQuery("");
        setSubmittedQuery("");
        setResponse(null);
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#0f1115] transition-all duration-300 ease-in-out overflow-hidden font-sans">
            {/* 1. Sidebar / Disclaimer Area */}
            <aside className="hidden lg:flex w-72 flex-col bg-[#f7f9fb] dark:bg-[#1a1d23] border-r border-[#eff2f5] dark:border-[#2d323b] p-6 shrink-0 transition-all duration-300">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-[#00d09c] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#00d09c]/20">
                        <Send size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-[#1c1c1c] dark:text-[#eef1f5] text-sm leading-tight">MF Facts</h2>
                        <p className="text-[10px] text-[#7c8db5] font-semibold tracking-wider uppercase">Assistant</p>
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#00d09c] hover:bg-[#00b084] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#00d09c]/20 transition-all active:scale-[0.98]"
                    >
                        <Plus size={18} />
                        New Inquiry
                    </button>

                    <div className="p-4 bg-white dark:bg-[#252a33] rounded-2xl border border-[#eff2f5] dark:border-[#2d323b] shadow-sm">
                        <h3 className="text-[11px] font-bold text-[#00d09c] uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Info size={14} /> Core Policy
                        </h3>
                        <p className="text-xs text-[#7c8db5] leading-relaxed">
                            This engine provides <strong className="text-[#1c1c1c] dark:text-[#eef1f5]">Factual Data</strong> extracted from official records. We do not provide financial advice or recommendations.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-[#eff2f5] dark:border-[#2d323b] flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-[#7c8db5] uppercase tracking-wider mb-2">Helpful Links</p>
                        <a href="https://groww.in" target="_blank" className="text-xs text-[#7c8db5] hover:text-[#00d09c] flex items-center gap-2 transition-all">
                            <ExternalLink size={12} /> Groww Official
                        </a>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-[#eff2f5] dark:border-[#2d323b]">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-[#7c8db5]">
                        <span className="w-1.5 h-1.5 bg-[#00d09c] rounded-full animate-pulse"></span>
                        System Online
                    </div>
                </div>
            </aside>

            {/* 2. Main Chat Area */}
            <main className="flex-1 flex flex-col items-center relative overflow-hidden h-full">
                {/* Header for mobile */}
                <div className="lg:hidden w-full p-4 border-b border-[#eff2f5] dark:border-[#2d323b] flex items-center justify-between bg-white dark:bg-[#0f1115]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#00d09c] rounded-lg flex items-center justify-center text-white">
                            <Send size={16} />
                        </div>
                        <span className="font-bold text-sm">MF Assistant</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleNewChat} className="p-2 text-[#00d09c] hover:bg-[#00d09c]/10 rounded-lg">
                            <Plus size={20} />
                        </button>
                        <Info size={18} className="text-[#00d09c]" />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 w-full max-w-3xl overflow-y-auto px-4 md:px-0 py-8 scroll-smooth no-scrollbar">
                    {!(response || isLoading) ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1c1c1c] dark:text-[#eef1f5] mb-4 font-outfit">How can I help you today?</h2>
                            <p className="text-[#7c8db5] max-w-md mx-auto mb-12 text-sm md:text-base">
                                Ask me anything about Groww mutual funds — returns, risks, costs & more.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                                {examples.map((ex, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setQuery(ex);
                                            handleSearch(ex);
                                        }}
                                        className="flex items-start gap-4 p-4 bg-white dark:bg-[#1a1d23] border border-[#eff2f5] dark:border-[#2d323b] rounded-xl hover:border-[#00d09c]/30 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[#f0f9f6] dark:bg-[#252a33] flex items-center justify-center shrink-0 group-hover:bg-[#00d09c] transition-all group-hover:text-white text-[#00d09c]">
                                            <ExternalLink size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-[#4b5563] dark:text-[#cbd5e1]">{ex}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-32">
                            {/* User Query Appearance */}
                            <div className="flex justify-end pr-2">
                                <div className="max-w-[85%] bg-[#00d09c] text-white p-4 rounded-2xl rounded-tr-none shadow-md text-sm font-medium">
                                    {submittedQuery}
                                </div>
                            </div>

                            {/* Bot Response Appearance */}
                            <div className="flex gap-4 max-w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-8 h-8 rounded-full bg-[#f0f9f6] dark:bg-[#252a33] flex items-center justify-center shrink-0 border border-[#dee5ec] dark:border-[#2d323b]">
                                    <Send size={14} className="text-[#00d09c]" />
                                </div>
                                <div className="flex-1 space-y-6">
                                    {isLoading ? (
                                        <div className="flex items-center gap-2 py-4">
                                            <div className="w-2 h-2 bg-[#00d09c] rounded-full animate-bounce delay-0"></div>
                                            <div className="w-2 h-2 bg-[#00d09c] rounded-full animate-bounce delay-150"></div>
                                            <div className="w-2 h-2 bg-[#00d09c] rounded-full animate-bounce delay-300"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`rounded-2xl p-6 shadow-sm border ${response?.type === 'ADVISORY'
                                                ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-100 text-amber-900 dark:text-amber-200'
                                                : response?.type === 'ERROR'
                                                    ? 'bg-red-50 dark:bg-red-950/10 border-red-100 text-red-900 dark:text-red-200'
                                                    : 'bg-[#f7f9fb] dark:bg-[#252a33] border-[#eff2f5] dark:border-[#2d323b] text-[#1c1c1c] dark:text-[#eef1f5]'
                                                }`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00d09c]">
                                                        {response?.type === 'ADVISORY' ? "Advisory Disclaimer" : "Official Response"}
                                                    </h2>
                                                    {response?.updatedAt && (
                                                        <span className="text-[10px] text-[#5c6d95] dark:text-[#94a3b8] font-bold italic">Last updated {response.updatedAt}</span>
                                                    )}
                                                </div>
                                                <div className="leading-relaxed font-medium text-[15px] whitespace-pre-wrap">
                                                    {formatResponseText(response?.reply || "")}
                                                </div>
                                            </div>

                                            {response?.citation && (
                                                <div className="px-1 flex items-center gap-3">
                                                    <a
                                                        href={response.citation.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#00d09c] text-xs font-bold flex items-center gap-1.5 hover:underline py-2 px-4 bg-[#f0f9f6] dark:bg-[#252a33] rounded-full border border-[#00d09c]/10"
                                                    >
                                                        <ExternalLink size={12} />
                                                        Explore {response.citation.label} Documentation
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed Input Area */}
                <div className="w-full max-w-3xl px-4 pb-8 pt-4 bg-gradient-to-t from-white dark:from-[#0f1115] via-white/90 dark:via-[#0f1115]/90 to-transparent sticky bottom-0">
                    <div className="relative group">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (response) setResponse(null);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder={placeholder}
                            className={`w-full pl-6 pr-14 py-4 bg-white dark:bg-[#1a1d23] border border-[#dee5ec] dark:border-[#2d323b] rounded-2xl focus:border-[#00d09c] focus:outline-none focus:ring-4 focus:ring-[#00d09c]/5 transition-all duration-500 text-[15px] font-medium text-[#1c1c1c] dark:text-[#eef1f5] shadow-lg shadow-black/5 placeholder-fade ${isFading ? 'placeholder-transparent' : 'placeholder-[#8c9dbd]'}`}
                        />
                        <button
                            onClick={() => handleSearch()}
                            disabled={!query.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00d09c] text-white rounded-xl shadow-[0_4px_12px_rgba(0,208,156,0.25)] hover:bg-[#00b084] disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center p-0"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        </button>
                    </div>
                    <p className="mt-4 text-center text-[11px] text-[#5c6d95] dark:text-[#94a3b8] font-semibold flex items-center justify-center gap-2 uppercase tracking-wide">
                        <Info size={12} className="text-[#00d09c]" />
                        Factual data assistant. Not an investment platform or advisory service.
                    </p>
                </div>
            </main>
        </div>
    );
}
