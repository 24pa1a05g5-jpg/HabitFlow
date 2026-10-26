import { useEffect } from "react";
import { TrashIcon } from "./Icons";

export default function DeleteConfirmModal({ habit, onConfirm, onCancel, loading }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  if (!habit) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div
        className="modal-card confirm-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="confirm-icon-wrap">
          <TrashIcon size={24} />
        </div>

        <h3 id="delete-dialog-title" className="confirm-title">
          Delete "{habit.name}"?
        </h3>

        <p className="confirm-text">
          This will permanently delete this habit and all associated completion history
          and streaks. This action cannot be undone.
        </p>

        <div className="confirm-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Habit"}
          </button>
        </div>
      </div>
    </div>
  );
}
