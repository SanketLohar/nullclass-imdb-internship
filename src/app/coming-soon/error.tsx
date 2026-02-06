"use client";

import { useEffect } from "react";
import OfflineError from "@/components/ui/OfflineError";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <OfflineError reset={reset} />
    );
}
