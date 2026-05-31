"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCallId } from "@/actions/create-call";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Video, Link as LinkIcon, Plus, Copy, Check, Keyboard, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function NewMeetingMenu() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");
    const [hasCopied, setHasCopied] = useState(false);
    const [joinCode, setJoinCode] = useState("");

    const handleStartInstant = async () => {
        setIsCreating(true);
        try {
            const id = await createCallId();
            router.push(`/call/${id}`);
        } catch (error) {
            console.error("Failed to create call", error);
            toast.error("Failed to create meeting");
            setIsCreating(false);
        }
    };

    const handleCreateForLater = async (e: Event) => {
        e.preventDefault(); // Prevent dropdown closing
        try {
            const id = await createCallId();
            const originUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
            const link = `${originUrl}/call/${id}`;
            setGeneratedLink(link);
        } catch (error) {
            toast.error("Failed to generate link");
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        setHasCopied(true);
        toast.success("Link copied");
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode) return;

        let id = joinCode;
        if (joinCode.includes("/call/")) {
            id = joinCode.split("/call/")[1];
        }
        router.push(`/call/${id}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                    New Meeting
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] p-2" onCloseAutoFocus={(e) => {
                // Prevent closing if interacting with internal inputs/buttons
                if (generatedLink) e.preventDefault();
            }}>
                {!generatedLink ? (
                    <>
                        <DropdownMenuItem onSelect={(e) => handleCreateForLater(e)} className="gap-3 py-3 cursor-pointer">
                            <LinkIcon className="h-4 w-4 text-slate-500" />
                            <div className="flex flex-col">
                                <span className="font-medium">Create a meeting for later</span>
                                <span className="text-xs text-slate-500">Get a link you can share</span>
                            </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={handleStartInstant} className="gap-3 py-3 cursor-pointer">
                            <Plus className="h-4 w-4 text-slate-500" />
                            <div className="flex flex-col">
                                <span className="font-medium">Start an instant meeting</span>
                                <span className="text-xs text-slate-500">Connect with others right now</span>
                            </div>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <div className="p-2">
                            <DropdownMenuLabel className="text-xs font-normal text-slate-500 px-0 pb-2">
                                Join with a code or link
                            </DropdownMenuLabel>
                            <form onSubmit={handleJoin} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Keyboard className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Enter code"
                                        className="h-9 pl-9 text-sm"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()} // Prevent menu navigation
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="ghost"
                                    className="text-indigo-600 disabled:text-slate-300"
                                    disabled={!joinCode}
                                >
                                    Join
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="p-2 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h4 className="font-medium text-sm">Here's your joining info</h4>
                                <p className="text-xs text-slate-500">
                                    Copy this link and send it to people you want to meet with.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-slate-100"
                                onClick={() => setGeneratedLink("")}
                            >
                                <span className="sr-only">Close</span>
                                &times;
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-md dark:bg-slate-800">
                            <code className="flex-1 text-xs truncate text-slate-700 dark:text-slate-300">
                                {generatedLink}
                            </code>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-700"
                                onClick={handleCopyLink}
                            >
                                {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
