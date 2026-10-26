import { useState } from "react";
import { loginUser, registerUser } from "../api";
import { EyeIcon, EyeOffIcon, SparklesIcon, CheckIcon, FireIcon } from "./Icons";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFillDemo = () => {
    setForm({
      name: "Alex Rivera",
      email: "demo@habitflow.app",
      password: "password123",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data =
        mode === "login"
          ? await loginUser({
              email: form.email,
              password: form.password,
            })
          : await registerUser(form);

      localStorage.setItem("habitflow_token", data.token);
      localStorage.setItem("habitflow_user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-showcase-layout">
      {/* Editorial Left Hero */}
      <aside className="auth-hero-pane">
        <div className="auth-hero-backdrop" />
        <div className="auth-hero-content">
          <div className="hero-brand-mark">
            <span className="brand-symbol">✦</span>
            <span className="brand-text-label">HabitFlow</span>
          </div>

          <div className="hero-quote-block">
            <div className="hero-tag">MODERN HABIT STUDIO</div>
            <h1 className="hero-headline">
              Transform your daily routine into lifelong momentum.
            </h1>
            <p className="hero-lead">
              Precision streak analytics, 7-day visual consistency matrix,
              and frictionless daily check-ins designed for high performers.
            </p>
          </div>

          <div className="hero-feature-pills">
            <div className="feature-pill">
              <CheckIcon size={14} className="pill-icon" />
              <span>Interactive 7-day consistency strip</span>
            </div>
            <div className="feature-pill">
              <FireIcon size={14} className="pill-icon" />
              <span>Smart streak milestone tracking</span>
            </div>
            <div className="feature-pill">
              <SparklesIcon size={14} className="pill-icon" />
              <span>Dark / Light mode productivity workspace</span>
            </div>
          </div>

          <div className="hero-testimonial-card">
            <p className="testimonial-text">
              "HabitFlow is the first habit application that actually feels like a
              professional SaaS tool rather than a toy. The weekly visual matrix is invaluable."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">AR</div>
              <div>
                <strong>Alex Rivera</strong>
                <span>Product Designer</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Auth Card Right */}
      <main className="auth-form-pane">
        <div className="auth-card-wrapper">
          <div className="auth-header-mobile">
            <span className="mobile-brand-symbol">✦</span>
            <h2>HabitFlow</h2>
          </div>

          <div className="auth-card-header">
            <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p className="auth-header-sub">
              {mode === "login"
                ? "Enter your credentials to access your habit dashboard"
                : "Start tracking your habits with precision today"}
            </p>
          </div>

          <div className="auth-tabs-row">
            <button
              type="button"
              className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          {/* Quick Demo Fill Pill */}
          <div className="demo-fill-wrap">
            <button
              type="button"
              className="demo-fill-btn"
              onClick={handleFillDemo}
              title="Auto-fill demo test credentials"
            >
              ⚡ Quick-fill demo credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-body">
            {mode === "register" && (
              <div className="form-group">
                <label htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="styled-input"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email">Work or Personal Email</label>
              <input
                id="auth-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="styled-input"
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="auth-password">Password</label>
                <span className="helper-note">Min 6 characters</span>
              </div>
              <div className="password-field-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="styled-input"
                />
                <button
                  type="button"
                  className="pwd-toggle-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="form-error-banner">{error}</div>}

            <button
              type="submit"
              className="btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner" />
              ) : mode === "login" ? (
                "Sign In to Dashboard"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-card-footer">
            <span>
              {mode === "login"
                ? "Don't have an account yet?"
                : "Already have an account?"}
            </span>{" "}
            <button
              type="button"
              className="auth-switch-link"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Sign up free" : "Sign in here"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
