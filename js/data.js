import { CATEGORIES, DEFAULT_HABITS } from "./constants.js";
import { sanitizeRecurrenceFields } from "./recurrence.js";
import { isValidDateKey } from "./dates.js";

export function defaultPlayer() {
  return {
    xp: 0,
    level: 1,
    coins: 0,
    streak: 0,
    lastCompletedDate: null,
    completedToday: 0,
    completedWeek: 0,
    totalCompleted: 0,
    challengeRewarded: [],
    challengeRewardedDate: null,
    badges: [],
    usedBothLanguages: false,
    usedDarkMode: false,
    completedByDay: {}
  };
}

export function normalizePriority(priority) {
  return ["high", "medium", "low"].includes(priority) ? priority : "medium";
}

export function sanitizeCategory(category) {
  return CATEGORIES.includes(category) ? category : null;
}

export function sanitizeTasks(rawTasks) {
  if (!Array.isArray(rawTasks)) return [];

  return rawTasks
    .map((task, index) => {
      const sanitized = {
        id: String(task.id ?? `${Date.now()}-${index}`),
        text: String(task.text ?? "").trim(),
        completed: Boolean(task.completed),
        completedAt: typeof task.completedAt === "string" && Number.isFinite(Date.parse(task.completedAt)) ? task.completedAt : null,
        dueDate: isValidDateKey(task.dueDate) ? task.dueDate : null,
        priority: normalizePriority(task.priority),
        createdAt: typeof task.createdAt === "string" && Number.isFinite(Date.parse(task.createdAt)) ? task.createdAt : new Date().toISOString(),
        notes: String(task.notes ?? "").trim(),
        rewardGranted: Boolean(task.rewardGranted),
        projectId: task.projectId === null || task.projectId === undefined || task.projectId === ""
          ? null
          : String(task.projectId),
        category: sanitizeCategory(task.category)
      };
      return { ...sanitized, ...sanitizeRecurrenceFields(task, sanitized) };
    })
    .filter((task) => task.text !== "");
}

export function sanitizePlayer(player) {
  const raw = player && typeof player === "object" && !Array.isArray(player) ? player : {};
  const nonNegative = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : fallback;
  return {
    ...defaultPlayer(),
    ...raw,
    xp: nonNegative(raw.xp),
    level: Math.max(1, Math.floor(nonNegative(raw.level, 1))),
    coins: nonNegative(raw.coins),
    streak: Math.floor(nonNegative(raw.streak)),
    completedToday: Math.floor(nonNegative(raw.completedToday)),
    completedWeek: Math.floor(nonNegative(raw.completedWeek)),
    totalCompleted: Math.floor(nonNegative(raw.totalCompleted)),
    completedByDay: raw.completedByDay && typeof raw.completedByDay === "object" && !Array.isArray(raw.completedByDay) ? raw.completedByDay : {}
  };
}

export function sanitizeHabits(rawHabits) {
  if (!Array.isArray(rawHabits)) {
    return DEFAULT_HABITS.map((habit, index) => ({
      id: `default-${index}`,
      name: habit.name,
      emoji: habit.emoji,
      reminderTime: null,
      completedDates: [],
      streak: 0,
      lastCompletedDate: null
    }));
  }

  return rawHabits
    .map((habit, index) => ({
      id: String(habit.id ?? `habit-${Date.now()}-${index}`),
      name: String(habit.name ?? "").trim(),
      emoji: String(habit.emoji ?? "🌟").trim() || "🌟",
      reminderTime: /^\d{2}:\d{2}$/.test(String(habit.reminderTime || "")) ? habit.reminderTime : null,
      completedDates: Array.isArray(habit.completedDates) ? habit.completedDates.filter(isValidDateKey) : [],
      streak: Math.max(0, Number.isFinite(Number(habit.streak)) ? Number(habit.streak) : 0),
      lastCompletedDate: isValidDateKey(habit.lastCompletedDate) ? habit.lastCompletedDate : null
    }))
    .filter((habit) => habit.name !== "");
}
