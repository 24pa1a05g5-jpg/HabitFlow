
const express = require("express");
const mongoose = require("mongoose");
const Habit = require("../models/Habit");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

// Use the same date format throughout the API.
function getTodayString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function calculateStreak(completedDates = []) {
  const dates = new Set(completedDates);
  const today = new Date(`${getTodayString()}T00:00:00+05:30`);

  let streak = 0;
  const current = new Date(today);

  while (dates.has(current.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  }))) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

// GET all habits belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(habits);
  } catch (error) {
    console.error("Get habits error:", error);
    res.status(500).json({ message: "Unable to fetch habits" });
  }
});

// GET dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.userId,
    });

    const today = getTodayString();

    const completedToday = habits.filter((habit) =>
      habit.completedDates.includes(today)
    ).length;

    const totalCompletions = habits.reduce(
      (total, habit) => total + habit.completedDates.length,
      0
    );

    const totalPossibleCompletions = habits.length * 7;

    const completionRate = habits.length === 0
      ? 0
      : Math.round(
          (completedToday / habits.length) * 100
        );

    const bestStreak = habits.reduce(
      (best, habit) =>
        Math.max(best, calculateStreak(habit.completedDates)),
      0
    );

    const last7Days = [];
    const todayDate = new Date(`${today}T00:00:00+05:30`);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const dayName = d.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "Asia/Kolkata",
      });
      const count = habits.filter((h) =>
        h.completedDates.includes(dateStr)
      ).length;
      last7Days.push({
        date: dateStr,
        day: dayName,
        completedCount: count,
        totalHabits: habits.length,
        rate: habits.length > 0 ? Math.round((count / habits.length) * 100) : 0,
      });
    }

    res.json({
      totalHabits: habits.length,
      completedToday,
      completionRate,
      bestStreak,
      totalCompletions,
      totalPossibleCompletions,
      last7Days,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Unable to fetch statistics" });
  }
});

// CREATE a habit
router.post("/", async (req, res) => {
  try {
    const { name, description = "", color = "#6c63ff", category = "General" } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Habit name is required",
      });
    }

    if (name.trim().length > 80) {
      return res.status(400).json({
        message: "Habit name cannot exceed 80 characters",
      });
    }

    const habit = await Habit.create({
      userId: req.userId,
      name: name.trim(),
      description:
        typeof description === "string"
          ? description.trim().slice(0, 200)
          : "",
      color:
        typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)
          ? color
          : "#6c63ff",
      category:
        typeof category === "string" && category.trim()
          ? category.trim().slice(0, 40)
          : "General",
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error("Create habit error:", error);
    res.status(500).json({ message: "Unable to create habit" });
  }
});

// UPDATE a habit
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid habit ID" });
    }

    const { name, description, color, category } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Habit name cannot be empty",
        });
      }

      if (name.trim().length > 80) {
        return res.status(400).json({
          message: "Habit name cannot exceed 80 characters",
        });
      }

      updates.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Invalid description",
        });
      }

      updates.description = description.trim().slice(0, 200);
    }

    if (color !== undefined) {
      if (typeof color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(color)) {
        return res.status(400).json({
          message: "Invalid color",
        });
      }

      updates.color = color;
    }

    if (category !== undefined) {
      if (typeof category !== "string") {
        return res.status(400).json({
          message: "Invalid category",
        });
      }

      updates.category = category.trim().slice(0, 40) || "General";
    }

    const habit = await Habit.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.json(habit);
  } catch (error) {
    console.error("Update habit error:", error);
    res.status(500).json({ message: "Unable to update habit" });
  }
});

// MARK habit complete or incomplete for a specific date (defaults to today)
router.patch("/:id/toggle", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid habit ID" });
    }

    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const targetDate =
      req.body &&
      typeof req.body.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(req.body.date)
        ? req.body.date
        : getTodayString();

    const index = habit.completedDates.indexOf(targetDate);

    if (index === -1) {
      habit.completedDates.push(targetDate);
    } else {
      habit.completedDates.splice(index, 1);
    }

    await habit.save();

    res.json(habit);
  } catch (error) {
    console.error("Toggle habit error:", error);
    res.status(500).json({ message: "Unable to update completion" });
  }
});

// DELETE a habit
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid habit ID" });
    }

    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Delete habit error:", error);
    res.status(500).json({ message: "Unable to delete habit" });
  }
});

module.exports = router;
