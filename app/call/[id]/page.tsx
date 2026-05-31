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
import { Loader2, Video, User as UserIcon } from "lucide-react";
import dynamic from "next/dynamic";

const Lobby = dynamic(() => import("@/components/video/Lobby"), {
    ssr: false,
    loading: () => (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    )
});

const CallUI = dynamic(() => import("@/components/video/CallUI"), {
    ssr: false,
    loading: () => (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    )
});
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function CallPage() {
    const params = useParams();
    const id = params.id as string;

    // State
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const [userName, setUserName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [isSetup, setIsSetup] = useState(false);
    const [joined, setJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Auth
    const { user, isLoaded: isClerkLoaded } = useUser();
    const isHost = !!(isClerkLoaded && user);

    // Auto-fill Host Name
    useEffect(() => {
        if (isHost && user) {
            setUserName(user.fullName || user.firstName || "Host");
        }
    }, [isHost, user]);

    // Handle Join
    const handleJoin = async () => {
        if (!userName) return;
        setIsLoading(true);

        try {
            let userId = "";
            let token = "";
            let userType: "guest" | "authenticated" = "guest";
            let image = `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`;

            if (isHost) {
                // Host Flow
                userId = user.id;
                userType = "authenticated";
                image = user.imageUrl;
                token = await tokenProvider(userId);
            } else {
                // Guest Flow
                const res = await fetch("/api/join-guest", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: userName, email: guestEmail, callId: id }),
                });

                if (!res.ok) throw new Error("Failed to join call");

                const data = await res.json();
                userId = data.userId;
                token = data.token;
            }

            // Initialize Stream Client
            const myClient = new StreamVideoClient({
                apiKey,
                user: {
                    id: userId,
                    name: userName,
                    image,
                    type: userType,
                },
                tokenProvider: async () => token,
            });

            // Initialize Call
            const myCall = myClient.call("default", id);
            await myCall.getOrCreate();

            setClient(myClient);
            setCall(myCall);
            setIsSetup(true);

        } catch (error) {
            console.error("Join Error:", error);
            alert("Could not join the call. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // RENDER: Loading Clerk (Initial)
    if (!isClerkLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // RENDER: Connecting Screen
    if (isSetup && (!client || !call)) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-zinc-950 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="animate-pulse text-sm font-medium text-zinc-400">Connecting to secure room...</p>
            </div>
        );
    }

    // RENDER: Active Call
    if (client && call) {
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

    // RENDER: Guest/Host Form (Lobby Pre-Auth)
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
                    <CardTitle className="text-xl font-medium text-white">
                        {isHost ? "Welcome Back" : "Join Meeting"}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        {isHost ? `Joining as ${userName}` : "Enter your details to join"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="sr-only">Name</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <Input
                                placeholder="Your Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="h-11 border-zinc-700 bg-zinc-800 pl-10 text-white focus-visible:ring-blue-600"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {!isHost && (
                        <div className="space-y-2">
                            <Label className="sr-only">Email</Label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    className="h-11 border-zinc-700 bg-zinc-800 pl-10 text-white focus-visible:ring-blue-600"
                                    disabled={isLoading}
                                />
                                <span className="absolute left-3 top-3 text-zinc-500">@</span>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="h-11 w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleJoin}
                        disabled={!userName || (!isHost && !guestEmail) || isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Now"}
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-8 text-center text-xs text-zinc-500">
                Protected by end-to-end encryption.
            </p>
        </div>
    );
}
