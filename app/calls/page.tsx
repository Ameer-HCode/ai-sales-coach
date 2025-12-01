"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
    Search,
    Calendar,
    Clock,
    MoreHorizontal,
    Play,
    FileText,
    Share2,
    Download,
    Filter,
    Video,
    Phone,
    ArrowUpDown
} from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const callsData = [
    {
        id: "1",
        title: "Weekly Sync with TechCorp",
        date: "Today, 10:23 AM",
        duration: "45 min",
        participants: [
            { name: "Sarah Miller", img: "/avatars/02.png", fallback: "SM" },
            { name: "John Doe", img: "/avatars/01.png", fallback: "JD" }
        ],
        status: "Closed Won",
        sentiment: "Positive",
        type: "video",
        recording: true,
    },
    {
        id: "2",
        title: "Discovery Call - Growth Dynamics",
        date: "Today, 09:15 AM",
        duration: "24 min",
        participants: [
            { name: "Michael Chen", img: "/avatars/03.png", fallback: "MC" },
            { name: "John Doe", img: "/avatars/01.png", fallback: "JD" }
        ],
        status: "Negotiation",
        sentiment: "Neutral",
        type: "phone",
        recording: true,
    },
    {
        id: "3",
        title: "Contract Review - Innovate Solutions",
        date: "Yesterday, 4:50 PM",
        duration: "1h 12m",
        participants: [
            { name: "Jessica Davis", img: "/avatars/04.png", fallback: "JD" },
            { name: "Mark Wilson", img: "/avatars/05.png", fallback: "MW" },
            { name: "John Doe", img: "/avatars/01.png", fallback: "JD" }
        ],
        status: "Follow Up",
        sentiment: "Mixed",
        type: "video",
        recording: true,
    },
    {
        id: "4",
        title: "Intro Call - Omega Systems",
        date: "Yesterday, 2:15 PM",
        duration: "15 min",
        participants: [
            { name: "David Wilson", img: "/avatars/05.png", fallback: "DW" }
        ],
        status: "Missed",
        sentiment: "N/A",
        type: "phone",
        recording: false,
    },
    {
        id: "5",
        title: "Demo Presentation - Alpha Retail",
        date: "Oct 24, 11:00 AM",
        duration: "55 min",
        participants: [
            { name: "Emily Brown", img: "/avatars/06.png", fallback: "EB" },
            { name: "Team Member", img: "/avatars/01.png", fallback: "TM" }
        ],
        status: "Completed",
        sentiment: "Positive",
        type: "video",
        recording: true,
    },
]

export default function CallsPage() {
    const [filterStatus, setFilterStatus] = useState("all")

    const filteredCalls = callsData.filter(call => {
        if (filterStatus === "all") return true
        return call.status === filterStatus
    })

    return (
        <div className="h-full relative bg-slate-50">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 pb-10">
                <Navbar />
                <div className="p-8 max-w-7xl mx-auto space-y-6">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Call History</h1>
                            <p className="text-sm text-slate-500 mt-1">View recordings, transcripts, and AI insights from your past meetings.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="bg-white">
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Link href="/call/start">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <Video className="mr-2 h-4 w-4" />
                                    New Meeting
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search by name, company, or topic..." className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" />
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Button variant="outline" className="w-full md:w-auto text-slate-600 border-slate-200">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Date Range
                                    </Button>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="w-[180px] border-slate-200">
                                            <Filter className="mr-2 h-4 w-4" />
                                            <SelectValue placeholder="Filter by Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="Closed Won">Closed Won</SelectItem>
                                            <SelectItem value="Negotiation">Negotiation</SelectItem>
                                            <SelectItem value="Follow Up">Follow Up</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Missed">Missed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Calls Table */}
                    <Card className="border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[300px]">Meeting</TableHead>
                                    <TableHead>Participants</TableHead>
                                    <TableHead>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                                            Date & Time
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Sentiment</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCalls.length > 0 ? (
                                    filteredCalls.map((call) => (
                                        <TableRow key={call.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <TableCell>
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg mt-1 ${call.type === 'video' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        {call.type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{call.title}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                                            {call.recording && (
                                                                <span className="flex items-center gap-1 text-slate-400">
                                                                    <Play className="h-3 w-3" /> Recorded
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {call.participants.map((p, i) => (
                                                        <Avatar key={i} className="inline-block border-2 border-white h-8 w-8 ring-2 ring-transparent">
                                                            <AvatarImage src={p.img} />
                                                            <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px]">{p.fallback}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-slate-600">{call.date}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    ${call.status === 'Closed Won' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                                    ${call.status === 'Negotiation' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                                    ${call.status === 'Follow Up' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                    ${call.status === 'Missed' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                    ${call.status === 'Completed' ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
                                                `}>
                                                    {call.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-slate-600">{call.duration}</span>
                                            </TableCell>
                                            <TableCell>
                                                {call.sentiment !== "N/A" ? (
                                                    <Badge variant="outline" className={`
                                                        ${call.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                                        ${call.sentiment === 'Neutral' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                        ${call.sentiment === 'Mixed' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                                    `}>
                                                        {call.sentiment}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600">
                                                        <Play className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Share2 className="mr-2 h-4 w-4" /> Share
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Download className="mr-2 h-4 w-4" /> Download
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600">
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                            No calls found matching your filter.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <div className="p-4 border-t bg-slate-50/50 flex items-center justify-between text-sm text-slate-500">
                            <div>Showing {filteredCalls.length} calls</div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled>Previous</Button>
                                <Button variant="outline" size="sm">Next</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}
