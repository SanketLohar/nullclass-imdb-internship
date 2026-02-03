"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/watchlist/service-worker";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker().catch((error) => {
      console.error("Service worker registration error:", error);
    });
  }, []);

  return null; // This component doesn't render anything
}
