import { useEffect } from "react"
import { LoginForm } from "@/components/loginform"
import axios from "axios"

async function askNotificationPermission() {
    const permission = await Notification.requestPermission()

    if (permission === "granted") {
        console.log("✅ User granted notification permission!")
    } else if (permission === "denied") {
        console.log("❌ User denied notification permission.")
    } else {
        console.log("⚠️ User dismissed the permission prompt.")
    }

    return permission
}

async function registerNotificationServiceWorker() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js")
            console.log("✅ Service Worker registered:", registration)
            return registration
        } catch (err) {
            console.error("❌ Service Worker registration failed:", err)
        }
    }
}

async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready

    const response = await fetch("http://localhost:4000/vapid-public-key")
    const vapidPublicKey = await response.text()

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })

    const token = localStorage.getItem("token")

    await fetch("http://localhost:4000/alerts/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
    })

    console.log("✅ Push subscription created:", subscription)
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)))
}

export default function LoginPage() {
    useEffect(() => {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
            alert("Push notifications are not supported by your browser.")
            return
        }

        const initPush = async () => {
            const registration = await registerNotificationServiceWorker()
            if (registration) {
                const permission = await askNotificationPermission()
                if (permission === "granted") {
                    await subscribeToPush()
                }
            }
        }

        initPush()
    }, [])

    const handlePostLogin = async () => {
        const registration = await registerNotificationServiceWorker()
        if (registration) {
            const permission = await askNotificationPermission()
            if (permission === "granted") {
                await subscribeToPush()
            }
        }
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                {/* Pass post-login hook to LoginForm */}
                <LoginForm onLoginSuccess={handlePostLogin} />


                {/* <a
                    href="http://localhost:4000/reports/Device/pdf"
                    download="Device.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Download Device Report (CSV)
                </a> */}
            </div>
        </div>
    )
}
