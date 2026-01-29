"use client";

import { WatchlistProvider } from "@/lib/watchlist.context";
import GlobalUI from "@/components/layout/GlobalUI";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WatchlistProvider>
      {children}
      <GlobalUI />
    </WatchlistProvider>
  );
}
