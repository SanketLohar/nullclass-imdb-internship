"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TrailerPlayerProps {
  videoKey: string;
  initialPlay?: boolean;
  onClose?: () => void;
}

export default function TrailerPlayer({
  videoKey,
  initialPlay = false,
  onClose,
}: TrailerPlayerProps) {
  const [isOpen, setIsOpen] = useState(initialPlay);
  const router = useRouter();

  useEffect(() => {
    if (initialPlay) {
      setIsOpen(true);
    }
  }, [initialPlay]);

  if (!isOpen || !videoKey) return null;

  const close = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    } else {
      // remove ?play=true from URL
      router.replace(window.location.pathname, { scroll: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    </div>
  );
}
