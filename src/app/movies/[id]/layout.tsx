import { Suspense } from "react";

export default async function MovieLayout({
  children,
  overview,
  cast,
  reviews,
  similar,
  params,
}: {
  children: React.ReactNode;
  overview: React.ReactNode;
  cast: React.ReactNode;
  reviews: React.ReactNode;
  similar: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      {children}
      <main className="container mx-auto px-4 py-8 md:py-16 space-y-12 md:space-y-24">
        <Suspense>{overview}</Suspense>
        <Suspense>{cast}</Suspense>
        <Suspense>{reviews}</Suspense>
        <Suspense key={`similar-${id}`}>{similar}</Suspense>
      </main>
    </>
  );
}
