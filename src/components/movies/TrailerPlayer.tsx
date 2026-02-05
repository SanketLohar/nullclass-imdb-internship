"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import TrailerModal from "@/components/trailer/TrailerModal.client";

interface TrailerPlayerProps {
  videoKey: string;
  initialPlay?: boolean;
}

export default function TrailerPlayer({
  videoKey,
  initialPlay = false,
}: TrailerPlayerProps) {
  const [isOpen, setIsOpen] = useState(initialPlay);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(initialPlay);
  }, [initialPlay]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove query param without simpler reload if possible, or just replace
    // Using window.history to avoid server roundtrip if possible, 
    // but next/navigation router.replace is safer for Next.js app text context
    router.replace(pathname, { scroll: false });
  };

  return (
    <TrailerModal
      videoKey={videoKey}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}
