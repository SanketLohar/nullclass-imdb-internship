"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface TrailerModalProps {
    videoKey: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function TrailerModal({
    videoKey,
    isOpen,
    onClose,
}: TrailerModalProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // Focus management and Escape key listener
        if (isOpen) {
            // Small timeout to ensure DOM is ready and prevent conflict with trigger click
            const timer = setTimeout(() => {
                closeButtonRef.current?.focus();
            }, 50);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    onClose();
                }
            };

            window.addEventListener("keydown", handleKeyDown);
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
                clearTimeout(timer);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen || !videoKey) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Movie Trailer"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    aria-label="Close trailer"
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                    <X className="w-6 h-6" />
                </button>

                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoKey}?autoplay=0&controls=1&mute=0&playsinline=1&rel=0&modestbranding=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Movie Trailer"
                    loading="eager"
                />
            </div>
        </div>
    );
}
