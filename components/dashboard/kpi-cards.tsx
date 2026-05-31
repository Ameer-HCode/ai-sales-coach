"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CheckCircle2, Clock, Lightbulb } from "lucide-react"
import { useEffect, useState } from "react"
import { getKpisData } from "@/actions/get-kpis"

const iconMap: any = {
    Phone,
    CheckCircle2,
    Clock,
    Lightbulb
}

export function KpiCards() {
    const [kpiData, setKpiData] = useState<any[]>([])

    useEffect(() => {
        getKpisData().then(setKpiData)
    }, [])

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => {
                const Icon = iconMap[kpi.iconName] || Phone;
                return (
                    <Card key={kpi.title} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {kpi.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                                <Icon className={`h-4 w-4 ${kpi.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {kpi.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    )
}
