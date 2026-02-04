"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FilmographyItem } from "@/data/actors.types";
// @ts-ignore
import { FixedSizeGrid } from "react-window";
// @ts-ignore
import { AutoSizer } from "react-virtualized-auto-sizer";
import { motion } from "framer-motion";

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

  return (
    <div className="space-y-6">
      {/* Faceted Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-zinc-900/60 rounded-xl">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Year:</label>
          <select
            value={filters.year || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                year: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
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
          <label className="text-sm text-zinc-400">Role:</label>
          <select
            value={filters.role || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                role: e.target.value || undefined,
              }))
            }
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
          <label className="text-sm text-zinc-400">Genre:</label>
          <select
            value={filters.genre || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                genre: e.target.value || undefined,
              }))
            }
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

        <div className="ml-auto text-sm text-zinc-400">
          Showing {filtered.length} of {filmography.length} films
        </div>
      </div>

      <div className="h-[800px] w-full bg-zinc-900/20 rounded-xl border border-white/5 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No films found matching your filters.
          </div>
        ) : (
          // @ts-ignore
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => {
              // Responsive columns
              let columnCount = 2;
              if (width >= 640) columnCount = 3;
              if (width >= 1024) columnCount = 4;
              if (width >= 1280) columnCount = 5;

              const columnWidth = width / columnCount;
              const rowHeight = columnWidth * 1.5 + 80; // Aspect ratio + padding/text
              const rowCount = Math.ceil(filtered.length / columnCount);

              return (
                <FixedSizeGrid
                  columnCount={columnCount}
                  columnWidth={columnWidth}
                  height={height}
                  rowCount={rowCount}
                  rowHeight={rowHeight}
                  width={width}
                  className="no-scrollbar"
                >
                  {({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: any }) => {
                    const index = rowIndex * columnCount + columnIndex;
                    if (index >= filtered.length) return null;
                    const item = filtered[index];

                    return (
                      <div style={{ ...style, padding: 10 }}>
                        <FilmographyCard item={item} />
                      </div>
                    );
                  }}
                </FixedSizeGrid>
              );
            }}
          </AutoSizer>
        )}
      </div>
    </div>
  );
}

function FilmographyCard({ item }: { item: FilmographyItem }) {
  const [imgSrc, setImgSrc] = useState(item.poster || "/placeholder-movie.jpg");

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group h-full flex flex-col bg-zinc-900 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/50 transition-all"
    >
      {/* Poster Aspect Ratio 2:3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
        <Image
          src={imgSrc}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          loading="lazy"
          onError={() => setImgSrc("/placeholder-movie.jpg")}
        />
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
  );
}
