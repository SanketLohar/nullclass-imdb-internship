"use client";

export default function UndoToast({
  onUndo,
  onClose,
}: {
  onUndo: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-4">
      <span>Review deleted</span>

      <button
        onClick={onUndo}
        className="text-yellow-400 font-semibold"
      >
        Undo
      </button>

      <button
        onClick={onClose}
        className="text-zinc-400"
      >
        ✕
      </button>
    </div>
  );
}
