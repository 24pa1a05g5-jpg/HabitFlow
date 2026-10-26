import { SunIcon, MoonIcon, CalendarIcon, LogoutIcon } from "./Icons";

export default function Navbar({ user, onLogout, theme, onToggleTheme }) {
  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-brand">
          <div className="brand-badge">
            <span className="brand-glyph">✦</span>
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">HabitFlow</span>
              <span className="brand-tag">PRO</span>
            </div>
            <span className="brand-sub">Daily Consistency Studio</span>
          </div>
        </div>

        <div className="nav-center">
          <div className="nav-date-pill">
            <CalendarIcon size={14} />
            <span>{formattedToday}</span>
          </div>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          <div className="nav-divider" />

          <div className="user-profile-menu">
            <div className="user-avatar" title={user?.email}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <button
              className="logout-button"
              onClick={onLogout}
              title="Sign out of your account"
              aria-label="Log out"
            >
              <LogoutIcon size={15} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
