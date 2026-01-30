"use client";

import { useState } from "react";

export default function ReviewEditForm({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        className="w-full bg-zinc-800 p-3 rounded outline-none"
      />

      <div className="flex gap-3">
        <button
          onClick={() => onSave(value)}
          className="bg-yellow-500 text-black px-4 py-1.5 rounded font-semibold"
        >
          Save
        </button>

        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded bg-zinc-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
