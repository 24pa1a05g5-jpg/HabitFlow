# HabitFlow — Precision Daily Habit Tracker & Consistency Studio

HabitFlow is a production-grade full-stack habit tracking application built with **React 19**, **Vite**, **Node.js/Express**, and **MongoDB**. Designed with the visual identity and interaction density of modern SaaS productivity tools (Linear, Things 3, Raycast), HabitFlow helps users cultivate daily discipline through visual streak momentum, interactive 7-day consistency matrices, and weekly habit activity analytics.

---

## ✨ Key Features & Enhancements

### 🎨 Visual Identity & UX
- **Dynamic Dark & Light Mode:** System-aware, persistent theme switcher with high-contrast slate neutrals and vibrant status accents.
- **Modern Typographic & Component Hierarchy:** Replaced generic starter styling with custom SVG iconography, crisp tabular metrics, and smooth micro-interactions.
- **Dual-Pane Editorial Auth Experience:** High-converting showcase page with product highlights and a **one-click demo credentials quick-fill** button for instant evaluation.

### 📅 Habit Tracking & Interactive Matrix
- **Interactive 7-Day Matrix Strip:** Every habit card features a clickable 7-day visual consistency strip. Users can inspect recent activity and toggle completion for any of the last 7 days directly on the card.
- **Optimistic State Updates:** Habit toggles respond instantly in the UI with zero perceived network latency.
- **Active Streak Momentum Engine:** Real-time streak computation with fire badges, weekly completion rates (`X/7 this week (Y%)`), and category tags.

### 📊 Comprehensive Dashboard Analytics
- **4 Key Performance Metric Cards:**
  - **Completed Today:** Count of completed habits with a dynamic progress bar and completion percentage.
  - **Best Active Streak:** Highlights highest unbroken daily streak with motivational milestones.
  - **7-Day Consistency:** Rolling 7-day completion rate average.
  - **Lifetime Completions:** Total check-ins recorded over time.
- **7-Day Habit Activity Spark Chart:** Day-by-day completions visualizer with interactive tooltips and highlighted current day indicator.
- **Celebration Banner:** Automatic achievement banner displayed when 100% of daily habits are completed.

### 🔍 Search, Filter & Organization
- **Real-Time Search:** Instant filtering across habit titles, descriptions, and categories.
- **Status Filter Chips:** Quick toggles for `All`, `Pending Today`, `Done Today`, and `Streaks (3d+) 🔥`.
- **Category Filter:** Segment habits by life areas (`Health & Wellness`, `Deep Work & Focus`, `Mindfulness`, `Fitness & Exercise`, `Learning & Growth`, `Daily Routine`).
- **Sorting Options:** Sort by `Newest First`, `Highest Streak`, or `Alphabetical (A-Z)`.
- **Zero-Habits Onboarding:** Engaging empty state with one-click starter habit templates (Water, Deep Work, Mobility, Reading).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19.3, Vite 8.3, Pure CSS (CSS Variables & Modern Design Tokens) |
| **Backend** | Node.js (v20+ / v26+), Express 5.3, Morgan, Cors |
| **Database & ODM**| MongoDB Atlas, Mongoose 9.11, Embedded `mongodb-memory-server` for zero-config local runs |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` (12 salt rounds) |
| **Code Quality** | ESLint 10, Automated Integration Test Suite (`verify-integration.js`) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0 or newer)
- **npm** (v9.0 or newer)
- *(Optional)* A remote MongoDB Atlas connection string (HabitFlow automatically launches an embedded in-memory MongoDB instance if no remote URI is configured, so you can test immediately with zero setup).

---

### 1. Clone & Setup

```bash
git clone https://github.com/24PA1A05A0-JONNADAPREMKUMAR/habit-tracker.git
cd habit-tracker
```

---

### 2. Backend Setup & Run

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

#### Environment Configuration (`server/.env`)
Create a `.env` file inside `server/` (or use the defaults):

```dotenv
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
# Optional: Provide a MongoDB Atlas URI. If omitted or left empty, HabitFlow
# automatically starts an embedded in-memory MongoDB database for instant local run!
MONGODB_URI=your_mongodb_connection_string_here
```

#### Run the Server

```bash
# Start backend server (runs on http://localhost:5000)
npm run dev

# Or run in production mode:
npm start
```

#### Run Automated Test Suite
To verify all backend API endpoints, authentication, database operations, and streak logic:

```bash
npm test
```

---

### 3. Frontend Setup & Run

In a separate terminal, navigate to the `client` directory:

```bash
cd client
npm install
```

#### Run Frontend Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Build & Lint Frontend

```bash
# Run ESLint check
npm run lint

# Build production bundle
npm run build
```

---

## 🧪 Quick Test / Evaluation Access

To test the application without manual signup:
1. Open the application at `http://localhost:5173`.
2. Click the **"⚡ Quick-fill demo credentials"** button on the login screen.
3. Click **"Sign In to Dashboard"** (or switch to **Register** if testing fresh accounts).
4. Explore adding, toggling 7-day past check-ins, searching, filtering, and switching themes!

---

## 📡 API Reference Summary

All `/api/habits` routes require an `Authorization: Bearer <token>` header.

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check & database connection status |
| `/api/auth/register` | `POST` | Register a new user (`name`, `email`, `password`) |
| `/api/auth/login` | `POST` | Sign in with email and password |
| `/api/habits` | `GET` | Retrieve all habits for the logged-in user |
| `/api/habits/stats` | `GET` | Retrieve dashboard stats & rolling 7-day completion rates |
| `/api/habits` | `POST` | Create a habit (`name`, `description`, `color`, `category`) |
| `/api/habits/:id` | `PUT` | Update habit details (`name`, `description`, `color`, `category`) |
| `/api/habits/:id/toggle` | `PATCH` | Toggle completion status for today or optional `{ date: "YYYY-MM-DD" }` |
| `/api/habits/:id` | `DELETE` | Permanently remove a habit |

---

## 🔒 Security & Best Practices
- Passwords hashed using `bcryptjs` with salt round 12.
- JWT tokens signed with minimum 32-character secret with 7-day expiry.
- Request payload limit enforced to prevent large body attacks (`express.json({ limit: "10kb" })`).
- Sanitized strings and trimmed inputs on all routes.
- Fully isolated user data query scoped to `req.userId`.
