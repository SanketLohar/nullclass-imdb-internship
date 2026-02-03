// Actor API route with edge runtime and revalidation
import { getActorById, revalidateActor, getRevalidationTag } from "@/data/actors/actor.service";
import { NextRequest, NextResponse } from "next/server";
import { checkAPIPolicy } from "@/lib/security/api-policy";
import { getLocaleFromHeaders, getActorName, getActorBiography } from "@/lib/i18n/actor-i18n";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// ISR with on-demand revalidation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Security policy check
  const policyCheck = checkAPIPolicy(request, {
    maxRequestsPerMinute: 60,
    requireAuth: false,
  });

  if (!policyCheck.allowed) {
    return NextResponse.json(
      { error: policyCheck.reason || "Request not allowed" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const actorId = Number(id);

  if (isNaN(actorId)) {
    return NextResponse.json({ error: "Invalid actor ID" }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const revalidate = searchParams.get("revalidate") === "true";

  if (revalidate) {
    await revalidateActor(actorId);
  }

  const actor = await getActorById(actorId, {
    revalidate: revalidate ? false : undefined,
  });

  if (!actor) {
    return NextResponse.json({ error: "Actor not found" }, { status: 404 });
  }

  // Apply i18n
  const locale = getLocaleFromHeaders(request.headers);
  const localizedActor = {
    ...actor,
    name: getActorName(actor, locale),
    biography: getActorBiography(actor, locale),
  };

  const response = NextResponse.json(localizedActor, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "CDN-Cache-Control": "public, s-maxage=3600",
      "Vercel-CDN-Cache-Control": "public, s-maxage=3600",
      "X-Revalidation-Tag": getRevalidationTag(actorId),
      "Content-Language": locale,
    },
  });

  return response;
}

// On-demand revalidation endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const actorId = Number(id);

  if (isNaN(actorId)) {
    return NextResponse.json({ error: "Invalid actor ID" }, { status: 400 });
  }

  await revalidateActor(actorId);

  return NextResponse.json({ revalidated: true, actorId });
}
