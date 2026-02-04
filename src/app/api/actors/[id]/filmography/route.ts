// Filmography API endpoint with filters
import { getActorFilmography } from "@/data/actors/actor.service";
import { NextRequest, NextResponse } from "next/server";

// export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const actorId = Number(id);

  if (isNaN(actorId)) {
    return NextResponse.json({ error: "Invalid actor ID" }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filters = {
    year: searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined,
    role: searchParams.get("role") || undefined,
  };

  const filmography = await getActorFilmography(actorId, filters);

  return NextResponse.json(filmography, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
