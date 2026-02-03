"use client";

import { useEffect } from "react";

export default function UndoToast({
  onUndo,
  onClose,
}: {
  onUndo: () => void;
  onClose: () => void;
}) {
  // Auto-close after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-4 z-50">
      <span>Review deleted</span>

      <button
        onClick={onUndo}
        className="text-yellow-400 font-semibold hover:text-yellow-300 transition-colors"
      >
        Undo
      </button>

      <button
        onClick={onClose}
        className="text-zinc-400 hover:text-zinc-300 transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
