"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type Props = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function Toast({
  visible,
  message,
  actionLabel,
  onAction,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-zinc-900 px-6 py-4 shadow-xl flex items-center gap-4 border border-zinc-800"
        >
          <span className="text-white text-sm whitespace-nowrap">
            {message}
          </span>

          {actionLabel && (
            <button
              onClick={onAction}
              className="text-yellow-400 font-semibold hover:underline text-sm whitespace-nowrap"
            >
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
