"use client";

import { useCallStateHooks, CallParticipantsList } from "@stream-io/video-react-sdk";
import { X, Copy, Check, Info, Users, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CallSidebarProps {
    onClose: () => void;
    meetingLink: string;
}

export default function CallSidebar({ onClose, meetingLink }: CallSidebarProps) {
    const { useCallSession } = useCallStateHooks();
    const session = useCallSession();
    const [hasCopied, setHasCopied] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(meetingLink);
        setHasCopied(true);
        toast.success("Meeting link copied");
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div className="flex h-full w-[350px] flex-col border-l border-slate-800 bg-slate-900 text-white shadow-2xl transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 pb-2">
                <h2 className="text-lg font-semibold">Meeting details</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-slate-800">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <Tabs defaultValue="participants" className="flex-1 w-full flex flex-col">
                <div className="px-4 pb-2">
                    <TabsList className="w-full bg-slate-800 text-slate-400">
                        <TabsTrigger value="participants" className="flex-1 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                            <Users className="mr-2 h-4 w-4" />
                            People
                        </TabsTrigger>
                        <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                            <Info className="mr-2 h-4 w-4" />
                            Info
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="participants" className="flex-1 flex flex-col min-h-0 data-[state=active]:flex">
                    <div className="px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        In Call
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="px-2">
                            {/* Stream's built-in list is excellent and customizable via theme, 
                                 but for now we use the default for "Avatar/Name/Mic/Cam" handling 
                                 which is complex to rebuild efficiently manually. */}
                            <CallParticipantsList onClose={() => { }} />
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="info" className="flex-1 p-4 space-y-6 data-[state=active]:block">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-300">Joining Info</h3>
                        <div className="rounded-lg bg-slate-800 p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Meeting Link</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 hover:bg-slate-700 hover:text-white"
                                    onClick={handleCopy}
                                >
                                    {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                            </div>
                            <div className="text-xs font-mono text-indigo-400 break-all">
                                {meetingLink}
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Shield className="h-4 w-4 text-emerald-500" />
                            <span>Encryption is on</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
