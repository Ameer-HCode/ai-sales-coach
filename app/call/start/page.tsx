"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Video, Copy, UserPlus, Mic, Camera } from "lucide-react"
import { useState } from "react"

export default function StartCallPage() {
    const [meetingLink, setMeetingLink] = useState("")

    const generateLink = () => {
        const randomId = Math.random().toString(36).substring(7)
        setMeetingLink(`https://salescoach.ai/meet/${randomId}`)
    }

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 pb-10">
                <Navbar />
                <div className="p-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)] flex items-center justify-center">

                    <div className="grid lg:grid-cols-2 gap-12 w-full max-w-5xl items-center">
                        <div className="space-y-6">
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                                Premium video meetings. <br />
                                Now free for everyone.
                            </h1>
                            <p className="text-lg text-slate-600">
                                We re-engineered the service we built for secure business meetings, Google Meet, to make it free and available for all.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={generateLink}>
                                    <Video className="mr-2 h-5 w-5" />
                                    New Meeting
                                </Button>
                                <div className="flex gap-2 w-full sm:max-w-xs">
                                    <div className="relative w-full">
                                        <Input placeholder="Enter a code or link" className="h-11" />
                                    </div>
                                    <Button variant="ghost" className="text-slate-600 font-medium h-11">Join</Button>
                                </div>
                            </div>

                            {meetingLink && (
                                <Card className="mt-6 bg-slate-50 border-slate-200">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="text-sm text-slate-600">
                                            Here's your meeting link: <br />
                                            <span className="font-medium text-slate-900">{meetingLink}</span>
                                        </div>
                                        <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(meetingLink)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="relative">
                            {/* Mock Video Preview */}
                            <div className="aspect-video bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative group">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                                        JD
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                                    <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center text-white cursor-pointer hover:bg-red-600 transition">
                                        <Mic className="h-5 w-5" />
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-white cursor-pointer hover:bg-slate-600 transition">
                                        <Camera className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -z-10 top-10 -right-10 h-72 w-72 bg-indigo-200 rounded-full blur-3xl opacity-30"></div>
                            <div className="absolute -z-10 -bottom-10 -left-10 h-72 w-72 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
