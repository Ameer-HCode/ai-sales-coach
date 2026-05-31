"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { useEffect, useState } from "react"
import { getChartData } from "@/actions/get-chart-data"



export function PerformanceChart() {
    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        getChartData().then(setData)
    }, [])
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Weekly Call Performance</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="name"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="calls" name="Calls Made" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="deals" name="Deals Closed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
