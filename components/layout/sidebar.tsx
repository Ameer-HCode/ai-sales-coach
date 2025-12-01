"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    LayoutDashboard,
    Phone,
    BarChart3,
    Calendar,
    Settings,
    Menu,
    X,
    Bot
} from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            active: pathname === "/dashboard" || pathname === "/",
        },
        {
            label: "Call History",
            icon: Phone,
            href: "/calls",
            active: pathname === "/calls",
        },
        {
            label: "AI Insights",
            icon: Bot,
            href: "/insights",
            active: pathname === "/insights",
        },
        {
            label: "Scheduler",
            icon: Calendar,
            href: "/scheduler",
            active: pathname === "/scheduler",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/settings",
            active: pathname === "/settings",
        },
    ]

    const SidebarContent = () => (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <Bot className="h-8 w-8 mr-2 text-indigo-500" />
                    <h1 className="text-2xl font-bold">
                        Sales<span className="text-indigo-500">Coach</span>
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                route.active ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-indigo-500" : "text-zinc-400 group-hover:text-indigo-500")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="mt-auto px-3 py-2">
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Pro Plan</h4>
                    <p className="text-xs text-zinc-400 mb-3">You have 120 call minutes remaining this month.</p>
                    <Button size="sm" variant="secondary" className="w-full">Upgrade</Button>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn("hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50", className)}>
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Trigger - usually in Navbar, but kept here for self-containment if needed, or handled via Navbar */}
        </>
    )
}

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-900 border-none w-72 text-white">
                <div className="space-y-4 py-4 flex flex-col h-full">
                    <div className="px-3 py-2">
                        <Link href="/" className="flex items-center pl-3 mb-14">
                            <Bot className="h-8 w-8 mr-2 text-indigo-500" />
                            <h1 className="text-2xl font-bold">
                                Sales<span className="text-indigo-500">Coach</span>
                            </h1>
                        </Link>
                        <div className="space-y-1">
                            {/* Re-using logic or component would be better but for speed duplicating content for mobile specific styling if needed */}
                            <Link href="/dashboard" className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-white bg-white/10">
                                <div className="flex items-center flex-1">
                                    <LayoutDashboard className="h-5 w-5 mr-3 text-indigo-500" />
                                    Dashboard
                                </div>
                            </Link>
                            <Link href="/calls" className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400">
                                <div className="flex items-center flex-1">
                                    <Phone className="h-5 w-5 mr-3 text-zinc-400 group-hover:text-indigo-500" />
                                    Call History
                                </div>
                            </Link>
                            <Link href="/insights" className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400">
                                <div className="flex items-center flex-1">
                                    <Bot className="h-5 w-5 mr-3 text-zinc-400 group-hover:text-indigo-500" />
                                    AI Insights
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
