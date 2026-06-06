"use client";

import {
    useCallStateHooks,
    ParticipantView,
} from "@stream-io/video-react-sdk";
import Controls from "./Controls";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useAudioStream } from "../audio/useAudioStream";
import LiveTranscript from "./LiveTranscript";
import { AIHintPopup } from "../audio/AIHintPopup";
import { RealtimeDiagnostics } from '@/components/debug/RealtimeDiagnostics';
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function CallUI() {
    const { useCallCustomData, useParticipants, useLocalParticipant } = useCallStateHooks();
    const customData = useCallCustomData();
    const participants = useParticipants();
    const localParticipant = useLocalParticipant();
    const { user } = useUser();
    const isHost = !!user;

    // Remote participant (find the first one that isn't me)
    const remoteParticipant = participants.find(p => p.sessionId !== localParticipant?.sessionId);

    const params = useParams();
    const callId = (params.id as string) || (customData?.callId as string) || "";

    // UI State
    const [showInfo, setShowInfo] = useState(false);

    // Get Audio Stream & AI Logic
    const {
        isRecording,
        startAudio,
        stopAudio,
        transcript,
        aiSuggestions,
        diagnostics
    } = useAudioStream(
        callId,
        localParticipant?.userId || "guest",
        participants.length,
        isHost
    );

    const latestHint = aiSuggestions.length > 0 ? aiSuggestions[aiSuggestions.length - 1].hint : null;

    const copyInviteLink = () => {
        const originUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const fallbackUrl = window.location.href.replace(window.location.origin, originUrl);
        navigator.clipboard.writeText(fallbackUrl);
        toast.success("Invite link copied!");
    };

    return (
        <div className="flex-1 flex flex-col relative bg-[#202124] overflow-hidden h-screen w-full">
            {/* 1. Diagnostics Overlay - Only for Host */}
            {isHost && (
                <RealtimeDiagnostics
                    stats={diagnostics}
                    mode={participants.length > 2 ? 'mono' : 'stereo'}
                />
            )}

            {/* 2. Main Video Area */}
            <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
                <div className={`w-full h-full max-h-[85vh] grid gap-4 ${
                    participants.length === 1 
                    ? "grid-cols-1 grid-rows-1 max-w-4xl" 
                    : "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1 max-w-7xl"
                } mx-auto transition-all duration-300 ease-in-out`}>
                    
                    {participants.map(p => (
                        <div key={p.sessionId} className="bg-[#3c4043] rounded-xl overflow-hidden shadow-lg border border-white/5 relative group flex-1">
                            <ParticipantView
                                participant={p}
                                className="absolute inset-0 w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                            />
                            {/* Google Meet style Name Tag */}
                            <div className="absolute bottom-4 left-4">
                                <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-md text-white text-sm font-medium tracking-wide flex items-center gap-2">
                                    {p.isSpeaking && <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                                    {p.name || (p.isLocalParticipant ? 'You' : 'Customer')}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Waiting state if only 1 participant */}
                    {participants.length === 1 && (
                        <div className="bg-[#3c4043]/40 rounded-xl overflow-hidden border border-white/5 relative flex flex-col items-center justify-center gap-4 text-center p-8">
                            <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                                <Users className="h-8 w-8 text-[#8ab4f8]" />
                            </div>
                            <h3 className="text-2xl font-normal text-white">Waiting for others to join</h3>
                            <p className="text-[#9aa0a6] text-base max-w-[300px]">
                                Share the meeting link with the customer you want to coach.
                            </p>
                            <Button variant="secondary" className="mt-4 bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa] font-medium" onClick={() => setShowInfo(true)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy joining info
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Live Transcript Overlay */}
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30 pointer-events-none px-4">
                <LiveTranscript text={transcript} />
            </div>

            {/* 4. AI Popups (Transient) - Only for Host */}
            {isHost && <AIHintPopup hint={latestHint} hintVersion={aiSuggestions.length} />}

            {/* 5. AI History Panel (Persistent) - Only for Host */}
            {isHost && <AISuggestionsPanel suggestions={aiSuggestions} />}

            {/* 6. Controls Bar */}
            <Controls
                isRecording={isRecording}
                onToggleAudio={isHost ? () => {
                    if (isRecording) {
                        stopAudio();
                    } else {
                        startAudio();
                        toast.success("AI pipeline is active and waiting to listen!");
                    }
                } : undefined}
                onToggleSidebar={() => setShowInfo(true)}
            />

            {/* DEBUG: Force Suggestion */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10">
                <input 
                    type="text" 
                    id="debug-input"
                    placeholder="Type client speech & press Enter..."
                    className="text-xs px-2 py-1 bg-black/50 border border-white/20 rounded text-white w-48 outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const ws = (window as any).debugWs;
                            const val = e.currentTarget.value;
                            if (ws && ws.readyState === 1 && val) {
                                ws.send(JSON.stringify({ type: 'trigger_groq', text: val }));
                                e.currentTarget.value = '';
                                toast.success("Simulated client speech sent!");
                            } else {
                                toast.error("WebSocket not connected yet.");
                            }
                        }
                    }}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] text-zinc-400 hover:text-white"
                    onClick={() => {
                        const ws = (window as any).debugWs;
                        if (ws && ws.readyState === 1) {
                            ws.send(JSON.stringify({ type: 'debug_force_hint' }));
                        } else {
                            toast.error("WS not ready for debug");
                        }
                    }}
                >
                    [Force Hint]
                </Button>
            </div>

            {/* 7. Info Dialog */}
            <Dialog open={showInfo} onOpenChange={setShowInfo}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Meeting Info</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                            <span className="text-sm text-zinc-400 truncate max-w-[200px]">{window.location.href.replace(window.location.origin, process.env.NEXT_PUBLIC_APP_URL || window.location.origin)}</span>
                            <Button size="sm" onClick={copyInviteLink}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </Button>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Participants ({participants.length})
                            </h4>
                            <div className="space-y-2">
                                {participants.map(p => (
                                    <div key={p.sessionId} className="flex items-center gap-2 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span>{p.name} {p.isLocalParticipant && '(You)'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
