import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { AiInsights } from "@/components/dashboard/ai-insights"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, MessageSquare } from "lucide-react"
import { getInsightsStats } from "@/actions/get-insights-stats"

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
    const stats = await getInsightsStats();
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 pb-10">
                <Navbar />
                <div className="p-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">AI Insights</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Analysis</CardTitle>
                                <Brain className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalAnalysis}</div>
                                <p className="text-xs text-muted-foreground">{stats.totalAnalysisTrend}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.sentimentScore}</div>
                                <p className="text-xs text-muted-foreground">{stats.sentimentTrend}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Coaching Tips</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.coachingTips}</div>
                                <p className="text-xs text-muted-foreground">{stats.coachingTipsTrend}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-1">
                        <AiInsights />
                    </div>
                </div>
            </main>
        </div>
    )
}
