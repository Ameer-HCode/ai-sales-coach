
import React from 'react';
import { cn } from "@/lib/utils";

interface LiveTranscriptProps {
    text: string;
}

export default function LiveTranscript({ text }: LiveTranscriptProps) {
    if (!text) return null;

    return (
        <div className="absolute bottom-28 left-4 right-4 md:left-[50%] md:translate-x-[-50%] md:max-w-xl text-center z-50 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md text-white rounded-xl px-4 py-3 shadow-lg transition-all duration-200">
                <p className="text-lg md:text-xl font-medium leading-relaxed">
                    {text}
                </p>
            </div>
        </div>
    );
}
