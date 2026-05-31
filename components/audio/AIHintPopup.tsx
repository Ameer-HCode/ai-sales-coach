"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIHintPopupProps {
    hint: string | null;
    hintVersion?: number; // Increment each time a new hint arrives — forces re-trigger
    speaker?: string;
    onDismiss?: () => void;
}

export function AIHintPopup({ hint, hintVersion = 0, speaker = "AI Coach", onDismiss }: AIHintPopupProps) {
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
    }, [hint, hintVersion]); // hintVersion ensures re-trigger even for duplicate hint text

    if (!visible || !hint) return null;

    return (
        <div className="fixed top-24 right-4 z-50 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="relative group bg-[#202124] border border-[#3c4043] text-slate-50 px-5 py-4 rounded-xl shadow-2xl max-w-sm w-full ring-1 ring-white/5">

                {/* Close Button */}
                <button
                    onClick={() => { setVisible(false); onDismiss?.(); }}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                    <X size={14} />
                </button>

                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="mt-1 p-2 bg-[#8ab4f8]/10 rounded-lg shrink-0">
                        <Sparkles size={20} className="text-[#8ab4f8]" />
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8ab4f8] uppercase tracking-wider">
                            {speaker} Suggestion
                        </p>
                        <p className="text-sm font-medium leading-relaxed text-slate-100">
                            {hint}
                        </p>
                    </div>
                </div>

                {/* Progress Bar (Visual Timer) */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-[#8ab4f8]/50 w-full animate-[shrink_8s_linear_forwards] rounded-b-xl" />
            </div>
        </div>
    );
}
