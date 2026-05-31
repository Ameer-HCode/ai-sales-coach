"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCallId } from "@/actions/create-call";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Video, Keyboard, Link as LinkIcon, Plus, Calendar, Loader2, Copy, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export default function StartCallPage() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [meetingCode, setMeetingCode] = useState("");
    const [createdCallId, setCreatedCallId] = useState<string | null>(null);
    const [meetingLink, setMeetingLink] = useState("");
    const [hasCopied, setHasCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleStartCall = async () => {
        setIsCreating(true);
        try {
            const id = await createCallId();
            const originUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
            const link = `${originUrl}/call/${id}`;
            setCreatedCallId(id);
            setMeetingLink(link);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Failed to create call", error);
            toast.error("Failed to create meeting");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(meetingLink);
        setHasCopied(true);
        toast.success("Meeting link copied!");
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleJoinNow = () => {
        if (createdCallId) {
            router.push(`/call/${createdCallId}`);
        }
    };

    const handleJoinFromInput = (e: React.FormEvent) => {
        e.preventDefault();
        if (!meetingCode) return;

        // Extract ID if full URL is pasted
        let id = meetingCode;
        if (meetingCode.includes("/call/")) {
            id = meetingCode.split("/call/")[1];
        }

        // Basic validation/cleanup could go here
        router.push(`/call/${id}`);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 md:flex-row md:gap-12 lg:gap-24">
            {/* Left Side: Hero & Actions */}
            <div className="flex w-full max-w-lg flex-col gap-8 text-center md:text-left">
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                        Premium Video Meetings for <span className="text-indigo-600">Sales Pros</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Connect with clients, record calls, and get real-time AI coaching insights. Secure, high-quality, and built for closers.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* New Meeting Button */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Button
                            size="lg"
                            className="h-14 gap-2 rounded-xl bg-indigo-600 px-8 text-lg font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 hover:bg-indigo-700"
                            onClick={handleStartCall}
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Video className="h-5 w-5" />
                            )}
                            New Meeting
                        </Button>

                        <div className="flex items-center gap-4 sm:hidden">
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                            <span className="text-sm text-slate-400">OR</span>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        </div>

                        {/* Join with Code Input */}
                        <form onSubmit={handleJoinFromInput} className="relative flex w-full items-center sm:max-w-xs">
                            <Keyboard className="absolute left-3 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Enter a code or link"
                                className="h-14 rounded-xl border-slate-200 bg-white pl-10 text-base shadow-sm focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900"
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                            />
                            <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                disabled={!meetingCode}
                                className="absolute right-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/50"
                            >
                                Join
                            </Button>
                        </form>
                    </div>

                    <div className="mt-2 flex items-center justify-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400 md:justify-start">
                        <span className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" /> Get a link to share
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Side: Visual/Hero Image */}
            <div className="relative mt-12 hidden w-full max-w-md md:block lg:max-w-lg">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 blur-2xl"></div>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-white/10">
                    {/* Abstract UI Mockup */}
                    <div className="absolute inset-0 flex flex-col">
                        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <div className="flex gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="h-2 w-20 rounded-full bg-white/20"></div>
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-4 p-4">
                            <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                                <div className="mb-2 h-8 w-8 rounded-full bg-indigo-500/20"></div>
                                <div className="h-2 w-16 rounded bg-white/20"></div>
                            </div>
                            <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                                <div className="mb-2 h-8 w-8 rounded-full bg-purple-500/20"></div>
                                <div className="h-2 w-16 rounded bg-white/20"></div>
                            </div>
                            <div className="col-span-2 rounded-lg bg-indigo-600/10 p-4 ring-1 ring-indigo-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white">
                                        <Video className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="mb-1 h-2 w-24 rounded bg-white/20"></div>
                                        <div className="h-2 w-32 rounded bg-white/10"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meeting Ready Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Your Meeting is Ready</DialogTitle>
                        <DialogDescription>
                            Share this link with others so they can join the meeting.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            <Input
                                id="link"
                                defaultValue={meetingLink}
                                readOnly
                                className="h-9 bg-slate-50 font-mono text-xs dark:bg-slate-900"
                            />
                        </div>
                        <Button type="submit" size="sm" className="px-3" onClick={handleCopyLink}>
                            <span className="sr-only">Copy</span>
                            {hasCopied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="default"
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleJoinNow}
                        >
                            Join Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
