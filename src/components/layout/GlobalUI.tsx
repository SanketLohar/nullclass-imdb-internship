"use client";

import Toast from "@/components/ui/Toast";
import { useWatchlist } from "@/context/watchlist.context";

export default function GlobalUI() {
  const { toast } = useWatchlist();

  if (!toast) return null;

  return (
    <Toast
      visible={true}
      message={toast.message}
      actionLabel={toast.undo ? "Undo" : undefined}
      onAction={toast.undo}
    />
  );
}
