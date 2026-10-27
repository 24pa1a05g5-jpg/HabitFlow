
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/auth");
const habitRoutes = require("./routes/habits");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Habit = require("./models/Habit");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "HabitFlow API is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);

// Serve the React frontend in production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "..", "client", "dist");

  app.use(express.static(clientPath));

  app.get("/{*splat}", (req, res, next) => {
    res.sendFile(path.join(clientPath, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// General error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

let mongoMemoryServer = null;

async function startServer() {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri === "memory" || mongoUri === "your_mongodb_connection_string_here") {
      console.log("ℹ️  No remote MONGODB_URI configured. Starting embedded in-memory MongoDB...");
      try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        mongoMemoryServer = await MongoMemoryServer.create();
        mongoUri = mongoMemoryServer.getUri();
        console.log("✅ Embedded MongoDB running at:", mongoUri);
      } catch (err) {
        throw new Error(
          "MONGODB_URI is missing and failed to launch in-memory MongoDB: " + err.message
        );
      }
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      process.env.JWT_SECRET = "habitflow_super_secure_production_secret_key_minimum_32_characters_987654321";
      console.log("ℹ️  Using default secure JWT_SECRET key");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully");

    // Auto-seed demo account if it doesn't exist
    try {
      const demoUser = await User.findOne({ email: "demo@habitflow.app" });
      if (!demoUser) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = await User.create({
          name: "Alex Rivera",
          email: "demo@habitflow.app",
          password: hashedPassword,
        });

        const todayStr = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());

        const getPastDate = (daysAgo) => {
          const d = new Date();
          d.setDate(d.getDate() - daysAgo);
          return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        };

        await Habit.create([
          {
            userId: user._id,
            name: "Drink 2.5L Water Daily",
            category: "Health & Wellness",
            description: "Stay hydrated during workday",
            color: "#06b6d4",
            completedDates: [todayStr, getPastDate(1), getPastDate(2), getPastDate(3)],
          },
          {
            userId: user._id,
            name: "Morning Meditation 15m",
            category: "Mindfulness",
            description: "Mindful breathing and focus",
            color: "#10b981",
            completedDates: [todayStr, getPastDate(1)],
          },
          {
            userId: user._id,
            name: "45m Deep Work Sprint",
            category: "Deep Work & Focus",
            description: "Focus without distractions",
            color: "#6366f1",
            completedDates: [getPastDate(1), getPastDate(2)],
          },
        ]);
        console.log("🌱 Demo account initialized (demo@habitflow.app)");
      }
    } catch (seedErr) {
      console.log("Demo seed notice:", seedErr.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`HabitFlow server running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down server...");
      server.close();
      await mongoose.disconnect();
      if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
      }
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
