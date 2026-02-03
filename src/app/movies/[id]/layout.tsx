import { Suspense } from "react";

export default function MovieLayout({
  children,
  overview,
  cast,
  reviews,
  similar,
}: {
  children: React.ReactNode;
  overview: React.ReactNode;
  cast: React.ReactNode;
  reviews: React.ReactNode;
  similar: React.ReactNode;
}) {
  return (
    <>
      {children}
      <main className="container mx-auto px-4 py-16 space-y-24">
        <Suspense>{overview}</Suspense>
        <Suspense>{cast}</Suspense>
        <Suspense>{reviews}</Suspense>
        <Suspense>{similar}</Suspense>
      </main>
    </>
  );
}
