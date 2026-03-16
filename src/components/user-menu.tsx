"use client";

import React from "react";
import { useSessionContext, signOut } from "supertokens-auth-react/recipe/session";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Bell } from "lucide-react";
import Link from "next/link";
import { redirectToAuth } from "supertokens-auth-react";
import { removePushSubscription } from "@/lib/api";

export const UserMenu = () => {
    const session = useSessionContext();
    const router = useRouter();

    if (session.loading) {
        return null; // Or a skeleton loader
    }

    if (!session.doesSessionExist) {
        return (
            <Button
                onClick={() => redirectToAuth()}
                variant="ghost"
                className="text-heading hover:text-heading dark:text-white/90 dark:hover:text-white"
            >
                Log in
            </Button>
        );
    }

    const handleLogout = async () => {
        try {
            if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    try {
                        await removePushSubscription(subscription.endpoint);
                    } catch (err) {
                        console.error("Failed to remove push subscription on logout:", err);
                    }
                    try {
                        await subscription.unsubscribe();
                    } catch (err) {
                        console.error("Failed to unsubscribe from push on this device:", err);
                    }
                }
            }
        } catch (e) {
            console.error("Logout cleanup error:", e);
        } finally {
            await signOut();
            router.push("/");
            router.refresh();
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full bg-gray-100 dark:bg-zinc-800"
                >
                    <User className="h-4 w-4 text-heading dark:text-white" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.userId}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/profile/alerts" className="flex items-center cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>My Alerts</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
