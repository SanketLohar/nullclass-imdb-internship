import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import { Providers } from "./providers";
import { ServiceWorkerRegistration } from "@/components/watchlist/ServiceWorkerRegistration";
import GlobalUI from "@/components/layout/GlobalUI";
import GlobalBackNavigation from "@/components/layout/GlobalBackNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MovieDB",
  description: "Your ultimate movie database",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
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
