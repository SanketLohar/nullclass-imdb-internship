import MovieCard from "@/components/movies/MovieCard.client";

export default function TestPage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">
        MovieCard Test
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MovieCard
          id="123"
          title="The Batman"
          posterUrl="https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg"
          rating={7.8}
          releaseYear={2022}
          genres={["Action", "Crime", "Drama"]}
        />

        <MovieCard
          id="456"
          title="Interstellar"
          posterUrl="https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
          rating={8.6}
          releaseYear={2014}
          genres={["Sci-Fi", "Drama"]}
        />
      </div>
    </main>
  );
}
