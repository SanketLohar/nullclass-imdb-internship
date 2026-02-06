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
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <OfflineError reset={reset} />
    );
}
