"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor, Contrast } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Order: Light -> Dark -> Auto -> High Contrast -> Light
  const themes: Array<{ value: "light" | "dark" | "auto" | "high-contrast"; icon: React.ReactNode; label: string }> = [
    { value: "light", icon: <Sun className="w-4 h-4" aria-hidden="true" />, label: "Light" },
    { value: "dark", icon: <Moon className="w-4 h-4" aria-hidden="true" />, label: "Dark" },
    { value: "auto", icon: <Monitor className="w-4 h-4" aria-hidden="true" />, label: "Auto" },
    { value: "high-contrast", icon: <Contrast className="w-4 h-4" aria-hidden="true" />, label: "High Contrast" },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={cycleTheme}
        className="flex items-center gap-2 px-3 py-2 bg-bg-secondary hover:bg-bg-secondary/80 text-foreground rounded-lg transition-colors border border-border hover:border-text-secondary/50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Switch theme"
        title="Switch theme"
      >
        <div className="relative w-4 h-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTheme.value}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {currentTheme.icon}
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="text-sm font-medium min-w-[60px] text-left hidden sm:block">
          {currentTheme.label}
        </span>
      </motion.button>
    </div>
  );
}
