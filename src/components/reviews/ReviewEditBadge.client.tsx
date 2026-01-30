"use client";

export default function ReviewEditBadge({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-zinc-400 hover:text-zinc-200 mt-2"
    >
      Edited · View history
    </button>
  );
}
