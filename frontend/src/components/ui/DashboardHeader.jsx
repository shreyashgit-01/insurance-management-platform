function DashboardHeader() {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dashboard-header">

      <div>

        <h2 className="dashboard-greeting">
          👋 {greeting}
        </h2>

        <p className="dashboard-subtitle">
          Welcome back! Here's what's happening with your
          Insurance Management Platform today.
        </p>

      </div>

      <div className="date-card">

        <div className="date-label">
          Today
        </div>

        <div className="date-value">
          {today}
        </div>

      </div>

    </div>
  );
}

export default DashboardHeader;