import type { Review } from "./review.types";

/* ----------------------------------
   Wilson Score (Helpful)
---------------------------------- */
export function wilsonScore(
  up: number,
  down: number
): number {
  const n = up + down;
  if (n === 0) return 0;

  const z = 1.96; // 95% confidence
  const p = up / n;

  return (
    (p +
      z * z / (2 * n) -
      z *
        Math.sqrt(
          (p * (1 - p) + z * z / (4 * n)) /
            n
        )) /
    (1 + z * z / n)
  );
}

/* ----------------------------------
   Sort Modes
---------------------------------- */
export function sortReviews(
  reviews: Review[],
  mode: "helpful" | "recent" | "controversial"
): Review[] {
  const copy = [...reviews];

  switch (mode) {
    case "recent":
      return copy.sort(
        (a, b) => b.createdAt - a.createdAt
      );

    case "controversial":
      return copy.sort(
        (a, b) =>
          Math.min(b.votes.up, b.votes.down) -
          Math.min(a.votes.up, a.votes.down)
      );

    case "helpful":
    default:
      return copy.sort((a, b) => {
        const aScore = wilsonScore(
          a.votes.up,
          a.votes.down
        );
        const bScore = wilsonScore(
          b.votes.up,
          b.votes.down
        );
        return bScore - aScore;
      });
  }
}
