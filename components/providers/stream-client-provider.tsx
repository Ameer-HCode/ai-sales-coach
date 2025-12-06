"use client";

import {
    StreamVideo,
    StreamVideoClient,
    User,
} from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";
import { tokenProvider } from "@/actions/stream";
import { Loader2 } from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

interface StreamProviderProps {
    children: ReactNode;
    userId: string; // In a real app, this comes from your auth provider (e.g. Clerk, NextAuth)
    userName: string;
    image?: string;
}

export default function StreamProvider({
    children,
    userId,
    userName,
    image,
}: StreamProviderProps) {
    const [videoClient, setVideoClient] = useState<StreamVideoClient>();

    useEffect(() => {
        if (!userId || !apiKey) return;

        const client = new StreamVideoClient({
            apiKey,
            user: {
                id: userId,
                name: userName,
                image: image,
            },
            tokenProvider: async () => {
                return await tokenProvider(userId);
            },
        });

        setVideoClient(client);
    }, [userId, userName, image]);

    if (!videoClient)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );

    return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
