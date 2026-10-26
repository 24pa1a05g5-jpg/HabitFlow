import { useEffect, useState } from "react";
import { CloseIcon, CheckIcon, SparklesIcon } from "./Icons";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#14b8a6", // Teal
];

const PRESET_CATEGORIES = [
  "Health & Wellness",
  "Deep Work & Focus",
  "Mindfulness",
  "Fitness & Exercise",
  "Learning & Growth",
  "Daily Routine",
];

export default function HabitForm({ habit, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    name: habit?.name || "",
    description: habit?.description || "",
    color: habit?.color || PRESET_COLORS[0],
    category: habit?.category || PRESET_CATEGORIES[0],
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter a habit title.");
      return;
    }

    try {
      setLoading(true);
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
        color: form.color,
        category: form.category,
      });
    } catch (err) {
      setError(err.message || "Failed to save habit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal-card modern-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
      >
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">
              {habit ? "UPDATE HABIT" : "NEW ROUTINE"}
            </span>
            <h2 id="modal-heading" className="modal-title">
              {habit ? "Edit Habit Details" : "Create New Habit"}
            </h2>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="habit-dialog-form">
          {/* Habit Name */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="habit-name-input">Habit Title</label>
              <span className="char-count">{form.name.length}/80</span>
            </div>
            <input
              id="habit-name-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Read 25 pages, Morning stretch, Drink 2L water"
              maxLength={80}
              autoFocus
              required
              className="styled-input"
            />
          </div>

          {/* Category Chips */}
          <div className="form-group">
            <label className="group-label">Category</label>
            <div className="category-chips-grid">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip-btn ${
                    form.category === cat ? "selected" : ""
                  }`}
                  onClick={() => setForm((p) => ({ ...p, category: cat }))}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="habit-desc-input">Notes or Target (Optional)</label>
              <span className="char-count">{form.description.length}/200</span>
            </div>
            <textarea
              id="habit-desc-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Why this matters, when you do it, or specific goal..."
              rows={2}
              maxLength={200}
              className="styled-textarea"
            />
          </div>

          {/* Color Palette */}
          <div className="form-group">
            <label className="group-label">Accent Color</label>
            <div className="color-swatches-row">
              {PRESET_COLORS.map((color) => {
                const isSelected = form.color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch-btn ${isSelected ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setForm((p) => ({ ...p, color }))}
                    title={color}
                    aria-label={`Select accent color ${color}`}
                  >
                    {isSelected && <CheckIcon size={14} className="swatch-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="form-group preview-group">
            <span className="group-label">Live Preview</span>
            <div
              className="preview-habit-card"
              style={{ "--preview-color": form.color }}
            >
              <div className="preview-indicator" />
              <div className="preview-body">
                <div className="preview-top">
                  <strong className="preview-name">
                    {form.name.trim() || "Habit Title Preview"}
                  </strong>
                  <span className="preview-cat">{form.category}</span>
                </div>
                <p className="preview-desc">
                  {form.description.trim() || "Add notes or a target description above"}
                </p>
              </div>
            </div>
          </div>

          {error && <div className="form-error-banner">{error}</div>}

          {/* Form Actions */}
          <div className="modal-actions-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              <SparklesIcon size={16} />
              <span>
                {loading
                  ? "Saving..."
                  : habit
                  ? "Save Changes"
                  : "Create Habit"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
