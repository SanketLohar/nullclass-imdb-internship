"use client";

import { usePathname } from "next/navigation";
import BackButton from "@/components/ui/BackButton";

export default function GlobalBackNavigation() {
    const pathname = usePathname();

    if (pathname === "/") return null;

    return (
        <div className="fixed top-[72px] left-4 z-50 md:left-8">
            <BackButton />
        </div>
    );
}
