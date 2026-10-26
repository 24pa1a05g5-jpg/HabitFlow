import { useEffect, useMemo, useState, useCallback } from "react";
import {
  createHabit,
  deleteHabit,
  getHabits,
  getStats,
  toggleHabit,
  updateHabit,
} from "./api";
import Navbar from "./components/Navbar";
import StatsSection from "./components/StatsSection";
import HabitCard from "./components/HabitCard";
import HabitForm from "./components/HabitForm";
import HabitFilters from "./components/HabitFilters";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import AuthScreen from "./components/AuthScreen";
import { PlusIcon, SparklesIcon, TrophyIcon, CheckIcon } from "./components/Icons";

const STARTER_TEMPLATES = [
  {
    name: "Hydrate: Drink 2.5L Water",
    category: "Health & Wellness",
    description: "Keep a reusable water bottle nearby throughout the workday",
    color: "#06b6d4",
  },
  {
    name: "45-Minute Deep Work Session",
    category: "Deep Work & Focus",
    description: "Zero distractions, notifications muted, high-impact focus",
    color: "#6366f1",
  },
  {
    name: "15-Minute Morning Mobility",
    category: "Fitness & Exercise",
    description: "Light stretching and core activation to start the morning",
    color: "#10b981",
  },
  {
    name: "Read 20 Pages Non-Fiction",
    category: "Learning & Growth",
    description: "Consistent evening reading before sleep",
    color: "#8b5cf6",
  },
];

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    completionRate: 0,
    bestStreak: 0,
    totalCompletions: 0,
    last7Days: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const reloadDashboard = useCallback(async () => {
    try {
      const [habitData, statsData] = await Promise.all([
        getHabits(),
        getStats(),
      ]);

      setHabits(Array.isArray(habitData) ? habitData : []);
      setStats(statsData || {});
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load habit dashboard");
      if (
        err.message?.toLowerCase().includes("token") ||
        err.message?.toLowerCase().includes("unauthorized")
      ) {
        onLogout();
      }
    }
  }, [onLogout]);

  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      try {
        const [habitData, statsData] = await Promise.all([
          getHabits(),
          getStats(),
        ]);
        if (!ignore) {
          setHabits(Array.isArray(habitData) ? habitData : []);
          setStats(statsData || {});
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load habit dashboard");
          setLoading(false);
          if (
            err.message?.toLowerCase().includes("token") ||
            err.message?.toLowerCase().includes("unauthorized")
          ) {
            onLogout();
          }
        }
      }
    }

    fetchInitial();
    return () => {
      ignore = true;
    };
  }, [onLogout]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    habits.forEach((h) => {
      if (h.category) set.add(h.category);
    });
    return Array.from(set);
  }, [habits]);

  // Helper to compute streak for sorting
  const getStreakVal = (completedDates = []) => {
    const dates = new Set(completedDates);
    const d = new Date();
    const fmt = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    let streak = 0;
    const cur = new Date(d);
    if (!dates.has(fmt(cur))) cur.setDate(cur.getDate() - 1);
    while (dates.has(fmt(cur))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
    return streak;
  };

  // Filter & Sort Logic
  const filteredHabits = useMemo(() => {
    return habits
      .filter((habit) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = habit.name.toLowerCase().includes(q);
          const matchDesc = (habit.description || "").toLowerCase().includes(q);
          const matchCat = (habit.category || "").toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Category filter
        if (categoryFilter !== "all" && habit.category !== categoryFilter) {
          return false;
        }

        // Status filter
        const isDone = (habit.completedDates || []).includes(todayStr);
        if (statusFilter === "completed" && !isDone) return false;
        if (statusFilter === "pending" && isDone) return false;
        if (statusFilter === "streak") {
          const streak = getStreakVal(habit.completedDates);
          if (streak < 3) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "streak") {
          return getStreakVal(b.completedDates) - getStreakVal(a.completedDates);
        }
        if (sortBy === "alpha") {
          return a.name.localeCompare(b.name);
        }
        // "newest" default
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [habits, searchQuery, categoryFilter, statusFilter, sortBy, todayStr]);

  // Optimistic Toggle
  const handleToggle = async (id, targetDate) => {
    const dateToToggle = targetDate || todayStr;
    const prevHabits = [...habits];

    // Optimistic state update
    setHabits((prev) =>
      prev.map((h) => {
        if (h._id !== id) return h;
        const dates = new Set(h.completedDates || []);
        if (dates.has(dateToToggle)) {
          dates.delete(dateToToggle);
        } else {
          dates.add(dateToToggle);
        }
        return { ...h, completedDates: Array.from(dates) };
      })
    );

    try {
      await toggleHabit(id, dateToToggle);
      // Refresh stats in background
      const newStats = await getStats();
      setStats(newStats);
    } catch (err) {
      setHabits(prevHabits);
      setError(err.message || "Failed to toggle habit");
    }
  };

  // Save Habit (Create or Update)
  const handleSaveHabit = async (habitData) => {
    if (editingHabit) {
      await updateHabit(editingHabit._id, habitData);
    } else {
      await createHabit(habitData);
    }
    setShowForm(false);
    setEditingHabit(null);
    await reloadDashboard();
  };

  // Delete Habit
  const handleConfirmDelete = async () => {
    if (!deletingHabit) return;
    try {
      setDeleteLoading(true);
      await deleteHabit(deletingHabit._id);
      setDeletingHabit(null);
      await reloadDashboard();
    } catch (err) {
      setError(err.message || "Failed to delete habit");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateStarter = async (template) => {
    try {
      setLoading(true);
      await createHabit(template);
      await reloadDashboard();
    } catch (err) {
      setError(err.message || "Failed to add template habit");
    } finally {
      setLoading(false);
    }
  };

  const isAllCompletedToday =
    habits.length > 0 &&
    stats.completedToday === habits.length &&
    stats.completedToday > 0;

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        onLogout={onLogout}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="dashboard-content-area">
        {/* Header Hero Section */}
        <section className="dashboard-hero-banner">
          <div className="hero-text-col">
            <div className="hero-eyebrow-chip">
              <SparklesIcon size={13} />
              <span>OVERVIEW & ANALYTICS</span>
            </div>
            <h1 className="hero-main-title">
              Consistency is your <em>competitive advantage.</em>
            </h1>
            <p className="hero-lead-text">
              Track daily habits, inspect 7-day completion matrices, and maintain your momentum.
            </p>
          </div>

          <div className="hero-cta-col">
            <button
              type="button"
              className="btn-primary hero-add-btn"
              onClick={() => {
                setEditingHabit(null);
                setShowForm(true);
              }}
            >
              <PlusIcon size={18} />
              <span>New Habit</span>
            </button>
          </div>
        </section>

        {/* Global Error Notice */}
        {error && (
          <div className="dashboard-alert-banner">
            <span>{error}</span>
            <button
              type="button"
              className="alert-dismiss"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* All Habits Completed Celebration Banner */}
        {isAllCompletedToday && (
          <section className="celebration-hero-card">
            <div className="celebration-icon">
              <TrophyIcon size={26} />
            </div>
            <div className="celebration-content">
              <h3>Incredible work! 100% of habits completed today.</h3>
              <p>You checked off all {habits.length} habits. Consistency compounds over time.</p>
            </div>
            <div className="celebration-badge">
              <CheckIcon size={16} /> PERFECT SCORE
            </div>
          </section>
        )}

        {/* Analytics & Metrics Grid */}
        <StatsSection stats={stats} />

        {/* Habits Section */}
        <section className="habits-master-section">
          <div className="habits-section-header">
            <div>
              <span className="section-eyebrow">YOUR ROUTINES</span>
              <h2 className="section-title">Habits Directory</h2>
            </div>

            <button
              type="button"
              className="btn-secondary compact-btn"
              onClick={() => {
                setEditingHabit(null);
                setShowForm(true);
              }}
            >
              <PlusIcon size={16} />
              <span>Add Routine</span>
            </button>
          </div>

          {/* Search, Filter & Sort Controls */}
          {habits.length > 0 && (
            <HabitFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categories={categories}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              totalCount={habits.length}
              filteredCount={filteredHabits.length}
            />
          )}

          {/* Content Loading or Feed */}
          {loading && habits.length === 0 ? (
            <div className="dashboard-loading-state">
              <div className="app-spinner" />
              <p>Loading your habit studio...</p>
            </div>
          ) : habits.length === 0 ? (
            /* Empty State with Starter Templates */
            <div className="zero-habits-container">
              <div className="zero-habits-header">
                <div className="zero-icon-box">
                  <SparklesIcon size={28} />
                </div>
                <h3>No habits created yet</h3>
                <p>
                  Start your journey by adding your own habit or click one of our curated high-performance starter routines below:
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setEditingHabit(null);
                    setShowForm(true);
                  }}
                >
                  <PlusIcon size={18} />
                  <span>Create Custom Habit</span>
                </button>
              </div>

              <div className="starter-templates-grid">
                {STARTER_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.name}
                    className="starter-card"
                    style={{ "--card-accent": tmpl.color }}
                  >
                    <div className="starter-accent-dot" />
                    <div className="starter-body">
                      <span className="starter-cat">{tmpl.category}</span>
                      <h4 className="starter-name">{tmpl.name}</h4>
                      <p className="starter-desc">{tmpl.description}</p>
                    </div>
                    <button
                      type="button"
                      className="starter-add-btn"
                      onClick={() => handleCreateStarter(tmpl)}
                    >
                      + Quick Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredHabits.length === 0 ? (
            /* No Results for current filters */
            <div className="no-filter-results">
              <p>No habits match your active search or filters.</p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Habit Cards Grid */
            <div className="habit-cards-stack">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit._id}
                  habit={habit}
                  onToggle={handleToggle}
                  onEdit={(h) => {
                    setEditingHabit(h);
                    setShowForm(true);
                  }}
                  onDelete={(h) => setDeletingHabit(h)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Habit Create / Edit Modal */}
      {showForm && (
        <HabitForm
          key={editingHabit?._id || "new"}
          habit={editingHabit}
          onSave={handleSaveHabit}
          onClose={() => {
            setShowForm(false);
            setEditingHabit(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingHabit && (
        <DeleteConfirmModal
          habit={deletingHabit}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingHabit(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("habitflow_user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("habitflow_theme");
    return savedTheme || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("habitflow_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.removeItem("habitflow_token");
    localStorage.removeItem("habitflow_user");
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}
