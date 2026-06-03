"use client"

import { useState, useEffect } from "react"
import { Bell, Search, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileSidebar } from "@/components/layout/sidebar"
import { useUser, useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

export function Navbar() {
    const { user } = useUser();
    const { signOut } = useClerk();

    const displayName = user?.fullName ||
        (user?.firstName ? `${user.firstName} ${user.lastName ?? ""}` : null) ||
        user?.emailAddresses?.[0]?.emailAddress;

    const email = user?.emailAddresses?.[0]?.emailAddress;
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const initials = mounted && displayName ? displayName.slice(0, 2).toUpperCase() : "U";

    return (
        <div className="flex items-center p-4 border-b h-16 bg-white">
            <MobileSidebar />
            <div className="hidden md:flex items-center ml-4">
                {/* Breadcrumbs or Page Title could go here */}
                <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
            </div>

            <div className="ml-auto flex items-center space-x-4">
                <div className="relative hidden md:block w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search calls, leads..." className="pl-8 bg-slate-50 border-slate-200" />
                </div>

                <Button variant="ghost" size="icon" className="relative" onClick={() => toast.info("No new notifications")}>
                    <Bell className="h-5 w-5 text-slate-600" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.imageUrl} alt={displayName || "User"} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-600">{initials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground truncate">
                                    {email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toast.info("Profile coming soon!")}>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Settings coming soon!")}>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 cursor-pointer focus:text-red-600"
                            onClick={() => signOut({ redirectUrl: "/" })}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
