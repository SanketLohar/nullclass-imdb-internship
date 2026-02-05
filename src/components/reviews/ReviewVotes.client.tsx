import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/context/auth/auth.context";
import { useRouter } from "next/navigation";

export default function ReviewVotes({
  reviewId,
  up: initialUp,
  down: initialDown,
  userVote: initialUserVote,
}: {
  reviewId: string;
  up: number;
  down: number;
  userVote?: "up" | "down";
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Optimistic state
  const [state, setState] = useState({
    up: initialUp,
    down: initialDown,
    userVote: initialUserVote,
  });

  const handleVote = async (type: "up" | "down") => {
    if (!user) {
      if (confirm("You must be logged in to vote. Go to login?")) {
        router.push("/login?redirect=" + window.location.pathname);
      }
      return;
    }

    // Calculate optimistic state
    const previousState = { ...state };
    const newState = { ...state };

    if (state.userVote === type) {
      // No change (idempotent / no-op on re-vote)
      return;
    } else {
      // Switch or New
      if (state.userVote) {
        // Switch: decrement old, increment new
        newState[state.userVote] = Math.max(0, newState[state.userVote] - 1);
      }
      newState[type] += 1;
      newState.userVote = type;
    }

    setState(newState);

    try {
      // CALL REPOSITORY DIRECTLY (Client-Side) because we rely on IndexedDB
      const { voteReview } = await import("@/data/reviews/review.repository");
      await voteReview(reviewId, type, user.id);

      // Success - no further action needed as events will update UI
    } catch (error) {
      // Rollback
      setState(previousState);
      console.error(error);
      alert("Failed to register vote");
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-white/5 p-1 border border-white/10 dark:bg-black/20">
      <button
        onClick={() => handleVote("up")}
        disabled={isPending}
        title={!user ? "Login to vote" : "Helpful"}
        aria-label="Upvote review"
        aria-pressed={state.userVote === "up"}
        className={`group flex h-8 w-8 items-center justify-center rounded transition-all hover:bg-white/10 ${state.userVote === "up"
            ? "text-yellow-400"
            : "text-zinc-400 hover:text-yellow-400"
          }`}
      >
        <ThumbsUp
          size={16}
          className={`transition-transform group-active:scale-90 ${state.userVote === "up" ? "fill-current" : ""
            }`}
        />
      </button>

      <span
        className={`text-xs font-medium tabular-nums ${state.userVote ? "text-white" : "text-zinc-500"
          }`}
      >
        {state.up - state.down > 0 ? `+${state.up - state.down}` : state.up - state.down}
      </span>

      <button
        onClick={() => handleVote("down")}
        disabled={isPending}
        title={!user ? "Login to vote" : "Not helpful"}
        aria-label="Downvote review"
        aria-pressed={state.userVote === "down"}
        className={`group flex h-8 w-8 items-center justify-center rounded transition-all hover:bg-white/10 ${state.userVote === "down"
            ? "text-red-400"
            : "text-zinc-400 hover:text-red-400"
          }`}
      >
        <ThumbsDown
          size={16}
          className={`transition-transform group-active:scale-90 ${state.userVote === "down" ? "fill-current" : ""
            }`}
        />
      </button>
    </div>
  );
}
