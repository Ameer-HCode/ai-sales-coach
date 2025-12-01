import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { RecentCalls } from "@/components/dashboard/recent-calls"
import { AiInsights } from "@/components/dashboard/ai-insights"

export default function DashboardPage() {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72 pb-10">
        <Navbar />
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)]">

          {/* KPI Section */}
          <section>
            <KpiCards />
          </section>

          {/* Charts Section */}
          <section>
            <PerformanceChart />
          </section>

          {/* Recent Calls & AI Insights */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <RecentCalls />
            <AiInsights />
          </section>
        </div>
      </main>
    </div>
  )
}
