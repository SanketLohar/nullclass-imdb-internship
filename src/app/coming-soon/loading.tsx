export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="h-10 w-64 bg-muted rounded mb-8 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
                        <div className="aspect-[2/3] bg-muted animate-pulse" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
