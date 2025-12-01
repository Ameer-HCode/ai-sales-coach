import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function SchedulerPage() {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 pb-10">
                <Navbar />
                <div className="p-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Scheduler</h2>
                    </div>

                    <Card className="h-[500px] flex items-center justify-center border-dashed">
                        <CardContent className="text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">Calendar Integration</h3>
                            <p className="text-sm text-muted-foreground mt-2">Connect your Google Calendar or Outlook to see upcoming calls.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
