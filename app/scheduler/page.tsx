"use client";

import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Video, MoreVertical, Plus, ChevronLeft, ChevronRight, User } from "lucide-react"

const upcomingMeetings = [
    {
        id: 1,
        title: "Property Viewing: 1240 Downtown Loft",
        client: "Sarah Jenkins",
        time: "10:00 AM - 11:00 AM",
        date: "Today",
        type: "Video Call",
        status: "Upcoming"
    },
    {
        id: 2,
        title: "Initial Consultation: Suburban Relocation",
        client: "Mark & Lisa Smith",
        time: "1:30 PM - 2:00 PM",
        date: "Today",
        type: "Video Call",
        status: "Upcoming"
    },
    {
        id: 3,
        title: "Contract Review: 4500 Ocean Blvd",
        client: "David Chen",
        time: "9:00 AM - 10:00 AM",
        date: "Tomorrow",
        type: "In-Person",
        status: "Upcoming"
    }
];

export default function SchedulerPage() {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 pb-10">
                <Navbar />
                <div className="p-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Schedule</h2>
                            <p className="text-muted-foreground mt-1">Manage your upcoming property viewings and client meetings.</p>
                        </div>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 self-start sm:self-auto">
                            <Plus className="h-4 w-4" />
                            New Appointment
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Calendar UI (Static Mockup) */}
                        <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                                <div>
                                    <CardTitle>June 2026</CardTitle>
                                    <CardDescription>Click on a date to view or add events</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-500 mb-4">
                                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {/* Empty slots for May */}
                                    <div className="h-24 rounded-md border border-slate-100 bg-slate-50 opacity-50 p-1">31</div>
                                    
                                    {/* June Dates */}
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-24 rounded-md border p-1 flex flex-col cursor-pointer transition-colors ${
                                                i + 1 === 3 ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-300'
                                            }`}
                                        >
                                            <span className={`text-sm font-semibold inline-block w-6 h-6 rounded-full text-center leading-6 ${i+1 === 3 ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                                                {i + 1}
                                            </span>
                                            
                                            {/* Mock Event Indicators */}
                                            {i + 1 === 3 && (
                                                <div className="mt-1 flex flex-col gap-1">
                                                    <div className="text-[10px] bg-blue-100 text-blue-700 rounded px-1 truncate">10a Loft</div>
                                                    <div className="text-[10px] bg-green-100 text-green-700 rounded px-1 truncate">1p Consult</div>
                                                </div>
                                            )}
                                            {i + 1 === 4 && (
                                                <div className="mt-1">
                                                    <div className="text-[10px] bg-purple-100 text-purple-700 rounded px-1 truncate">9a Review</div>
                                                </div>
                                            )}
                                            {i + 1 === 10 && (
                                                <div className="mt-1">
                                                    <div className="text-[10px] bg-blue-100 text-blue-700 rounded px-1 truncate">3p Open House</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column: Upcoming Agenda */}
                        <div className="space-y-6">
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {upcomingMeetings.map((meeting) => (
                                        <div key={meeting.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all cursor-pointer">
                                            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-2 min-w-[60px]">
                                                <span className="text-xs text-slate-500 font-medium uppercase">{meeting.date}</span>
                                                <span className="text-sm font-bold text-slate-900 mt-1">{meeting.time.split(' ')[0]}</span>
                                            </div>
                                            
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-semibold text-slate-900 truncate">{meeting.title}</h4>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                                    <User className="h-3.5 w-3.5" />
                                                    <span className="truncate">{meeting.client}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                                                        meeting.type === 'Video Call' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                        {meeting.type === 'Video Call' ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                                                        {meeting.type}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <Button variant="ghost" size="icon" className="h-8 w-8 self-center -mr-2">
                                                <MoreVertical className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md border-none">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <Calendar className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Sync Your Calendar</h3>
                                    <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                                        Connect Google Calendar or Outlook to automatically sync your property viewings and generate pre-call briefs.
                                    </p>
                                    <Button className="w-full bg-white text-indigo-600 hover:bg-slate-50 font-semibold shadow-sm">
                                        Connect Account
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
