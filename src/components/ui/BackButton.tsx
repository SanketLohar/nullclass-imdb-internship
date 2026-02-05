"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BackButton({ className }: { className?: string }) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={cn(
                "h-10 w-10 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:scale-105 active:scale-95 border border-white/10 shadow-sm",
                className
            )}
            aria-label="Go back"
        >
            <ArrowLeft size={20} aria-hidden="true" />
        </button>
    );
}
