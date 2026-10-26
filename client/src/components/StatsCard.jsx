export default function StatsCard({ label, value, icon, subtext }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon-wrap indigo">{icon}</div>
      </div>
      <div className="metric-value-row">
        <span className="metric-number">{value}</span>
      </div>
      <span className="metric-label">{label}</span>
      {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
  );
}
