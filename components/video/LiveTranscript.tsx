
import React from 'react';
import { cn } from "@/lib/utils";

interface LiveTranscriptProps {
    text: string;
}

export default function LiveTranscript({ text }: LiveTranscriptProps) {
    if (!text) return null;

    return (
        <div className="flex justify-center w-full z-50 pointer-events-none">
            <div className="bg-black/70 text-white rounded px-5 py-2 shadow-sm transition-all duration-200 inline-block text-center max-w-3xl">
                <p className="text-xl md:text-2xl font-normal leading-relaxed tracking-wide">
                    {text}
                </p>
            </div>
        </div>
    );
}
