import { useState, useCallback, useEffect } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

function base64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const session = useSessionContext();
    const [isStandalone, setIsStandalone] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        // Check if running in standalone mode (PWA)
        const checkStandalone = () => {
            const isIosStandalone = "standalone" in window.navigator && window.navigator.standalone;
            const isMatchMediaStandalone = window.matchMedia("(display-mode: standalone)").matches;
            setIsStandalone(!!isIosStandalone || isMatchMediaStandalone);
        };

        checkStandalone();

        if ("Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!("Notification" in window)) {
            throw new Error("Notifications not supported in this browser");
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    }, []);

    const subscribe = useCallback(async () => {
        if (permission !== "granted") {
            throw new Error("Notification permission not granted");
        }

        if (!("serviceWorker" in navigator)) {
            throw new Error("Service Worker not supported");
        }

        const registration = await navigator.serviceWorker.ready;

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
            throw new Error("VAPID public key not found");
        }

        // Attempt to subscribe
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64ToUint8Array(vapidKey),
        });

        return subscription.toJSON();
    }, [permission]);

    // A helper that combines request and subscribe
    const requestAndSubscribe = useCallback(async () => {
        let currentPermission = permission;
        if (currentPermission !== "granted") {
            currentPermission = await requestPermission();
        }

        if (currentPermission !== "granted") {
            throw new Error("Permission denied");
        }

        return subscribe();
    }, [permission, requestPermission, subscribe]);

    return {
        isLoggedIn: !session.loading && session.doesSessionExist,
        isStandalone,
        permission,
        requestPermission,
        subscribe,
        requestAndSubscribe,
    };
}
