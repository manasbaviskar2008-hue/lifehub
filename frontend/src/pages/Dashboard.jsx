import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const SUBSCRIPTION_API =
   `${import.meta.env.VITE_API_URL}/subscriptions`  

  const EXPENSE_API =
   `${import.meta.env.VITE_API_URL}/expenses`
  const [budget, setBudget] = useState(() => {
    const savedBudget =
      localStorage.getItem("lifehub_expense_budget");

    return savedBudget
      ? Number(savedBudget)
      : 10000;
  });

  const [subscriptions, setSubscriptions] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  const [reminders, setReminders] =
    useState([]);

  // -----------------------------
  // LOAD DASHBOARD DATA
  // -----------------------------

  useEffect(() => {
    loadDashboardData();

    // Listen for budget changes
    const handleBudgetChange = () => {
      const savedBudget =
        localStorage.getItem("lifehub_expense_budget");

      if (savedBudget !== null) {
        setBudget(Number(savedBudget));
      }
    };

    window.addEventListener(
      "expenseBudgetUpdated",
      handleBudgetChange
    );

    return () => {
      window.removeEventListener(
        "expenseBudgetUpdated",
        handleBudgetChange
      );
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userEmail = user?.email?.toLowerCase()?.trim() || "";

  const loadDashboardData = async () => {
    const authHeader = userEmail ? { headers: { "X-User-Email": userEmail } } : {};

    // Budget
    const savedBudget =
      localStorage.getItem(`lifehub_budget_${userEmail}`) ||
      localStorage.getItem("lifehub_budget");

    if (savedBudget) {
      setBudget(Number(savedBudget));
    }

    // Subscriptions
    try {
      const response = await axios.get(SUBSCRIPTION_API, authHeader);
      setSubscriptions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const savedSubscriptions = localStorage.getItem(`lifehub_subscriptions_data_${userEmail}`);
      if (savedSubscriptions) {
        try {
          setSubscriptions(JSON.parse(savedSubscriptions));
        } catch (e) {
          setSubscriptions([]);
        }
      } else {
        setSubscriptions([]);
      }
    }

    // Expenses
    try {
      const response = await axios.get(EXPENSE_API, authHeader);
      setExpenses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const savedExpenses = localStorage.getItem(`lifehub_expenses_data_${userEmail}`);
      if (savedExpenses) {
        try {
          setExpenses(JSON.parse(savedExpenses));
        } catch (e) {
          setExpenses([]);
        }
      } else {
        setExpenses([]);
      }
    }

    // Tasks
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`, authHeader);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const savedTasks = localStorage.getItem(`lifehub_tasks_data_${userEmail}`);
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (e) {
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
    }

    // Reminders
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/reminders`, authHeader);
      setReminders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const savedReminders = localStorage.getItem(`lifehub_reminders_data_${userEmail}`);
      if (savedReminders) {
        try {
          setReminders(JSON.parse(savedReminders));
        } catch (e) {
          setReminders([]);
        }
      } else {
        setReminders([]);
      }
    }
  };

  // -----------------------------
  // SUBSCRIPTION CALCULATION
  // -----------------------------

  const activeSubscriptions =
    subscriptions.filter(
      (sub) => sub.status === "Active"
    );

  const getMonthlyEquivalent = (sub) => {
    const price =
      Number(sub.price) || 0;

    if (sub.billingCycle === "Yearly") {
      return price / 12;
    }

    if (sub.billingCycle === "Weekly") {
      return price * 4.33;
    }

    return price;
  };

  const monthlySubscriptionTotal =
    activeSubscriptions.reduce(
      (total, sub) =>
        total +
        getMonthlyEquivalent(sub),
      0
    );

  // -----------------------------
  // EXPENSE CALCULATION
  // -----------------------------

  const totalExpenses =
    expenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0
    );

  const remainingBudget =
    budget - totalExpenses;

  // -----------------------------
  // TASK CALCULATION
  // -----------------------------

  const activeTasks =
    tasks.filter(
      (task) =>
        task.status !== "Completed"
    );

  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status === "Pending"
    );

  // -----------------------------
  // REMINDER CALCULATION
  // -----------------------------

  const activeReminders =
    reminders.filter(
      (reminder) =>
        reminder.status !== "Completed"
    );

  // -----------------------------
  // RENDER
  // -----------------------------

  return (
    <div>
      {/* Welcome Header */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "2rem",
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)",
        }}
      >
        <div>
          <span
            className="badge badge-primary"
            style={{
              marginBottom: "0.5rem",
            }}
          >
            Overview Dashboard
          </span>

          <h2>
            Welcome back,{" "}
            <span className="gradient-text">
              {user?.fullName || user?.email?.split("@")[0] || "User"}
            </span>{" "}
            👋
          </h2>

          <p>
            Here is a summary of your personal
            hub and daily activities.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/subscriptions"
            className="btn btn-primary"
          >
            + Subscription
          </Link>

          <Link
            to="/reminders"
            className="btn btn-secondary"
          >
            + Reminder
          </Link>

          <Link
            to="/tasks"
            className="btn btn-secondary"
          >
            + Task
          </Link>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div
        className="grid-4"
        style={{
          marginBottom: "2.5rem",
        }}
      >
        {/* Tasks */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Active Tasks
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              📋
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            {activeTasks.length}
          </h3>

          <span
            className="badge badge-pending"
            style={{
              marginTop: "0.5rem",
            }}
          >
            {pendingTasks.length} Pending
          </span>
        </div>

        {/* Reminders */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Reminders
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              ⏰
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            {activeReminders.length}
          </h3>

          <span
            className="badge badge-pending"
            style={{
              marginTop: "0.5rem",
            }}
          >
            Active Reminders
          </span>
        </div>

        {/* Subscriptions */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Subscriptions
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              💳
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            ₹
            {monthlySubscriptionTotal.toFixed(
              2
            )}
          </h3>

          <span
            className="badge badge-primary"
            style={{
              marginTop: "0.5rem",
            }}
          >
            {activeSubscriptions.length} Active
            Services
          </span>
        </div>

        {/* Expenses */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Monthly Expenses
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              💰
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            ₹{totalExpenses.toFixed(2)}
          </h3>

          <span
            className={
              remainingBudget >= 0
                ? "badge badge-completed"
                : "badge badge-pending"
            }
            style={{
              marginTop: "0.5rem",
            }}
          >
            {remainingBudget >= 0
              ? `₹${remainingBudget.toFixed(
                  2
                )} Remaining`
              : `₹${Math.abs(
                  remainingBudget
                ).toFixed(
                  2
                )} Over Budget`}
          </span>
        </div>
      </div>

      {/* Main Navigation Modules Grid */}
      <h3
        style={{
          marginBottom: "1.25rem",
        }}
      >
        Life Hub Modules
      </h3>
{/* Products */}
<Link
  to="/products"
  style={{
    textDecoration: "none",
  }}
>
  <div className="glass-card glass-card-interactive dash-card">

    <div
      className="dash-card-icon"
      style={{
        background:
          "rgba(245, 158, 11, 0.15)",
        color: "#f59e0b",
      }}
    >
      📦
    </div>

    <div>
      <h4 className="dash-card-title">
        Product Manager
      </h4>

      <p className="dash-card-desc">
        Track products, purchases, warranty
        dates, and important product details.
      </p>
    </div>

    <div
      style={{
        marginTop: "1rem",
        color: "#f59e0b",
        fontWeight: 700,
        fontSize: "0.9rem",
      }}
    >
      Manage Products →
    </div>

  </div>
</Link>
      <div className="grid-3">
        {/* Tasks */}
        <Link
          to="/tasks"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="glass-card glass-card-interactive dash-card">
            <div
              className="dash-card-icon"
              style={{
                background:
                  "rgba(99, 102, 241, 0.15)",
                color: "#6366f1",
              }}
            >
              📋
            </div>

            <div>
              <h4 className="dash-card-title">
                Tasks Management
              </h4>

              <p className="dash-card-desc">
                Create, track, and complete your
                daily work and personal goals.
              </p>
            </div>

            <div
              style={{
                marginTop: "1rem",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              Open Tasks →
            </div>
          </div>
        </Link>

        {/* Subscriptions */}
        <Link
          to="/subscriptions"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="glass-card glass-card-interactive dash-card">
            <div
              className="dash-card-icon"
              style={{
                background:
                  "rgba(14, 165, 233, 0.15)",
                color: "#0ea5e9",
              }}
            >
              💳
            </div>

            <div>
              <h4 className="dash-card-title">
                Subscription Manager
              </h4>

              <p className="dash-card-desc">
                Track recurring OTT, SaaS,
                course, gym, and cloud service
                bills.
              </p>
            </div>

            <div
              style={{
                marginTop: "1rem",
                color: "#0ea5e9",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              Manage Subscriptions →
            </div>
          </div>
        </Link>

        {/* Reminders */}
        <Link
          to="/reminders"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="glass-card glass-card-interactive dash-card">
            <div
              className="dash-card-icon"
              style={{
                background:
                  "rgba(236, 72, 153, 0.15)",
                color: "#ec4899",
              }}
            >
              ⏰
            </div>

            <div>
              <h4 className="dash-card-title">
                Reminder Center
              </h4>

              <p className="dash-card-desc">
                Set alerts, track schedule
                deadlines, and manage time
                reminders.
              </p>
            </div>

            <div
              style={{
                marginTop: "1rem",
                color: "#ec4899",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              View Reminders →
            </div>
          </div>
        </Link>

        {/* Expenses */}
        <Link
          to="/expenses"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="glass-card glass-card-interactive dash-card">
            <div
              className="dash-card-icon"
              style={{
                background:
                  "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              💰
            </div>

            <div>
              <h4 className="dash-card-title">
                Expense Tracker
              </h4>

              <p className="dash-card-desc">
                Track incomes, categorize daily
                expenses, and analyze spending.
              </p>
            </div>

            <div
              style={{
                marginTop: "1rem",
                color: "var(--success)",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              View Expenses →
            </div>
          </div>
        </Link>

        {/* Notes */}
        <Link
          to="/notes"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="glass-card glass-card-interactive dash-card">
            <div
              className="dash-card-icon"
              style={{
                background:
                  "rgba(168, 85, 247, 0.15)",
                color: "#a855f7",
              }}
            >
              📝
            </div>

            <div>
              <h4 className="dash-card-title">
                Notes & Ideas
              </h4>

              <p className="dash-card-desc">
                Keep quick thoughts, checklists,
                meeting notes, and snippets.
              </p>
            </div>

            <div
              style={{
                marginTop: "1rem",
                color: "#a855f7",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              Access Notes →
            </div>
          </div>
        </Link>

        {/* Habits */}
        <Link
          to="/habits"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="glass-card glass-card-interactive dash-card">
            <div
              className="dash-card-icon"
              style={{
                background:
                  "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
              }}
            >
              🔥
            </div>

            <div>
              <h4 className="dash-card-title">
                Habit Tracker
              </h4>

              <p className="dash-card-desc">
                Maintain consistency and build
                habits with daily streak tracking.
              </p>
            </div>

            <div
              style={{
                marginTop: "1rem",
                color: "var(--warning)",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              Track Habits →
            </div>
          </div>
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="glass-card glass-card-interactive dash-card">
            <div
              className="dash-card-icon"
              style={{
                background:
                  "rgba(59, 130, 246, 0.15)",
                color: "#3b82f6",
              }}
            >
              👤
            </div>

            <div>
              <h4 className="dash-card-title">
                User Profile
              </h4>

              <p className="dash-card-desc">
                Manage account information,
                preferences, and security settings.
              </p>
            </div>

            <div
              style={{
                marginTop: "1rem",
                color: "var(--info)",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              View Profile →
            </div>
          </div>
        </Link>

        {/* Logout */}
        <Link
          to="/login"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="glass-card glass-card-interactive dash-card">
            <div
              className="dash-card-icon"
              style={{
                background:
                  "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
              }}
            >
              🚪
            </div>

            <div>
              <h4 className="dash-card-title">
                Account Session
              </h4>

              <p className="dash-card-desc">
                Sign out or switch user account
                securely.
              </p>
            </div>

            <div
              style={{
                marginTop: "1rem",
                color: "var(--danger)",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              Logout →
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;