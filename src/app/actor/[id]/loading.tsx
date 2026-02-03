// Loading state for actor page - optimizes LCP
export default function ActorLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative h-[420px] rounded-xl overflow-hidden mb-12 bg-zinc-900 animate-pulse" />
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="bg-zinc-900/60 rounded-xl p-6 h-48 animate-pulse" />
        <div className="bg-zinc-900/60 rounded-xl p-6 h-48 animate-pulse" />
        <div className="bg-zinc-900/60 rounded-xl p-6 h-48 animate-pulse" />
      </div>
    </div>
  );
}
