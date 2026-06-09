"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getAvatarInitials } from "@/lib/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { History, LogOut } from "lucide-react";

export function UserAvatar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const initials = getAvatarInitials(user);
    const fullName = user?.user_metadata?.full_name ?? "User";

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            toast.success("Logged out successfully. See you soon!");
            router.push("/");
            router.refresh();
        } catch {
            toast.error("Failed to log out. Please try again.");
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="User menu"
                >
                    <Avatar size="lg" className="cursor-pointer hover:opacity-80 transition-opacity bg-[#B1F82A] text-black font-semibold">
                        <AvatarFallback className="bg-[#B1F82A] text-black font-semibold text-sm">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-53">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <a href="/history">
                        <History className="size-4" />
                        History
                    </a>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                    {loggingOut ? (
                        <>
                            <Spinner className="size-4" />
                            Logging Out...
                        </>
                    ) : (
                        <>
                            <LogOut className="size-4" />
                            Logout
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}