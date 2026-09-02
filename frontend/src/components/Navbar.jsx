import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">

        {/* Brand Logo */}
       <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            ✨
          </div>
          <span className="gradient-text">
            Life Hub
          </span>
        </Link>

        {/* Module Nav Links (Only when Authenticated) */}
        {isAuthenticated && (
          <nav>
            <ul className="navbar-links">
              <li>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") || isActive("/") ? "active" : ""}`}
                >
                  🏠 Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/tasks"
                  className={`nav-link ${isActive("/tasks") ? "active" : ""}`}
                >
                  📋 Tasks
                </Link>
              </li>

              <li>
                <Link
                  to="/reminders"
                  className={`nav-link ${isActive("/reminders") ? "active" : ""}`}
                >
                  ⏰ Reminders
                </Link>
              </li>

              <li>
                <Link
                  to="/expenses"
                  className={`nav-link ${isActive("/expenses") ? "active" : ""}`}
                >
                  💰 Expenses
                </Link>
              </li>

              <li>
                <Link
                  to="/subscriptions"
                  className={`nav-link ${isActive("/subscriptions") ? "active" : ""}`}
                >
                  💳 Subscriptions
                </Link>
              </li>

              <li>
                <Link
                  to="/products"
                  className={`nav-link ${isActive("/products") ? "active" : ""}`}
                >
                  📦 Products
                </Link>
              </li>

              <li>
                <Link
                  to="/notes"
                  className={`nav-link ${isActive("/notes") ? "active" : ""}`}
                >
                  📝 Notes
                </Link>
              </li>

              <li>
                <Link
                  to="/habits"
                  className={`nav-link ${isActive("/habits") ? "active" : ""}`}
                >
                  🔥 Habits
                </Link>
              </li>

              <li>
                <Link
                  to="/profile"
                  className={`nav-link ${isActive("/profile") ? "active" : ""}`}
                >
                  👤 Profile
                </Link>
              </li>
            </ul>
          </nav>
        )}

        {/* User Badge & Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-nav-profile">
              <Link to="/profile" className="user-badge-pill" title="View Profile">
                <span className="avatar-circle">
                  {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
                </span>
                <span className="user-name-text">
                  {user?.fullName || user?.email?.split("@")[0] || "User"}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm logout-btn"
                title="Logout of Life Hub"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register Free
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;