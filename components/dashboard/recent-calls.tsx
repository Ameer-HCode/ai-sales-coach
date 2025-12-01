"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Video } from "lucide-react"
import Link from "next/link"

const recentCalls = [
    {
        id: "1",
        name: "Sarah Miller",
        company: "TechCorp Inc.",
        avatar: "/avatars/02.png",
        initials: "SM",
        date: "Today, 10:23 AM",
        status: "Closed Won",
        duration: "12m 45s",
        summary: "High interest in Pro plan. Agreed to sign contract.",
    },
    {
        id: "2",
        name: "Michael Chen",
        company: "Growth Dynamics",
        avatar: "/avatars/03.png",
        initials: "MC",
        date: "Today, 09:15 AM",
        status: "Negotiation",
        duration: "24m 10s",
        summary: "Discussed pricing. Requested 10% discount for annual.",
    },
    {
        id: "3",
        name: "Jessica Davis",
        company: "Innovate Solutions",
        avatar: "/avatars/04.png",
        initials: "JD",
        date: "Yesterday, 4:50 PM",
        status: "Follow Up",
        duration: "08m 30s",
        summary: "Needs to consult with CTO. Scheduled follow-up for Tue.",
    },
    {
        id: "4",
        name: "David Wilson",
        company: "Omega Systems",
        avatar: "/avatars/05.png",
        initials: "DW",
        date: "Yesterday, 2:15 PM",
        status: "Lost",
        duration: "05m 12s",
        summary: "Budget constraints. Not ready to commit this quarter.",
    },
    {
        id: "5",
        name: "Emily Brown",
        company: "Alpha Retail",
        avatar: "/avatars/06.png",
        initials: "EB",
        date: "Yesterday, 11:00 AM",
        status: "Qualified",
        duration: "15m 20s",
        summary: "Good fit. Demo scheduled for next week.",
    },
]

const getStatusColor = (status: string) => {
    switch (status) {
        case "Closed Won":
            return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200";
        case "Lost":
            return "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200";
        case "Negotiation":
            return "bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200";
        default:
            return "bg-slate-100 text-slate-700 hover:bg-slate-100/80 border-slate-200";
    }
}

export function RecentCalls() {
    return (
        <Card className="col-span-1 lg:col-span-2 h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Recent Calls</CardTitle>
                    <div className="flex space-x-2">
                        <Link href="/call/start">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Video className="mr-2 h-4 w-4" />
                                Start Call
                            </Button>
                        </Link>
                        <div className="relative w-40 md:w-60">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-8 h-9" />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[130px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="won">Closed Won</SelectItem>
                                <SelectItem value="negotiation">Negotiation</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">All Calls</TabsTrigger>
                        <TabsTrigger value="my_calls">My Calls</TabsTrigger>
                        <TabsTrigger value="team">Team Calls</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lead</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Duration</TableHead>
                                    <TableHead className="hidden lg:table-cell">AI Summary</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentCalls.map((call) => (
                                    <TableRow key={call.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={call.avatar} alt={call.name} />
                                                    <AvatarFallback className="bg-indigo-50 text-indigo-600">{call.initials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-sm">{call.name}</div>
                                                    <div className="text-xs text-muted-foreground">{call.company}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{call.date}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(call.status)}>
                                                {call.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{call.duration}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                                            {call.summary}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="my_calls">
                        <div className="py-8 text-center text-muted-foreground">
                            No calls found for "My Calls" filter in this mock view.
                        </div>
                    </TabsContent>
                    <TabsContent value="team">
                        <div className="py-8 text-center text-muted-foreground">
                            No calls found for "Team Calls" filter in this mock view.
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
