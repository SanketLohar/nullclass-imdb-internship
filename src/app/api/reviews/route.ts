// Review API with rate limiting and idempotency
import { NextRequest, NextResponse } from "next/server";
import { reviewSchema } from "@/data/reviews/review.schema";
import { getUserRateLimiter } from "@/lib/rate-limit/token-bucket";
import {
  isKeyProcessed,
  getProcessedResult,
  markKeyProcessed,
} from "@/data/reviews/review.idempotency";
import { createReview } from "@/data/reviews/review.repository";

// export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, idempotencyKey, userId } = body;

    // Check idempotency
    if (idempotencyKey && isKeyProcessed(idempotencyKey)) {
      const cached = getProcessedResult(idempotencyKey);
      return NextResponse.json(cached, {
        headers: {
          "X-Idempotent-Replay": "true",
        },
      });
    }

    // Rate limiting
    if (userId) {
      const limiter = getUserRateLimiter(userId);
      const allowed = await limiter.consume(1);

      if (!allowed) {
        const waitTime = limiter.getWaitTime(1);
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            retryAfter: waitTime,
          },
          {
            status: 429,
            headers: {
              "Retry-After": Math.ceil(waitTime / 1000).toString(),
            },
          }
        );
      }
    }

    // Validate input
    const validated = reviewSchema.parse(input);

    // Create review
    const review = await createReview({
      movieId: validated.movieId,
      author: {
        id: userId || "anonymous",
        username: "User",
      },
      rating: validated.rating,
      content: validated.content,
    });

    // Mark idempotency key as processed
    if (idempotencyKey) {
      markKeyProcessed(idempotencyKey, review);
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
