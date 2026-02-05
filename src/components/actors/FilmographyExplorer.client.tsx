"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PrefetchLink from "@/components/movies/PrefetchLink.client";
import { FilmographyItem } from "@/data/actors.types";
import { motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";

interface FilmographyExplorerProps {
  filmography: FilmographyItem[];
}

interface FilmographyExplorerProps {
  filmography: FilmographyItem[];
}

export default function FilmographyExplorer({
  filmography,
}: FilmographyExplorerProps) {
  const [filters, setFilters] = useState<{
    year?: number;
    role?: string;
    genre?: string;
  }>({});

  const parentRef = useRef<HTMLDivElement>(null);

  // Extract unique years, roles, and genres for filters
  const { years, roles, genres } = useMemo(() => {
    const yearSet = new Set(filmography.map((item) => item.year));
    const roleSet = new Set(filmography.map((item) => item.role));
    const genreSet = new Set(
      filmography.map((item) => item.genre).filter((g): g is string => !!g)
    );
    return {
      years: Array.from(yearSet).sort((a, b) => b - a),
      roles: Array.from(roleSet),
      genres: Array.from(genreSet).sort(),
    };
  }, [filmography]);

  // Filter filmography
  const filtered = useMemo(() => {
    return filmography.filter((item) => {
      if (filters.year && item.year !== filters.year) return false;
      if (filters.role && item.role !== filters.role) return false;
      if (filters.genre && item.genre !== filters.genre) return false;
      return true;
    });
  }, [filmography, filters]);

  // Responsive Column Counter
  const [columns, setColumns] = useState(2);
  useEffect(() => {
    const updateColumns = () => {
      // Logic adjusted to match Tailwind grid-cols breakpoints
      // grid-cols-2 (<640px)
      // sm:grid-cols-3 (>=640px)
      // lg:grid-cols-4 (>=1024px)
      // xl:grid-cols-5 (>=1280px)
      const w = window.innerWidth;
      if (w >= 1280) setColumns(5);
      else if (w >= 1024) setColumns(4);
      else if (w >= 640) setColumns(3);
      else setColumns(2);
    };

    // Initial call
    updateColumns();

    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Virtualizer
  const rowCount = Math.ceil(filtered.length / columns);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Approximate card height + gap
    overscan: 3,
  });

  // Reset scroll on filter change
  useEffect(() => {
    rowVirtualizer.scrollToOffset(0);
  }, [filters, columns, rowVirtualizer]);

  return (
    <div className="space-y-6">
      {/* Faceted Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-zinc-900/90 rounded-xl">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-300">Year:</label>
          <select
            value={filters.year || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                year: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            aria-label="Filter by Year"
            className="bg-zinc-800 text-white px-3 py-1 rounded-md text-sm"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-300">Role:</label>
          <select
            value={filters.role || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                role: e.target.value || undefined,
              }))
            }
            aria-label="Filter by Role"
            className="bg-zinc-800 text-white px-3 py-1 rounded-md text-sm"
          >
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-300">Genre:</label>
          <select
            value={filters.genre || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                genre: e.target.value || undefined,
              }))
            }
            aria-label="Filter by Genre"
            className="bg-zinc-800 text-white px-3 py-1 rounded-md text-sm"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {(filters.year || filters.role || filters.genre) && (
          <button
            onClick={() => setFilters({})}
            className="text-sm text-yellow-400 hover:text-yellow-300"
          >
            Clear Filters
          </button>
        )}

        <div className="ml-auto text-sm text-zinc-300">
          Showing {filtered.length} of {filmography.length} films
        </div>
      </div>

      {/* Virtualized Grid Container */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-zinc-900/20 rounded-xl border border-white/5">
          No films found matching your filters.
        </div>
      ) : (
        <div
          ref={parentRef}
          // Height fixed at 70vh to ensure the list remains scrollable within the viewport 
          // without pushing critical UI (like filters) off-screen on smaller devices.
          className="h-[70vh] min-h-[500px] overflow-y-auto w-full rounded-xl pr-2"
          style={{ contain: "strict" }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const rowStart = virtualRow.index * columns;
              const rowItems = filtered.slice(rowStart, rowStart + columns);

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                  {rowItems.map((item) => (
                    <FilmographyCard
                      key={`${item.id}-${item.role}-${item.year}`}
                      item={item}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FilmographyCard({ item }: { item: FilmographyItem }) {
  const [imgSrc, setImgSrc] = useState(item.poster || "/placeholder-movie.jpg");

  return (
    <PrefetchLink movieId={item.id} className="block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-xl">
      <motion.div
        whileHover={{ y: -5 }}
        className="group h-full flex flex-col bg-zinc-900 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/50 transition-all"
      >
        {/* Poster Aspect Ratio 2:3 */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
          {!imgSrc || imgSrc.includes("placeholder") ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-800 text-center">
              <span className="text-3xl mb-2 opacity-20">🎬</span>
              <span className="text-xs text-zinc-500 font-medium line-clamp-3 uppercase tracking-wider">
                {item.title}
              </span>
            </div>
          ) : (
            <Image
              src={imgSrc}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              loading="lazy"
              onError={() => setImgSrc("")}
            />
          )}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-yellow-500 flex items-center gap-1">
            <span>★</span> {item.rating ? item.rating.toFixed(1) : "N/A"}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1 gap-1">
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-white group-hover:text-yellow-400 transition-colors">
            {item.title}
          </h3>

          <div className="mt-auto pt-2 space-y-1">
            <p className="text-xs text-zinc-400 truncate">
              {item.role || "Actor"}
            </p>
            <p className="text-xs text-zinc-500">
              {item.year > 0 ? item.year : "Unknown"}
            </p>
          </div>
        </div>
      </motion.div>
    </PrefetchLink>
  );
}
