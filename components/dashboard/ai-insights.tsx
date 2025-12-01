"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, AlertTriangle, ThumbsUp } from "lucide-react"

const insights = [
    {
        id: 1,
        type: "warning",
        icon: AlertTriangle,
        title: "Pacing Alert",
        description: "You spoke too fast in 3 calls today (>160 wpm). Slow down to improve clarity.",
        time: "2h ago",
        color: "text-amber-500",
        bg: "bg-amber-50",
    },
    {
        id: 2,
        type: "success",
        icon: ThumbsUp,
        title: "Positive Response",
        description: "Prospects responded better when benefits were explained early in the conversation.",
        time: "4h ago",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
    },
    {
        id: 3,
        type: "neutral",
        icon: TrendingUp,
        title: "Emotion Trend",
        description: "Sentiment analysis shows 75% positive/neutral emotions across all calls today.",
        time: "5h ago",
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    {
        id: 4,
        type: "tip",
        icon: Sparkles,
        title: "Closing Technique",
        description: "Try using the 'Assumptive Close' technique for the upcoming negotiation with TechCorp.",
        time: "6h ago",
        color: "text-indigo-500",
        bg: "bg-indigo-50",
    },
    {
        id: 5,
        type: "warning",
        icon: AlertTriangle,
        title: "Interruption Rate",
        description: "You interrupted the prospect 4 times in the last call. Active listening recommended.",
        time: "Yesterday",
        color: "text-amber-500",
        bg: "bg-amber-50",
    },
]

export function AiInsights() {
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
                        {insights.map((insight) => (
                            <div key={insight.id} className="flex items-start space-x-4 p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                <div className={`p-2 rounded-full shrink-0 ${insight.bg}`}>
                                    <insight.icon className={`h-4 w-4 ${insight.color}`} />
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
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
