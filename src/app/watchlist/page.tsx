import WatchlistClient from "@/components/watchlist/WatchlistClient";

export const metadata = {
  title: "My Watchlist",
};

export default function WatchlistPage() {
  return (
    <main className="bg-background min-h-screen text-foreground">
      <WatchlistClient />
    </main>
  );
}
