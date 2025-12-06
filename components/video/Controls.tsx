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
}

export default function Controls({ onToggleSidebar, scaleMode, onToggleScale }: ControlsProps) {
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
        <div className="group absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-30 transition-opacity hover:opacity-100">
            {/* Mic Toggle */}
            <Button
                variant={isMicrophoneMute ? "destructive" : "secondary"}
                size="icon"
                className={cn(
                    "rounded-full h-12 w-12 border border-transparent",
                    isMicrophoneMute ? "bg-red-500 hover:bg-red-600" : "bg-slate-700/50 text-white hover:bg-slate-600"
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
                    "rounded-full h-12 w-12 border border-transparent",
                    isCameraMute ? "bg-red-500 hover:bg-red-600" : "bg-slate-700/50 text-white hover:bg-slate-600"
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
                    className="rounded-full h-12 w-12 bg-slate-700/50 text-white hover:bg-slate-600 border-none"
                    onClick={handleFlipCamera}
                >
                    <RefreshCcw className="h-5 w-5" />
                </Button>
            )}

            {/* Screen Share (Pill Style) */}
            <Button
                variant="secondary"
                className="rounded-full h-12 px-6 bg-slate-700/50 text-white hover:bg-slate-600 gap-2"
                onClick={() => call.screenShare.toggle()}
            >
                <MonitorUp className="h-5 w-5" />
                <span className="hidden md:inline font-medium">Share screen</span>
            </Button>

            <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={onToggleSidebar}
            >
                <Info className="h-5 w-5" />
            </Button>

            <Button
                variant="destructive"
                size="icon"
                className="rounded-full h-12 w-12"
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
