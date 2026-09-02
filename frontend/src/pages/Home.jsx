import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <span
          className="badge badge-primary pulse"
          style={{ marginBottom: "1rem" }}
        >
          ⚡ All-in-One Life Management Platform
        </span>

        <h1>
          Organize Your Life with <br />
          <span className="gradient-text">Life Hub</span>
        </h1>

        <p className="hero-subtitle">
          Seamlessly manage your daily tasks, track expenses, log habits, and
          write notes—all from one unified, beautifully designed dashboard.
        </p>

        <div className="hero-actions">
          <Link
            to="/login"
            className="btn btn-primary"
            style={{
              padding: "0.9rem 2rem",
              fontSize: "1.05rem",
            }}
          >
            Open Dashboard
          </Link>

          <Link
            to="/register"
            className="btn btn-secondary"
            style={{
              padding: "0.9rem 2rem",
              fontSize: "1.05rem",
            }}
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{ marginTop: "2rem" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "2.5rem",
          }}
        >
          <h2>Everything You Need in One Hub</h2>

          <p>
            Boost your productivity with integrated personal management
            modules.
          </p>
        </div>

        <div className="grid-4">
          {/* Smart Tasks */}
          <div className="glass-card glass-card-interactive">
            <div
              className="dash-card-icon"
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                color: "#6366f1",
              }}
            >
              📋
            </div>

            <h3>Smart Tasks</h3>

            <p style={{ marginTop: "0.5rem" }}>
              Organize, prioritize, and track your daily to-dos with real-time
              status updates and CRUD operations.
            </p>

            <Link
              to="/tasks"
              className="btn btn-secondary btn-sm"
              style={{
                marginTop: "1.25rem",
                width: "100%",
              }}
            >
              Manage Tasks →
            </Link>
          </div>

          {/* Expense Tracker */}
          <div className="glass-card glass-card-interactive">
            <div
              className="dash-card-icon"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              💰
            </div>

            <h3>Expense Tracker</h3>

            <p style={{ marginTop: "0.5rem" }}>
              Monitor daily spending, categorize financial transactions, and
              maintain healthy budget goals.
            </p>

            <Link
              to="/expenses"
              className="btn btn-secondary btn-sm"
              style={{
                marginTop: "1.25rem",
                width: "100%",
              }}
            >
              View Expenses →
            </Link>
          </div>

          {/* Habit Streaks */}
          <div className="glass-card glass-card-interactive">
            <div
              className="dash-card-icon"
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
              }}
            >
              🔥
            </div>

            <h3>Habit Streaks</h3>

            <p style={{ marginTop: "0.5rem" }}>
              Build positive habits with daily streak tracking, reminders, and
              visual consistency metrics.
            </p>

            <Link
              to="/habits"
              className="btn btn-secondary btn-sm"
              style={{
                marginTop: "1.25rem",
                width: "100%",
              }}
            >
              Track Habits →
            </Link>
          </div>

          {/* Quick Notes */}
          <div className="glass-card glass-card-interactive">
            <div
              className="dash-card-icon"
              style={{
                background: "rgba(168, 85, 247, 0.15)",
                color: "#a855f7",
              }}
            >
              📝
            </div>

            <h3>Quick Notes</h3>

            <p style={{ marginTop: "0.5rem" }}>
              Jot down thoughts, ideas, code snippets, and meeting summaries
              with effortless note taking.
            </p>

            <Link
              to="/notes"
              className="btn btn-secondary btn-sm"
              style={{
                marginTop: "1.25rem",
                width: "100%",
              }}
            >
              Open Notes →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;