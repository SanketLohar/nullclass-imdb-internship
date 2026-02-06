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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                // Only close if clicking directly on the backdrop area, not on the content
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Backdrop visual */}
            <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm -z-10"
                aria-hidden="true"
            />

            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    aria-label="Close trailer"
                    className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                    <X className="w-6 h-6" />
                </button>

                <iframe
                    className="w-full h-full min-w-[300px] min-h-[200px]"
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=1&playsinline=1&rel=0&enablejsapi=1&widget_referrer=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    title="Movie Trailer"
                    frameBorder="0"
                />
            </div>
        </div>
    );
}
