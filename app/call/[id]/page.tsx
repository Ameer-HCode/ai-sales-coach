"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    Call,
} from "@stream-io/video-react-sdk";
import { tokenProvider } from "@/actions/stream";
import { Loader2, Video, Settings, Mic, User as UserIcon } from "lucide-react";
import Lobby from "@/components/video/Lobby";
import CallUI from "@/components/video/CallUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function CallPage() {
    const params = useParams();
    const id = params.id as string;
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const [userName, setUserName] = useState("");
    const [isSetup, setIsSetup] = useState(false);
    const [joined, setJoined] = useState(false);

    // 1. Initialize Client & Call (Run once when setup is complete)
    useEffect(() => {
        if (!isSetup || !userName || !id) return;

        const userId = crypto.randomUUID(); // Generate unique ID for this session

        const init = async () => {
            const client = new StreamVideoClient({
                apiKey,
                user: {
                    id: userId,
                    name: userName,
                    image: `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`,
                    type: "authenticated", // Authenticated user type to allow call creation
                },
                tokenProvider: async () => {
                    return await tokenProvider(userId);
                },
            });

            const call = client.call("default", id);
            await call.getOrCreate();

            setClient(client);
            setCall(call);
        };

        init();

        return () => {
            if (client) {
                client.disconnectUser();
            }
        };
    }, [isSetup, userName, id]);

    // 2. Pre-Lobby: Enter Name
    if (!isSetup) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 p-4 font-sans text-white">
                <div className="mb-8 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                        <Video className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        AI Sales<span className="text-blue-500">Agent</span>
                    </h1>
                </div>

                <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 shadow-2xl">
                    <CardHeader className="space-y-1 pb-6 text-center">
                        <CardTitle className="text-xl font-medium text-white">Join Meeting</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Enter your name to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="sr-only">Name</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <Input
                                    id="name"
                                    placeholder="Your Name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="h-11 border-zinc-700 bg-zinc-800 pl-10 text-base text-white placeholder:text-zinc-500 focus-visible:ring-blue-600"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && userName.trim()) {
                                            setIsSetup(true);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="h-11 w-full bg-blue-600 text-base font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
                            onClick={() => setIsSetup(true)}
                            disabled={!userName.trim()}
                        >
                            Join Meeting
                        </Button>
                    </CardFooter>
                </Card>

                <p className="mt-8 text-center text-xs text-zinc-500">
                    Protected by end-to-end encryption.
                </p>
            </div>
        );
    }

    // 3. Authenticating / Connecting
    if (!client || !call) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-zinc-950 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="animate-pulse text-sm font-medium text-zinc-400">Connecting...</p>
            </div>
        );
    }

    // 4. Lobby & Call (Stream Components)
    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                {!joined ? (
                    <Lobby onJoin={() => setJoined(true)} />
                ) : (
                    <CallUI />
                )}
            </StreamCall>
        </StreamVideo>
    );
}
