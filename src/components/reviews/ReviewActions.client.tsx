"use client";

import { Trash2, Flag, Pencil } from "lucide-react";

export default function ReviewActions({
  onEdit,
  onDelete,
  onReport,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
}) {
  return (
    <div className="flex gap-4 mt-3 text-sm">
      {/* EDIT */}
      <button
        onClick={onEdit}
        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        <Pencil size={14} />
        Edit
      </button>

      {/* REPORT */}
      <button
        onClick={onReport}
        className="text-orange-400 hover:text-orange-300 flex items-center gap-1"
      >
        <Flag size={14} />
        Report
      </button>

      {/* DELETE */}
      <button
        onClick={onDelete}
        className="text-red-400 hover:text-red-300 flex items-center gap-1"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
}
