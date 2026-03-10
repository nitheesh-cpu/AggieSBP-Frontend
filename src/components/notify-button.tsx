"use client";

import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { subscribeToSectionPush } from "@/lib/api";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming shadcn UI tooltip
import { Button } from "@/components/ui/button"; // Assuming shadcn UI button

interface NotifyButtonProps {
    courseSectionId: string;
}

export function NotifyButton({ courseSectionId }: NotifyButtonProps) {
    const { isLoggedIn, isStandalone, permission, requestAndSubscribe } = usePushNotifications();
    const [loading, setLoading] = useState(false);

    // If the user isn't authenticated yet, don't return anything
    if (!isLoggedIn) {
        return null;
    }

    const handleNotifyMe = async () => {
        if (loading) return;

        try {
            setLoading(true);

            // On iOS devices, PWA web push *requires* standalone mode to work
            const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

            if (isIos && !isStandalone) {
                toast.info("Please add this app to your Home Screen to receive notifications.", {
                    duration: 5000,
                });
                setLoading(false);
                return;
            }

            const subscription = await requestAndSubscribe();

            // Submit the subscription to the backend
            await subscribeToSectionPush(courseSectionId, subscription);

            toast.success("Successfully subscribed to notifications!");
        } catch (error: any) {
            console.error(error);
            if (error.message === "Notification permission not granted" || error.message === "Permission denied") {
                toast.error("Please allow notification permissions in your browser settings.");
            } else {
                toast.error(error.message || "Failed to subscribe to notifications.");
            }
        } finally {
            setLoading(false);
        }
    };

    const isIos = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const needsInstallTooltip = isIos && !isStandalone;

    const buttonContent = (
        <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleNotifyMe}
            disabled={loading}
        >
            <Bell className="h-4 w-4" />
            {loading ? "Subscribing..." : "Notify Me"}
        </Button>
    );

    if (needsInstallTooltip) {
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="inline-block">{buttonContent}</div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p className="max-w-[200px] text-center">
                            Please install this app to your home screen using the share button below to get notifications on iOS.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return buttonContent;
}
