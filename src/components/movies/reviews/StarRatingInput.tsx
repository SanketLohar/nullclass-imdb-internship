"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function StarRatingInput({
  value,
  onChange,
}: Props) {
  return (
    <div className="flex gap-1 text-2xl text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;

        return (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${starValue} stars`}
            onClick={() => onChange(starValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onChange(starValue);
              }
            }}
            className="hover:scale-110 transition focus:outline-none"
          >
            {value >= starValue ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
