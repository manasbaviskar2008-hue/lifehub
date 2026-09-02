import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email address and password.");
      return;
    }

    const res = await login(email, password);

    if (res.success) {
      setSuccessMsg(
        "Welcome back! Redirecting to your Life Hub dashboard..."
      );

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 600);
    } else {
      setErrorMsg(
        res.error || "Invalid credentials. Please check and try again."
      );
    }
  };

  return (
    <div className="auth-hero-container">
      <div className="auth-hero-grid">

        {/* Left Side: Brand Showcase & Features */}
        <div className="auth-brand-side">
          <div className="auth-brand-badge pulse">
            ✨ Professional Life Management Portal
          </div>

          <h1 className="auth-brand-heading">
            Master your day with <br />
            <span className="gradient-text">Life Hub</span>
          </h1>

          <p className="auth-brand-desc">
            Your single unified dashboard for managing daily tasks, expenses,
            subscriptions, reminders, habit streaks, notes, and product
            warranties.
          </p>

          <div className="auth-features-list">

            <div className="auth-feature-chip">
              <span className="auth-chip-icon">📋</span>
              <div>
                <strong>Smart Tasks</strong>
                <p>Track priorities with real-time status updates</p>
              </div>
            </div>

            <div className="auth-feature-chip">
              <span className="auth-chip-icon">💰</span>
              <div>
                <strong>Expense Tracker</strong>
                <p>Monitor daily spending & monthly budgets</p>
              </div>
            </div>

            <div className="auth-feature-chip">
              <span className="auth-chip-icon">⏰</span>
              <div>
                <strong>Reminders & Alarms</strong>
                <p>Never miss a sync, bill or important deadline</p>
              </div>
            </div>

            <div className="auth-feature-chip">
              <span className="auth-chip-icon">💳</span>
              <div>
                <strong>Subscriptions</strong>
                <p>Auto-calculate recurring monthly bills</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Professional Login Card */}
        <div className="auth-card-side">
          <div className="glass-card auth-card-pro">

            <div className="auth-header">
              <div className="brand-icon auth-logo-icon">
                ✨
              </div>

              <h2>User Authentication</h2>

              <p>
                Enter your credentials to unlock all Life Hub modules
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="auth-alert auth-alert-error">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="auth-alert auth-alert-success">
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* Email Input */}
              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>

                <div className="input-with-icon">
                  <span className="input-icon">📧</span>

                  <input
                    type="email"
                    className="input-field icon-padding"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">

                <div className="form-label-row">
                  <label className="form-label">
                    Password
                  </label>

                  <a
                    href="#forgot"
                    className="forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(
                        "Please contact the administrator to reset your password."
                      );
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>

                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>

                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field icon-padding right-icon-padding"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="auth-remember-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                  />

                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Authenticating...
                  </>
                ) : (
                  "Sign In to Life Hub →"
                )}
              </button>

            </form>

            {/* Registration Redirect */}
            <div className="auth-footer-note">
              <span>Don't have an account yet? </span>

              <Link
                to="/register"
                className="auth-accent-link"
              >
                Register New Account
              </Link>
            </div>

          </div> 
        </div>

      </div>
    </div>
  );
}

export default Login;