import { CheckIcon, FireIcon, EditIcon, TrashIcon } from "./Icons";

// Generate last 7 days in local / ISO format
function getLast7Days() {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const weekday = d.toLocaleDateString("en-US", { weekday: "narrow" });
    const shortDay = d.toLocaleDateString("en-US", { weekday: "short" });

    days.push({
      dateStr,
      weekday,
      shortDay,
      dayNumber: d.getDate(),
      isToday: i === 0,
    });
  }

  return days;
}

function calculateStreak(completedDates = []) {
  const dates = new Set(completedDates);
  const today = new Date();
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  let streak = 0;
  const current = new Date(today);

  // If today isn't completed, check if yesterday was completed to preserve active streak
  const todayStr = formatDate(current);
  if (!dates.has(todayStr)) {
    current.setDate(current.getDate() - 1);
  }

  while (dates.has(formatDate(current))) {
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export default function HabitCard({ habit, onToggle, onEdit, onDelete }) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const isCompletedToday = (habit.completedDates || []).includes(todayStr);
  const streak = calculateStreak(habit.completedDates || []);
  const days = getLast7Days();

  const habitColor = habit.color || "#6366f1";
  const category = habit.category || "General";

  // Calculate 7-day completion rate
  const completedInLast7 = days.filter((d) =>
    (habit.completedDates || []).includes(d.dateStr)
  ).length;
  const weeklyRate = Math.round((completedInLast7 / 7) * 100);

  return (
    <article
      className={`habit-card ${isCompletedToday ? "is-completed-today" : ""}`}
      style={{ "--habit-accent": habitColor }}
    >
      <div className="habit-accent-line" />

      <div className="habit-body">
        <div className="habit-left">
          <button
            type="button"
            className={`habit-toggle-btn ${isCompletedToday ? "checked" : ""}`}
            onClick={() => onToggle(habit._id, todayStr)}
            title={
              isCompletedToday
                ? `Mark ${habit.name} incomplete for today`
                : `Mark ${habit.name} complete for today`
            }
            aria-label={
              isCompletedToday
                ? `Mark ${habit.name} incomplete`
                : `Mark ${habit.name} complete`
            }
          >
            {isCompletedToday ? (
              <CheckIcon size={18} />
            ) : (
              <span className="toggle-inner-dot" />
            )}
          </button>

          <div className="habit-content">
            <div className="habit-header-row">
              <h3 className="habit-title">{habit.name}</h3>
              <span className="habit-category-badge">{category}</span>
            </div>

            {habit.description && (
              <p className="habit-description">{habit.description}</p>
            )}

            <div className="habit-badges-row">
              <div className={`streak-badge ${streak > 0 ? "has-streak" : ""}`}>
                <FireIcon size={14} className="streak-icon" />
                <span>
                  {streak} {streak === 1 ? "day streak" : "days streak"}
                </span>
              </div>

              <div className="weekly-rate-badge">
                <span>{completedInLast7}/7 this week</span>
                <span className="rate-num">({weeklyRate}%)</span>
              </div>

              {isCompletedToday && (
                <span className="status-pill-completed">
                  <CheckIcon size={12} /> Done today
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="habit-right">
          {/* 7-Day Strip */}
          <div className="week-matrix-container">
            <div className="week-matrix-label">Recent 7 Days</div>
            <div className="week-matrix-pills">
              {days.map((day) => {
                const isDone = (habit.completedDates || []).includes(day.dateStr);
                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    className={`day-pill ${isDone ? "done" : ""} ${day.isToday ? "today" : ""}`}
                    onClick={() => onToggle(habit._id, day.dateStr)}
                    title={`${day.shortDay}, ${day.dateStr}: ${isDone ? "Completed" : "Incomplete"} (Click to toggle)`}
                    aria-label={`Toggle ${day.shortDay} ${day.dayNumber}`}
                  >
                    <span className="day-name">{day.weekday}</span>
                    <span className="day-circle">
                      {isDone ? <CheckIcon size={11} /> : day.dayNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="habit-card-actions">
            <button
              type="button"
              className="action-icon-btn edit-btn"
              onClick={() => onEdit(habit)}
              title="Edit habit details"
              aria-label="Edit habit"
            >
              <EditIcon size={15} />
            </button>
            <button
              type="button"
              className="action-icon-btn delete-btn"
              onClick={() => onDelete(habit)}
              title="Delete habit"
              aria-label="Delete habit"
            >
              <TrashIcon size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
