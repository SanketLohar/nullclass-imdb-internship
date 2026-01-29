import WatchlistClient from "@/components/watchlist/WatchlistClient";

export const metadata = {
  title: "My Watchlist",
};

export default function WatchlistPage() {
  return (
    <main className="bg-black min-h-screen text-white">
      <WatchlistClient />
    </main>
  );
}
