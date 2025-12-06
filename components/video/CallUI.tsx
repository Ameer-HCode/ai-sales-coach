"use client";

import {
    PaginatedGridLayout,
    SpeakerLayout,
    useCallStateHooks,
} from "@stream-io/video-react-sdk";
import Controls from "./Controls";
import { useState } from "react";
import { LayoutGrid, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import CallSidebar from "./CallSidebar";
import MeetingHeader from "./MeetingHeader";
import DesktopSidebar from "./DesktopSidebar";
import MeetingGrid from "./MeetingGrid";
import { cn } from "@/lib/utils";

import { useAudioStream } from "../audio/useAudioStream";

export default function CallUI() {
    const { useCallCallingState, useCallCustomData } = useCallStateHooks();
    const callingState = useCallCallingState();
    const customData = useCallCustomData();
    const [layout, setLayout] = useState<"grid" | "speaker">("grid");
    const [scaleMode, setScaleMode] = useState<"cover" | "contain">("cover");
    const [showSidebar, setShowSidebar] = useState(false);
    const [showLocalInfo, setShowLocalInfo] = useState(true); // Small floating card default
    const [hasCopied, setHasCopied] = useState(false);

    const params = useParams();
    const callId = params.id as string;
    // Mock user ID for now - in production use authenticatd user ID
    // We can try to get it from stream call state or just random for guest
    const userId = (customData?.userId as string) || "guest-" + Math.floor(Math.random() * 10000);

    // Audio Capture Hook - Starts listening when component mounts (and call is joined)
    const audioState = useAudioStream(callId, userId);

    const meetingLink = typeof window !== "undefined" ? `${window.location.origin}/call/${callId}` : "";

    const handleCopy = () => {
        navigator.clipboard.writeText(meetingLink);
        setHasCopied(true);
        toast.success("Link copied");
        setTimeout(() => setHasCopied(false), 2000);
    };

    if (callingState !== "joined") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
                <p className="animate-pulse">Loading call interface...</p>
            </div>
        );
    }


    // Sidebar logic can be reused for DesktopSidebar
    const handleTabChange = (tab: string | null) => {
        if (tab === "settings") {
            toast.info("Settings are not implemented yet.");
            return;
        }
        if (tab === "chat") {
            toast.info("Chat coming soon!");
            return;
        }
        if (tab === "captions") {
            toast.info("Captions not available.");
            return;
        }

        if (tab === "participants" || tab === "info") {
            setShowSidebar(!!tab);
        } else {
            setShowSidebar(false);
        }
    };

    return (
        <div className="relative flex flex-col h-screen w-full overflow-hidden bg-slate-950">
            {/* Header (Desktop) */}
            <MeetingHeader />

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <div className="relative flex flex-1 flex-col transition-all duration-300 ease-in-out">

                    {/* Video Grid Area */}
                    <div className="flex-1 p-4 pb-24 overflow-y-auto flex items-center justify-center">
                        <div className="h-full w-full max-w-[1200px] max-h-[800px] flex items-center justify-center">
                            {/* Constrain width/height slightly for that "centered grid" look */}
                            <MeetingGrid scaleMode={scaleMode} />
                        </div>
                    </div>

                    {/* Bottom Controls Bar */}
                    <Controls
                        onToggleSidebar={() => setShowSidebar(!showSidebar)}
                        scaleMode={scaleMode}
                        onToggleScale={() => setScaleMode(prev => prev === "cover" ? "contain" : "cover")}
                    />
                </div>

                {/* Right Sidebar Strip (Desktop) */}
                <DesktopSidebar activeTab={showSidebar ? "participants" : null} onTabChange={handleTabChange} />

                {/* Floating "Add Others" Card (Only if sidebar is closed) */}
                {showLocalInfo && !showSidebar && (
                    <div className="absolute inset-x-0 bottom-24 z-40 px-4 md:w-80 md:left-4 md:bottom-24 md:px-0">
                        {/* Mobile Overlay to catch clicks outside the card */}
                        <div
                            className="md:hidden fixed inset-0 z-[-1]"
                            onClick={() => setShowLocalInfo(false)}
                        />
                        <Card className="border-slate-800 bg-slate-900/95 text-white shadow-xl backdrop-blur-sm mx-auto max-w-sm">
                            <CallSidebar onClose={() => setShowSidebar(false)} meetingLink={meetingLink} />
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
