"use client";

import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-zinc-900 px-6 py-4 shadow-xl flex items-center gap-4"
        >
          <span className="text-white text-sm">
            {message}
          </span>

          {actionLabel && (
            <button
              onClick={onAction}
              className="text-yellow-400 font-semibold hover:underline"
            >
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
