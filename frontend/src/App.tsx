import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Outlet } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import Navbar from "./components/navbar";
import { useEffect } from "react";

export function LayoutWrapper() {
  const { state } = useSidebar();

  return (
    <div
      className="
        flex w-full transition-all
        md:data-[collapsible=collapsed]/pl-0
        md:data-[collapsible=expanded]/pl-64
      "
      data-collapsible={state}
    >
      <AppSidebar />
      <main className="flex-1">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const initPush = async () => {
      const registration = await registerNotificationServiceWorker();

      if (registration) {
        const permission = await askNotificationPermission();
        if (permission === "granted") {
          await subscribeToPush();
        }
      }
    };

    initPush();
  }, []);

  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    alert("Push notifications are not supported by your browser.");
  }

  const handleEnablePush = async () => {
    const permission = await askNotificationPermission();
    if (permission === "granted") {
      await subscribeToPush();
    }
  };

  return (
    <SidebarProvider>
      <LayoutWrapper />
      {/* <div className="fixed bottom-4 right-4">
        <button className="btn" onClick={handleEnablePush}>
          Enable Push Notifications
        </button>
      </div> */}
    </SidebarProvider>
  );
}

async function askNotificationPermission() {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    console.log("User granted notification permission!");
  } else if (permission === "denied") {
    console.log("User denied notification permission.");
  } else {
    console.log("User dismissed the permission prompt.");
  }

  return permission;
}

async function registerNotificationServiceWorker() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (err) {
      console.error("Service Worker registration failed:", err);
    }
  }
}

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const response = await fetch("http://localhost:4000/vapid-public-key");
  const vapidPublicKey = await response.text();

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  await fetch("http://localhost:4000/alerts/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  console.log("Push subscription:", subscription);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}
