export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="h-10 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
                        <div className="aspect-[2/3] bg-muted animate-pulse" />
                        <div className="p-4 space-y-2">
                            <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
