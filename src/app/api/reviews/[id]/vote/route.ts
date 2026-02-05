import { NextRequest, NextResponse } from "next/server";
import { voteReview } from "@/data/reviews/review.repository";
import { z } from "zod";

const voteSchema = z.object({
    type: z.enum(["up", "down"]),
    userId: z.string().min(1),
});

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const result = voteSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        const { type, userId } = result.data;

        const review = await voteReview(
            params.id,
            type,
            userId
        );

        return NextResponse.json(review);
    } catch (error) {
        console.error("Vote error:", error);
        if (error instanceof Error && error.message === "Review not found") {
            return NextResponse.json(
                { error: "Review not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
