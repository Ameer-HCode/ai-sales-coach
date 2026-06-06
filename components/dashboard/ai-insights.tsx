"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, TrendingUp, AlertTriangle, ThumbsUp, ChevronDown, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getInsightsData } from "@/actions/get-insights"

const iconMap: any = {
    warning: AlertTriangle,
    success: ThumbsUp,
    neutral: TrendingUp,
    tip: Sparkles,
};

export function AiInsights() {
    const [insights, setInsights] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})

    const toggleDate = (date: string) => {
        setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }))
    }

    useEffect(() => {
        getInsightsData(Date.now()).then(data => {
            setInsights(data)
            
            // Auto-expand the most recent date if exists
            if (data.length > 0) {
                const firstDate = data[0].time; // time is already formatted as date string in getInsightsData
                setExpandedDates({ [firstDate]: true });
            }
            setIsLoading(false)
        }).catch(err => {
            console.error("Failed to load insights:", err)
            setIsLoading(false)
        })
    }, [])

    // Group insights by date (which is stored in 'time' from getInsightsData)
    const insightsByDate = insights.reduce((acc, insight) => {
        const dateStr = insight.time;
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(insight);
        return acc;
    }, {} as Record<string, any[]>);

    // Get last 5 unique dates sorted
    const sortedDates = Object.keys(insightsByDate)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .slice(0, 5);
    return (
        <Card className="col-span-1 h-full">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <CardTitle>AI Coach Insights</CardTitle>
                </div>
                <CardDescription>Real-time feedback on your performance</CardDescription>
            </CardHeader>
            <CardContent className="pr-0">
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {isLoading ? (
                            <p className="p-4 text-sm text-slate-500 text-center">Loading insights...</p>
                        ) : sortedDates.length > 0 ? (
                            sortedDates.map((dateGroup) => (
                                <div key={dateGroup} className="space-y-2">
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer bg-slate-100/50 p-2 rounded-md hover:bg-slate-100 transition-colors border"
                                        onClick={() => toggleDate(dateGroup)}
                                    >
                                        {expandedDates[dateGroup] ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                                        <span className="font-semibold text-slate-700 text-sm">{dateGroup}</span>
                                        <Badge variant="secondary" className="bg-white text-xs ml-auto">{insightsByDate[dateGroup].length} insights</Badge>
                                    </div>
                                    
                                    {expandedDates[dateGroup] && (
                                        <div className="space-y-3 pl-2 border-l-2 border-slate-100 ml-3 pt-2">
                                            {insightsByDate[dateGroup].map((insight) => {
                                                const Icon = iconMap[insight.type] || Sparkles;
                                                return (
                                                    <div key={insight.id} className="flex items-start space-x-4 p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                        <div className={`p-2 rounded-full shrink-0 ${insight.bg}`}>
                                                            <Icon className={`h-4 w-4 ${insight.color}`} />
                                                        </div>
                                                        <div className="space-y-1 w-full">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium leading-none">{insight.title}</p>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {insight.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-slate-500 text-center">No insights generated yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
