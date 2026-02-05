export default function Loading() {
    return (
        <section className="animate-pulse">
            <div className="h-8 w-48 bg-zinc-900 rounded mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-zinc-900 rounded-xl overflow-hidden aspect-[2/3]" />
                ))}
            </div>
        </section>
    );
}
