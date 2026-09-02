import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <div className="glass-card" style={{ maxWidth: "500px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <span style={{ fontSize: "4rem" }}>🔍</span>
        <h1 className="gradient-text" style={{ fontSize: "3rem", margin: "0.5rem 0" }}>404</h1>
        <h2>Page Not Found</h2>
        <p style={{ marginTop: "0.5rem", marginBottom: "1.75rem" }}>
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link to="/dashboard" className="btn btn-primary">
          🏠 Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;