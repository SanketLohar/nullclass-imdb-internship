import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import { Providers } from "./providers";
import { ServiceWorkerRegistration } from "@/components/watchlist/ServiceWorkerRegistration";
import GlobalUI from "@/components/layout/GlobalUI";
import GlobalBackNavigation from "@/components/layout/GlobalBackNavigation";
import { ThemeScript } from "@/components/theme/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 5, // Access requirements usually prohibit blocking zoom, but "mobile view appears zoomed" implies we need control. `initial-scale=1` is key.
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "MovieDB",
  description: "Your ultimate movie database",
};

import { BasicWebVitals } from "./reportWebVitals";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <BasicWebVitals />
          {/* Service Worker Registration */}
          <ServiceWorkerRegistration />

          {/* Global UI (Toasts, etc) */}
          <GlobalUI />

          {/* Global Navigation */}
          <Navbar />
          <GlobalBackNavigation />

          {/* Page Content */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
