import { Suspense } from "react";
import MoviesClient from "./MoviesClient";

export default function MoviesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-zinc-400">Loading movies...</p>
        </div>
      </div>
    }>
      <MoviesClient />
    </Suspense>
  );
}
