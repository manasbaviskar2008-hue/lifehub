import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    const res = await register(formData);
    if (res.success) {
      setSuccessMsg("Account created successfully! Logging you in...");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 800);
    } else {
      setErrorMsg(res.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-hero-container">
      <div className="auth-hero-grid">

        {/* Left Side: Brand Showcase */}
        <div className="auth-brand-side">
          <div className="auth-brand-badge pulse">
            🚀 Join Life Hub Platform
          </div>
          
          <h1 className="auth-brand-heading">
            Create Your <br />
            <span className="gradient-text">Free Account</span>
          </h1>

          <p className="auth-brand-desc">
            Get instant access to all Life Hub modules. Organize your productivity, finances, habits, notes, and reminders seamlessly.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-chip">
              <span className="auth-chip-icon">⚡</span>
              <div>
                <strong>Instant Setup</strong>
                <p>No credit card required. Get started in under 30 seconds.</p>
              </div>
            </div>

            <div className="auth-feature-chip">
              <span className="auth-chip-icon">🔒</span>
              <div>
                <strong>Secure & Private</strong>
                <p>Your habits, notes, and financial data are safely protected.</p>
              </div>
            </div>

            <div className="auth-feature-chip">
              <span className="auth-chip-icon">📱</span>
              <div>
                <strong>Fully Responsive</strong>
                <p>Access your Life Hub seamlessly on desktop, tablet, or phone.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Professional Registration Form */}
        <div className="auth-card-side">
          <div className="glass-card auth-card-pro">

            <div className="auth-header">
              <div className="brand-icon auth-logo-icon">
                🚀
              </div>
              <h2>Create Account</h2>
              <p>Fill out the details below to register your account</p>
            </div>

            {errorMsg && (
              <div className="auth-alert auth-alert-error">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="auth-alert auth-alert-success">
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleRegister}>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="fullName"
                    className="input-field icon-padding"
                    placeholder="e.g. Manas Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div className="input-with-icon">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    className="input-field icon-padding"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <div className="input-with-icon">
                  <span className="input-icon">📞</span>
                  <input
                    type="text"
                    name="phone"
                    className="input-field icon-padding"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field icon-padding right-icon-padding"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔑</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field icon-padding"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span> Creating Account...
                  </>
                ) : (
                  "Complete Registration →"
                )}
              </button>

            </form>

            <div className="auth-footer-note">
              <span>Already registered? </span>
              <Link to="/login" className="auth-accent-link">
                Sign In Here
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;