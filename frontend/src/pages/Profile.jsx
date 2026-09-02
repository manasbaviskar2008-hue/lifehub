import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("USER");
  const [bio, setBio] = useState("Managing daily tasks, expenses, and habits in Life Hub.");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setRole(user.role || "USER");
      if (user.bio) setBio(user.bio);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (!fullName.trim() || !email.trim()) {
      setMsg({ text: "Full name and email address are required.", type: "error" });
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role,
        bio: bio.trim(),
      });

      setMsg({ text: "Profile updated successfully! All changes saved.", type: "success" });
    } catch (err) {
      setMsg({ text: "Failed to update profile. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const avatarInitial = (fullName || email || "U").charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>👤 User Profile & Account Settings</h2>
        <p>Manage your real personal credentials, contact info, and Life Hub preferences.</p>
      </div>

      {/* Real User Profile Banner */}
      <div className="glass-card" style={{ textAlign: "center", padding: "2.5rem 1.5rem", marginBottom: "1.5rem" }}>
        <div
          className="avatar-circle"
          style={{
            width: "80px",
            height: "80px",
            fontSize: "2.5rem",
            margin: "0 auto 1rem",
            boxShadow: "0 8px 24px var(--primary-glow)",
          }}
        >
          {avatarInitial}
        </div>

        <h3 style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>
          {fullName || "Life Hub User"}
        </h3>

        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          {email || "user@example.com"}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <span className="badge badge-primary">
            🛡️ Role: {role}
          </span>
          <span className="badge badge-completed">
            ✅ Account Active
          </span>
          {phone && (
            <span className="badge badge-pending">
              📞 {phone}
            </span>
          )}
        </div>
      </div>

      {/* Editable Information Card */}
      <div className="glass-card">
        <h3 style={{ marginBottom: "1.25rem" }}>Personal Information</h3>

        {msg.text && (
          <div
            className={`auth-alert ${
              msg.type === "success" ? "auth-alert-success" : "auth-alert-error"
            }`}
          >
            {msg.type === "success" ? "✅ " : "⚠️ "}
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  className="input-field icon-padding"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
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
                  className="input-field icon-padding"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <span className="input-icon">📞</span>
                <input
                  type="text"
                  className="input-field icon-padding"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <div className="input-with-icon">
                <span className="input-icon">🔑</span>
                <input
                  type="text"
                  className="input-field icon-padding"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Bio / Project Scope */}
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label className="form-label">Bio / Profile Description</label>
            <textarea
              className="textarea-field"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: "1.25rem", padding: "0.85rem 2rem" }}
            disabled={saving}
          >
            {saving ? "Saving Changes..." : "💾 Save Profile Changes"}
          </button>
        </form>
      </div>

    </div>
  );
}

export default Profile;