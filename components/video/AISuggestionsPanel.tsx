import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ChevronDown, ChevronUp, Clock, Bot } from "lucide-react";
import { AISuggestion } from "@/components/audio/useAudioStream";
import { cn } from "@/lib/utils";

interface AISuggestionsPanelProps {
    suggestions: AISuggestion[];
}

export function AISuggestionsPanel({ suggestions }: AISuggestionsPanelProps) {
    const [isOpen, setIsOpen] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastCount = useRef(suggestions.length);

    // Auto-scroll on new message
    useEffect(() => {
        if (suggestions.length > lastCount.current) {
            if (isOpen && scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
        lastCount.current = suggestions.length;
    }, [suggestions, isOpen]);

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-40 transition-all duration-300 ease-in-out",
            "flex flex-col items-end gap-2"
        )}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-full shadow-lg backdrop-blur text-sm font-semibold transition-transform active:scale-95"
            >
                <Bot className="w-4 h-4" />
                AI Coach
                <span className="bg-white/20 px-1.5 py-0.5 rounded textxs">{suggestions.length}</span>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {/* Panel */}
            <div className={cn(
                "w-80 md:w-96 bg-gray-900/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right",
                isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none h-0"
            )}>
                {/* Header */}
                <div className="bg-white/5 p-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        Live Coaching Feed
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">
                        Llama 3-70B • &lt;100ms
                    </span>
                </div>

                {/* Feed */}
                <div
                    ref={scrollRef}
                    className="h-64 overflow-y-auto p-4 space-y-3 custom-scrollbar"
                >
                    {suggestions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
                            <Bot className="w-8 h-8 opacity-20" />
                            <p className="text-sm">Listening for customer objections...</p>
                        </div>
                    ) : (
                        suggestions.map((item, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-white/5 hover:bg-white/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl p-3 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 min-w-[24px] h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm text-gray-100 font-medium leading-snug">
                                            {item.hint}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                On "{item.speaker}"
                                            </span>
                                            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5" />
                                                {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
