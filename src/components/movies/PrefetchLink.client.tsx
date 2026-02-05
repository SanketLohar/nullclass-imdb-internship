"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface PrefetchLinkProps extends Omit<React.ComponentProps<typeof Link>, "href"> {
    movieId: string | number;
    children: React.ReactNode;
}

export default function PrefetchLink({
    movieId,
    children,
    ...props
}: PrefetchLinkProps) {
    const router = useRouter();
    const hasPrefetched = useRef(false);

    const handlePointerEnter = (e: React.PointerEvent<HTMLAnchorElement>) => {
        // Skip if touch device or already prefetched
        if (e.pointerType === "touch" || hasPrefetched.current) return;

        router.prefetch(`/movies/${movieId}`);
        hasPrefetched.current = true;

        // Call original handler if it exists
        if (props.onPointerEnter) {
            props.onPointerEnter(e);
        }
    };

    return (
        <Link
            href={`/movies/${movieId}`}
            onPointerEnter={handlePointerEnter}
            {...props}
        >
            {children}
        </Link>
    );
}
