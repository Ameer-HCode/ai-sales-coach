"use client";

import { MessageSquareWarning, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

export default function MeetingHeader() {
    const router = useRouter();
    const { useCallCustomData } = useCallStateHooks();
    const customData = useCallCustomData();

    // Mock data for "Breakout" or Meeting Name
    const meetingName = (customData?.title as string) || "Team Meeting";

    return (
        <div className="hidden md:flex h-16 items-center justify-between px-4 bg-slate-950 text-white z-50">
            {/* Left: Meeting Info */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-sm font-medium">{meetingName}</h1>
                    {/* Mock breakout text from screenshot style */}
                    <p className="text-xs text-slate-400">Main Call</p>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 text-xs font-medium text-blue-400">
                <button className="hover:underline" onClick={() => alert("Help request sent to admin.")}>Ask for help</button>
                <button className="hover:underline" onClick={() => router.push("/dashboard")}>Return to main call</button>
            </div>
        </div>
    );
}
