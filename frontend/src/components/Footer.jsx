function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-badge">
          <span>🎓 Internship Project (ITR)</span>
          <span>•</span>
          <span className="gradient-text">Life Hub v1.0</span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Life Hub — Personal Productivity & Lifestyle Manager. Built with React & Spring Boot.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
