/**
 * Calculate Wilson Score Lower Bound for ranking.
 *
 * z = 1.96 (95% confidence)
 * p̂ = upvotes / (upvotes + downvotes)
 * n = upvotes + downvotes
 *
 * score = (
 *   p̂ + z²/(2n) − z * sqrt((p̂(1−p̂)+z²/(4n))/n)
 * ) / (1+z²/n)
 *
 * If n === 0, score = 0
 *
 * @param up Number of upvotes
 * @param down Number of downvotes
 * @returns Wilson score (0 to 1), rounded to 4 decimals
 */
export function calculateWilsonScore(up: number, down: number): number {
    const n = up + down;

    if (n === 0) {
        return 0;
    }

    // Z-score for 95% confidence
    const z = 1.96;
    const p = up / n;

    const left = p + (z * z) / (2 * n);
    const right = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
    const under = 1 + (z * z) / n;

    const score = (left - right) / under;

    // Round to 4 decimal places
    return Math.round(score * 10000) / 10000;
}
