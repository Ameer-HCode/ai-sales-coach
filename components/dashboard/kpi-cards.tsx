"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CheckCircle2, Clock, Lightbulb } from "lucide-react"

const kpiData = [
    {
        title: "Total Calls Today",
        value: "42",
        description: "+12% from yesterday",
        icon: Phone,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    {
        title: "Deals Closed",
        value: "8",
        description: "3 pending approval",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
    },
    {
        title: "Avg Call Duration",
        value: "4m 12s",
        description: "-30s vs last week",
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
    },
    {
        title: "AI Suggestions",
        value: "156",
        description: "92% adoption rate",
        icon: Lightbulb,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
    },
]

export function KpiCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => (
                <Card key={kpi.title} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {kpi.title}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {kpi.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
