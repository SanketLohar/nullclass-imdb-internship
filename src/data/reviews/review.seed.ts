import type { Review } from "./review.types";
import { nanoid } from "nanoid";

export function getSeededReviews(movieId: number): Review[] {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    return [
        // 1. RECENT: Neutral, Just posted
        {
            id: `seed-recent-${movieId}`,
            movieId,
            author: {
                id: "seed-user-1",
                username: "Alex Morgan",
                name: "Alex Morgan"
            },
            rating: 7,
            content: "Just finished watching this. Visuals were stunning but the pacing felt a bit off in the second half. Still worth a watch!",
            votes: { up: 2, down: 0, userVotes: {} },
            score: 1.0,
            moderation: {
                isFlagged: false,
                flagsCount: 0,
                reasons: [],
            },
            createdAt: now - (5 * 60 * 1000), // 5 mins ago
            updatedAt: null,
            deletedAt: null,
            revisions: [],
            isSeeded: true
        } as Review,

        // 2. HELPFUL: High rating, High upvotes, Older
        {
            id: `seed-helpful-${movieId}`,
            movieId,
            author: {
                id: "seed-user-2",
                username: "Priya Sharma",
                name: "Priya Sharma"
            },
            rating: 9,
            content: "An absolute masterpiece. The director managed to weave complex themes into a compelling narrative without it feeling forced. The cinematography is some of the best I've seen in years. Truly a cinematic experience that stays with you.",
            votes: { up: 145, down: 3, userVotes: {} },
            score: 0.98,
            moderation: {
                isFlagged: false,
                flagsCount: 0,
                reasons: [],
            },
            createdAt: now - (15 * DAY), // 15 days ago
            updatedAt: null,
            deletedAt: null,
            revisions: [],
            isSeeded: true
        } as Review,

        // 3. CONTROVERSIAL: Mixed votes, Polarizing
        {
            id: `seed-controversial-${movieId}`,
            movieId,
            author: {
                id: "seed-user-3",
                username: "Daniel Cooper",
                name: "Daniel Cooper"
            },
            rating: 3,
            content: "I don't get the hype. The plot was predictable and the characters felt flat. It seems like style over substance to me. Maybe I missed something, but I was bored throughout.",
            votes: { up: 42, down: 38, userVotes: {} },
            score: 0.52,
            moderation: {
                isFlagged: false,
                flagsCount: 0,
                reasons: [],
            },
            createdAt: now - (2 * DAY), // 2 days ago
            updatedAt: null,
            deletedAt: null,
            revisions: [],
            isSeeded: true
        } as Review,
    ];
}
