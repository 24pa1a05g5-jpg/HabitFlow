import { SearchIcon, CloseIcon } from "./Icons";

export default function HabitFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories = [],
  sortBy,
  onSortByChange,
  totalCount,
  filteredCount,
}) {
  return (
    <div className="habit-controls-bar">
      <div className="controls-primary-row">
        {/* Search Input */}
        <div className="search-input-wrap">
          <SearchIcon size={15} />
          <input
            type="text"
            className="search-input"
            placeholder="Search habits by title or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              title="Clear search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="status-chips-wrap">
          <button
            type="button"
            className={`filter-chip ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => onStatusFilterChange("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-chip ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => onStatusFilterChange("pending")}
          >
            Pending Today
          </button>
          <button
            type="button"
            className={`filter-chip ${statusFilter === "completed" ? "active" : ""}`}
            onClick={() => onStatusFilterChange("completed")}
          >
            Done Today
          </button>
          <button
            type="button"
            className={`filter-chip ${statusFilter === "streak" ? "active" : ""}`}
            onClick={() => onStatusFilterChange("streak")}
          >
            Streaks (3d+) 🔥
          </button>
        </div>
      </div>

      <div className="controls-secondary-row">
        {/* Category selector */}
        {categories.length > 0 && (
          <div className="select-wrap">
            <span className="select-label">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="styled-select"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort by */}
        <div className="select-wrap">
          <span className="select-label">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="styled-select"
          >
            <option value="newest">Newest First</option>
            <option value="streak">Highest Streak</option>
            <option value="alpha">Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* Count indicator */}
        <div className="filter-count-badge">
          Showing <strong>{filteredCount}</strong> of {totalCount}
        </div>
      </div>
    </div>
  );
}
