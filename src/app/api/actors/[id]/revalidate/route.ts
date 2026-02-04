// On-demand revalidation webhook
import { revalidateActor } from "@/data/actors/actor.service";
import { NextRequest, NextResponse } from "next/server";

// export const runtime = "edge";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actorId = Number(id);

    if (isNaN(actorId)) {
      return NextResponse.json({ error: "Invalid actor ID" }, { status: 400 });
    }

    // Revalidate cache (revalidateTag is not available in edge runtime)
    await revalidateActor(actorId);

    return NextResponse.json({
      revalidated: true,
      actorId,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Revalidation failed", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
