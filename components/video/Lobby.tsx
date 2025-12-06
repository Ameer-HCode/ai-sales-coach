"use client";

import {
    useCall,
    useCallStateHooks,
    VideoPreview,
} from "@stream-io/video-react-sdk";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LobbyProps {
    onJoin: () => void;
}

export default function Lobby({ onJoin }: LobbyProps) {
    const call = useCall();
    const { useMicrophoneState, useCameraState } = useCallStateHooks();
    const { isMute: isMicMute, microphone } = useMicrophoneState();
    const { isMute: isCamMute, camera } = useCameraState();

    const [isJoining, setIsJoining] = useState(false);
    const [deviceError, setDeviceError] = useState<string | null>(null);

    // Ensure devices are enabled on mount with error handling
    useEffect(() => {
        if (call) {
            const enableDevices = async () => {
                try {
                    setDeviceError(null);
                    await call.camera.enable();
                    await call.microphone.enable();
                } catch (error: any) {
                    console.error("Failed to enable devices", error);
                    let message = "Could not access camera/microphone. Please check permissions.";
                    if (error?.message?.includes("Permission denied")) {
                        message = "Permission denied. Please allow access in browser settings.";
                    }
                    setDeviceError(message);
                }
            };
            enableDevices();
        }
    }, [call]);

    const handleRetryDevices = async () => {
        if (!call) return;
        setDeviceError(null);
        try {
            await call.camera.enable();
            await call.microphone.enable();
        } catch (error: any) {
            console.error("Retry failed", error);
            setDeviceError("Retry failed. Please check browser permissions and reload.");
        }
    };

    const handleJoin = async () => {
        if (!call) return;
        setIsJoining(true);
        try {
            await call.join();
            onJoin();
        } catch (error) {
            console.error("Failed to join call", error);
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Join Meeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Video Preview */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        {deviceError ? (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-900 p-4 text-center">
                                <p className="text-sm text-red-400">{deviceError}</p>
                                <Button size="sm" variant="outline" onClick={handleRetryDevices}>
                                    Retry Access
                                </Button>
                            </div>
                        ) : (
                            <VideoPreview className="h-full w-full object-cover" />
                        )}

                        {!deviceError && (
                            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-4">
                                <Button
                                    variant={isMicMute ? "destructive" : "secondary"}
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => microphone.toggle()}
                                >
                                    {isMicMute ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant={isCamMute ? "destructive" : "secondary"}
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => camera.toggle()}
                                >
                                    {isCamMute ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleJoin}
                            disabled={isJoining}
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                "Join Now"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
