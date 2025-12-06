"use client";

import { useCallStateHooks, ParticipantView } from "@stream-io/video-react-sdk";
import { cn } from "@/lib/utils";


interface MeetingGridProps {
    scaleMode?: "cover" | "contain";
}

export default function MeetingGrid({ scaleMode = "cover" }: MeetingGridProps) {
    const { useParticipants, useLocalParticipant, useDominantSpeaker } = useCallStateHooks();

    const participants = useParticipants();
    const localParticipant = useLocalParticipant();
    const dominant = useDominantSpeaker();

    const remoteParticipants = participants.filter(
        (p) => p.sessionId !== localParticipant?.sessionId
    );

    const count = remoteParticipants.length;

    // Dynamic grid layout logic
    let gridClassName = "grid w-full h-full gap-2 p-3 pb-24 auto-rows-[1fr] "; // Added pb-24 for mobile controls clearance

    // Default to strict 1-column on mobile to avoid tiny boxes
    if (count === 0) gridClassName += "grid-cols-1";
    else if (count === 1) gridClassName += "grid-cols-1";
    else if (count === 2) gridClassName += "grid-cols-2";
    else if (count <= 4) gridClassName += "grid-cols-2 md:grid-cols-2";
    else if (count <= 9) gridClassName += "grid-cols-2 md:grid-cols-3";
    else gridClassName += "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

    return (
        <div className="relative w-full h-full bg-slate-900">
            {count === 0 ? (
                <div className="flex h-full w-full items-center justify-center text-slate-500">
                    Waiting for others to join...
                </div>
            ) : (
                <div className={gridClassName}>
                    {remoteParticipants.map((p) => {
                        const isSpeaking = dominant?.sessionId === p.sessionId;

                        return (
                            <div
                                key={p.sessionId}
                                className={cn(
                                    "relative rounded-xl overflow-hidden border border-slate-800 bg-black shadow-md",
                                    isSpeaking && "ring-2 ring-emerald-500"
                                )}
                            >
                                {/* FIXED: VIDEO NOW FILLS TILE COMPLETELY */}
                                <ParticipantView
                                    participant={p}
                                    className={cn(
                                        "absolute inset-0 w-full h-full [&_video]:w-full [&_video]:h-full",
                                        scaleMode === "cover" ? "[&_video]:object-cover" : "[&_video]:object-contain"
                                    )}
                                />

                                <div className="absolute bottom-3 left-3 text-white text-xs bg-black/50 px-2 py-1 rounded">
                                    {p.name || p.userId}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* SELF VIEW PiP */}
            {localParticipant && (
                <div
                    className="
            absolute bottom-20 right-4  /* Moved up to avoid overlap with controls */
            w-32 h-48 md:w-64 md:h-44   /* Larger mobile portrait size */
            rounded-xl overflow-hidden
            shadow-2xl bg-black border border-slate-700 z-20
          "
                >
                    <ParticipantView
                        participant={localParticipant}
                        className="absolute inset-0 w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                    />
                    <div className="absolute bottom-2 left-2 text-white text-xs bg-black/60 px-2 py-1 rounded">
                        You
                    </div>
                </div>
            )}
        </div>
    );
}
