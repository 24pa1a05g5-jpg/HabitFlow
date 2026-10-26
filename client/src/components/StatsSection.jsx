import { CheckIcon, FireIcon, TrendingUpIcon, TrophyIcon } from "./Icons";

export default function StatsSection({ stats = {} }) {
  const {
    totalHabits = 0,
    completedToday = 0,
    completionRate = 0,
    bestStreak = 0,
    totalCompletions = 0,
    last7Days = [],
  } = stats;

  // Calculate weekly consistency average
  const weeklyAverage =
    last7Days.length > 0
      ? Math.round(
          last7Days.reduce((acc, curr) => acc + (curr.rate || 0), 0) /
            last7Days.length
        )
      : completionRate;

  return (
    <section className="stats-dashboard-container">
      {/* 4 Metric Cards */}
      <div className="stats-metric-grid">
        {/* Card 1: Today's Completion */}
        <div className="metric-card highlight-card">
          <div className="metric-header">
            <div className="metric-icon-wrap emerald">
              <CheckIcon size={20} />
            </div>
            <span className="metric-badge">Today</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{completedToday}</span>
            <span className="metric-denom">/ {totalHabits}</span>
          </div>
          <span className="metric-label">Completed Today ({completionRate}%)</span>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, completionRate)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Best Streak */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-wrap amber">
              <FireIcon size={20} />
            </div>
            <span className="metric-badge">Best</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{bestStreak}</span>
            <span className="metric-denom">{bestStreak === 1 ? "day" : "days"}</span>
          </div>
          <span className="metric-label">Longest Active Streak</span>
          <div className="metric-subtext">
            {bestStreak >= 3 ? "🔥 Momentum unlocked" : "Keep building daily"}
          </div>
        </div>

        {/* Card 3: Weekly Consistency */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-wrap indigo">
              <TrendingUpIcon size={20} />
            </div>
            <span className="metric-badge">7-Day</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{weeklyAverage}%</span>
          </div>
          <span className="metric-label">Weekly Consistency</span>
          <div className="metric-subtext">Rolling 7-day average</div>
        </div>

        {/* Card 4: Total Check-ins */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-wrap violet">
              <TrophyIcon size={20} />
            </div>
            <span className="metric-badge">All-Time</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{totalCompletions}</span>
          </div>
          <span className="metric-label">Lifetime Completions</span>
          <div className="metric-subtext">Total habits checked off</div>
        </div>
      </div>

      {/* 7-Day Activity Spark Chart */}
      {last7Days && last7Days.length > 0 && (
        <div className="weekly-chart-card">
          <div className="chart-header">
            <div>
              <h4 className="chart-title">7-Day Habit Activity</h4>
              <p className="chart-subtitle">Daily completion rates across all habits</p>
            </div>
            <span className="chart-period">Last 7 Days</span>
          </div>

          <div className="chart-bars-wrap">
            {last7Days.map((item, index) => {
              const heightPercent = Math.max(8, item.rate || 0);
              const isToday = index === last7Days.length - 1;
              return (
                <div key={item.date || index} className="chart-bar-col">
                  <div className="chart-bar-tooltip">
                    <span>{item.completedCount}/{item.totalHabits} habits</span>
                    <strong>{item.rate}%</strong>
                  </div>
                  <div className="chart-bar-slot">
                    <div
                      className={`chart-bar-fill ${isToday ? "today-bar" : ""}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`chart-bar-day ${isToday ? "today-label" : ""}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
