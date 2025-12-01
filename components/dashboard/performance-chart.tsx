"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

const data = [
    {
        name: "Mon",
        calls: 24,
        deals: 4,
    },
    {
        name: "Tue",
        calls: 35,
        deals: 6,
    },
    {
        name: "Wed",
        calls: 42,
        deals: 8,
    },
    {
        name: "Thu",
        calls: 38,
        deals: 5,
    },
    {
        name: "Fri",
        calls: 45,
        deals: 9,
    },
    {
        name: "Sat",
        calls: 12,
        deals: 2,
    },
    {
        name: "Sun",
        calls: 8,
        deals: 1,
    },
]

export function PerformanceChart() {
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
