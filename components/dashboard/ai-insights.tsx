"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, TrendingUp, AlertTriangle, ThumbsUp } from "lucide-react"
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

    useEffect(() => {
        getInsightsData(Date.now()).then(data => {
            setInsights(data)
            setIsLoading(false)
        }).catch(err => {
            console.error("Failed to load insights:", err)
            setIsLoading(false)
        })
    }, [])
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
                        ) : insights.length > 0 ? (
                            insights.map((insight) => {
                                const Icon = iconMap[insight.type] || Sparkles;
                                return (
                                    <div key={insight.id} className="flex items-start space-x-4 p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className={`p-2 rounded-full shrink-0 ${insight.bg}`}>
                                            <Icon className={`h-4 w-4 ${insight.color}`} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium leading-none">{insight.title}</p>
                                                <span className="text-xs text-muted-foreground">{insight.time}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {insight.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="p-4 text-sm text-slate-500 text-center">No insights generated yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
