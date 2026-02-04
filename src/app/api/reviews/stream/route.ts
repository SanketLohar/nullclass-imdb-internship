import { createReviewStream } from "@/data/reviews/review.stream";
import { NextRequest, NextResponse } from "next/server";

// export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const movieId = Number(searchParams.get("movieId"));

  if (isNaN(movieId)) {
    return NextResponse.json(
      { error: "Missing or invalid movieId parameter" },
      { status: 400 }
    );
  }

  const stream = createReviewStream(movieId);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
