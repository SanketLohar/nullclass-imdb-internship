"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface ActorCardProps {
    id: number;
    name: string;
    image: string;
    knownFor?: string;
}

export default function ActorCard({ id, name, image, knownFor }: ActorCardProps) {
    const [imgSrc, setImgSrc] = useState(image);

    return (
        <Link
            href={`/actor/${id}`}
            className="group bg-card rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 border border-border"
        >
            <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    onError={() => setImgSrc("/placeholder-actor.jpg")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-yellow-400 transition-colors truncate">
                    {name}
                </h3>
                {knownFor && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        Known for: {knownFor}
                    </p>
                )}
            </div>
        </Link>
    );
}
