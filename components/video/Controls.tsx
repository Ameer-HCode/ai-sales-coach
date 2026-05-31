"use client";

import {
    useCallStateHooks,
    useCall,
} from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, RefreshCcw, Info, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ControlsProps {
    onToggleSidebar: () => void;
    scaleMode?: "cover" | "contain";
    onToggleScale?: () => void;
    // Audio Pipeline Controls
    isRecording?: boolean;
    onToggleAudio?: () => void;
}

export default function Controls({ onToggleSidebar, scaleMode, onToggleScale, isRecording, onToggleAudio }: ControlsProps) {
    const call = useCall();
    const router = useRouter();
    const { useCameraState, useMicrophoneState } = useCallStateHooks();

    const { camera, isMute: isCameraMute, devices: cameraDevices, selectedDevice: selectedCamera } = useCameraState();
    const { microphone, isMute: isMicrophoneMute } = useMicrophoneState();

    const handleFlipCamera = async () => {
        if (!cameraDevices || cameraDevices.length < 2) return;

        const currentDeviceId = selectedCamera;
        const currentIndex = cameraDevices.findIndex(d => d.deviceId === currentDeviceId);
        const nextIndex = (currentIndex + 1) % cameraDevices.length;
        const nextDevice = cameraDevices[nextIndex];

        if (nextDevice) {
            await camera.select(nextDevice.deviceId);
        }
    };

    if (!call) return null;

    return (
        <div className="relative bottom-0 left-0 right-0 flex items-center justify-center gap-3 p-4 bg-[#202124] z-30 transition-all border-t border-[#3c4043]">
            {/* Mic Toggle */}
            <Button
                variant={isMicrophoneMute ? "destructive" : "secondary"}
                size="icon"
                className={cn(
                    "rounded-full h-11 w-11 border-none transition-colors duration-200",
                    isMicrophoneMute ? "bg-[#ea4335] hover:bg-[#d93025] text-white" : "bg-[#3c4043] text-white hover:bg-[#4a4d51]"
                )}
                onClick={() => microphone.toggle()}
            >
                {isMicrophoneMute ? (
                    <MicOff className="h-5 w-5" />
                ) : (
                    <Mic className="h-5 w-5" />
                )}
            </Button>

            {/* Camera Toggle */}
            <Button
                variant={isCameraMute ? "destructive" : "secondary"}
                size="icon"
                className={cn(
                    "rounded-full h-11 w-11 border-none transition-colors duration-200",
                    isCameraMute ? "bg-[#ea4335] hover:bg-[#d93025] text-white" : "bg-[#3c4043] text-white hover:bg-[#4a4d51]"
                )}
                onClick={() => camera.toggle()}
            >
                {isCameraMute ? (
                    <VideoOff className="h-5 w-5" />
                ) : (
                    <Video className="h-5 w-5" />
                )}
            </Button>

            {/* Flip Camera (Visible if multiple cameras exist) */}
            {cameraDevices && cameraDevices.length > 1 && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full h-11 w-11 bg-[#3c4043] text-white hover:bg-[#4a4d51] border-none"
                    onClick={handleFlipCamera}
                >
                    <RefreshCcw className="h-5 w-5" />
                </Button>
            )}

            {/* Screen Share (Pill Style) */}
            <Button
                variant="secondary"
                className="rounded-full h-11 px-5 bg-[#3c4043] text-white hover:bg-[#4a4d51] border-none gap-2"
                onClick={() => call.screenShare.toggle()}
            >
                <MonitorUp className="h-5 w-5" />
                <span className="hidden md:inline font-medium">Share screen</span>
            </Button>

            <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-11 w-11 bg-[#3c4043] text-white hover:bg-[#4a4d51] border-none"
                onClick={onToggleSidebar}
            >
                <Info className="h-5 w-5" />
            </Button>

            {/* AI Audio Toggle (Custom Pipeline) */}
            {onToggleAudio && (
                <Button
                    variant={isRecording ? "default" : "destructive"} // Green/Blue if on, Red if off/error
                    className={cn(
                        "rounded-full h-11 px-4 gap-2 border-none transition-colors duration-200 ml-2",
                        isRecording
                            ? "bg-[#8ab4f8]/20 hover:bg-[#8ab4f8]/30 text-[#8ab4f8]"
                            : "bg-[#3c4043] text-[#9aa0a6] hover:bg-[#4a4d51]"
                    )}
                    onClick={onToggleAudio}
                >
                    <div className={cn("w-2 h-2 rounded-full", isRecording ? "bg-[#8ab4f8] animate-pulse" : "bg-red-500")} />
                    <span className="font-medium text-[13px] tracking-wide">{isRecording ? "AI LISTENING" : "AI PAUSED"}</span>
                </Button>
            )}

            <Button
                variant="destructive"
                size="icon"
                className="rounded-full h-11 w-11 bg-[#ea4335] hover:bg-[#d93025] ml-4 transition-colors"
                onClick={async () => {
                    await call.leave();
                    router.push("/dashboard");
                }}
            >
                <PhoneOff className="h-5 w-5" />
            </Button>
        </div>
    );
}
