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
import { useEffect, useState } from "react"
import { getCallsData } from "@/actions/get-calls"



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
    const [recentCalls, setRecentCalls] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getCallsData().then(data => {
            setRecentCalls(data)
            setIsLoading(false)
        })
    }, [])

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
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            Loading calls...
                                        </TableCell>
                                    </TableRow>
                                ) : recentCalls.length > 0 ? (
                                    recentCalls.map((call) => (
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
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No calls found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="my_calls">
                        <div className="py-8 text-center text-muted-foreground">
                            No calls found for "My Calls" filter.
                        </div>
                    </TabsContent>
                    <TabsContent value="team">
                        <div className="py-8 text-center text-muted-foreground">
                            No calls found for "Team Calls" filter.
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
