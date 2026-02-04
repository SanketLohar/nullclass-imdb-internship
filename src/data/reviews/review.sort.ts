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
/* ----------------------------------
   Helpers
---------------------------------- */
function isControversial(review: Review): boolean {
  // Reported reviews are automatically controversial
  if (review.moderation?.isFlagged) return true;

  const { up, down } = review.votes;
  const total = up + down;
  if (total < 5) return false; // Minimum interaction threshold

  const ratio = up / total;
  // Controversial if split is between 40% and 60%
  return ratio >= 0.4 && ratio <= 0.6;
}

function isHelpful(review: Review): boolean {
  if (isControversial(review)) return false; // Mutually exclusive
  const { up, down } = review.votes;
  return wilsonScore(up, down) > 0.3 && (up + down) > 0;
}

/* ----------------------------------
   Sort Modes
---------------------------------- */
export function sortReviews(
  reviews: Review[],
  mode: "helpful" | "recent" | "controversial",
  currentUserId?: string
): Review[] {
  let filtered = [...reviews];

  switch (mode) {
    case "recent":
      // 1. Sort by date desc
      filtered.sort((a, b) => b.createdAt - a.createdAt);

      // 2. Pin user review to top
      if (currentUserId) {
        const userReviewIndex = filtered.findIndex(r => r.author.id === currentUserId);
        if (userReviewIndex > 0) {
          const [userReview] = filtered.splice(userReviewIndex, 1);
          filtered.unshift(userReview);
        }
      }
      return filtered;

    case "controversial":
      // Must be controversial AND NOT helpful (though helper handles overlap preference)
      // Actually helper says helpful CAN'T be controversial. 
      // Let's enforce: Controversial = isControversial.
      // Helpful = isHelpful (which excludes controversial).
      return filtered
        .filter(r => isControversial(r))
        .sort(
          (a, b) =>
            Math.min(b.votes.up, b.votes.down) -
            Math.min(a.votes.up, a.votes.down)
        );

    case "helpful":
    default:
      return filtered
        .filter(r => isHelpful(r)) // This excludes controversial
        .sort((a, b) => {
          const aScore = wilsonScore(a.votes.up, a.votes.down);
          const bScore = wilsonScore(b.votes.up, b.votes.down);
          return bScore - aScore;
        });
  }
}
