"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming basic Shadcn utils exist, or I'll inline

interface AIHintPopupProps {
    hint: string | null;
    speaker?: string;
    onDismiss?: () => void;
}

export function AIHintPopup({ hint, speaker = "AI Coach", onDismiss }: AIHintPopupProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (hint) {
            setVisible(true);
            // Auto-hide after 8 seconds
            const t = setTimeout(() => setVisible(false), 8000);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [hint]);

    if (!visible || !hint) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative group bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-slate-50 px-6 py-4 rounded-xl shadow-2xl max-w-md w-full ring-1 ring-white/10">

                {/* Close Button */}
                <button
                    onClick={() => { setVisible(false); onDismiss?.(); }}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                    <X size={14} />
                </button>

                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="mt-1 p-2 bg-indigo-500/20 rounded-lg shrink-0">
                        <Sparkles size={20} className="text-indigo-400" />
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                            {speaker} Suggestion
                        </p>
                        <p className="text-sm font-medium leading-relaxed text-slate-100">
                            {hint}
                        </p>
                    </div>
                </div>

                {/* Progress Bar (Visual Timer) */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500/50 w-full animate-[shrink_8s_linear_forwards]" />
            </div>
        </div>
    );
}
