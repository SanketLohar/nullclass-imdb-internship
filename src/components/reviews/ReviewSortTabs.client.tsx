"use client";

export type ReviewSort =
  | "helpful"
  | "recent"
  | "controversial";

export default function ReviewSortTabs({
  value,
  onChange,
}: {
  value: ReviewSort;
  onChange: (v: ReviewSort) => void;
}) {
  const tabs: ReviewSort[] = [
    "helpful",
    "recent",
    "controversial",
  ];

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 rounded-full text-sm capitalize transition ${
            value === tab
              ? "bg-yellow-500 text-black"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
