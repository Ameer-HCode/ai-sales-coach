"use client";

import { Users, MessageSquare, Info, Settings, Captions } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
    activeTab: string | null;
    onTabChange: (tab: string | null) => void;
}

export default function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
    const tabs = [
        { id: "participants", icon: Users, label: "People" },
        { id: "chat", icon: MessageSquare, label: "Chat" }, // Placeholder for now
        { id: "info", icon: Info, label: "Info" },
        { id: "divider", icon: null, label: "divider" }, // Separator
        { id: "settings", icon: Settings, label: "Settings" },
        { id: "captions", icon: Captions, label: "Captions" },
    ];

    return (
        <div className="hidden md:flex flex-col items-center gap-4 py-4 w-16 bg-slate-950 border-l border-slate-800 z-40">
            {tabs.map((tab, idx) => {
                if (tab.id === "divider") {
                    return <div key={idx} className="h-px w-8 bg-slate-800 my-2" />;
                }

                const Icon = tab.icon!;
                const isActive = activeTab === tab.id;

                return (
                    <Button
                        key={tab.id}
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "rounded-full h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800",
                            isActive && "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                        )}
                        onClick={() => onTabChange(isActive ? null : tab.id)}
                        title={tab.label}
                    >
                        <Icon className="h-5 w-5" />
                    </Button>
                );
            })}
        </div>
    );
}
