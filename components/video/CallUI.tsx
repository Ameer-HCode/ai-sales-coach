import {
    useCallStateHooks
} from "@stream-io/video-react-sdk";
import Controls from "./Controls";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useAudioStream } from "../audio/useAudioStream";
import LiveTranscript from "./LiveTranscript";
import { AIHintPopup } from "../audio/AIHintPopup";
import { RealtimeDiagnostics } from '@/components/debug/RealtimeDiagnostics';
import { AISuggestionsPanel } from './AISuggestionsPanel';

export default function CallUI() {
    const { useCallCustomData, useParticipants } = useCallStateHooks();
    const customData = useCallCustomData();
    const participants = useParticipants(); // Corrected hook usage

    const params = useParams();
    // Use callId from params or customData (safer to prioritize params for routing consistency)
    const callId = (params.id as string) || (customData?.callId as string) || "";

    // Consistent User ID state
    const [userId] = useState(() => {
        return (customData?.userId as string) || "guest-" + Math.floor(Math.random() * 10000);
    });

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
        userId,
        participants.length
    );

    const latestHint = aiSuggestions.length > 0 ? aiSuggestions[aiSuggestions.length - 1].hint : null;

    return (
        <div className="flex-1 flex flex-col relative bg-gray-950 overflow-hidden h-screen w-full">
            {/* 1. Diagnostics Overlay */}
            <RealtimeDiagnostics
                stats={diagnostics}
                mode={participants.length > 2 ? 'mono' : 'stereo'}
            />

            {/* 2. Main Video Area */}
            <div className="flex-1 p-4 flex items-center justify-center">
                <div className="w-full max-w-6xl h-[80vh] grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 rounded-xl flex items-center justify-center border border-white/5 relative group">
                        <p className="text-gray-500">Local Video</p>
                        <div className="absolute bottom-4 left-4 text-xs bg-black/50 px-2 py-1 rounded">You</div>
                    </div>
                    <div className="bg-gray-900 rounded-xl flex items-center justify-center border border-white/5 relative group">
                        <p className="text-gray-500">Remote Participant</p>
                        <div className="absolute bottom-4 left-4 text-xs bg-black/50 px-2 py-1 rounded">Customer</div>
                    </div>
                </div>
            </div>

            {/* 3. Live Transcript Overlay */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-30 pointer-events-none">
                <LiveTranscript text={transcript} />
            </div>

            {/* 4. AI Popups (Transient) */}
            <AIHintPopup hint={latestHint} />

            {/* 5. AI History Panel (Persistent) */}
            <AISuggestionsPanel suggestions={aiSuggestions} />

            {/* 6. Controls Bar */}
            <Controls
                isRecording={isRecording}
                onToggleAudio={() => isRecording ? stopAudio() : startAudio()}
                // Handlers for other controls can be stubs or connected as needed
                scaleMode="cover"
                onToggleScale={() => { }}
                onToggleSidebar={() => { }}
            />
        </div>
    );
}
