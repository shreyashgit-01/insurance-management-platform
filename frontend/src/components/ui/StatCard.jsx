function StatCard({
  title,
  value,
  icon,
  color = "#4F46E5",
  subtitle = "",
}) {
  return (
    <div className="stat-card">

      <div>

        <div className="stat-title">
          {title}
        </div>

        <div className="stat-value">
          {value}
        </div>

        {subtitle && (
          <div className="stat-sub">
            {subtitle}
          </div>
        )}

      </div>

      <div
        className="icon-box"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}CC)`,
        }}
      >
        {icon}
      </div>

    </div>
  );
}

export default StatCard;