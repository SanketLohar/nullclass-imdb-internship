"use client";

import { useReportWebVitals } from "next/web-vitals";

export function BasicWebVitals() {
    useReportWebVitals((metric) => {
        // In a real app, send to analytics service
        if (process.env.NODE_ENV === 'development') {
            console.log(metric);
        }

        // Log specifics as requested
        if (["LCP", "CLS", "INP"].includes(metric.name)) {
            console.debug(`[Telemetry] ${metric.name}: ${metric.value.toFixed(2)}`, metric);
        }
    });
    return null;
}
