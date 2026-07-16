import { CATEGORIES, DEFAULT_HABITS } from "./constants.js";
import { sanitizeRecurrenceFields } from "./recurrence.js";

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
        completedAt: task.completedAt || null,
        dueDate: task.dueDate || null,
        priority: normalizePriority(task.priority),
        createdAt: task.createdAt || new Date().toISOString(),
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
  return {
    ...defaultPlayer(),
    ...player
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
      reminderTime: habit.reminderTime || null,
      completedDates: Array.isArray(habit.completedDates) ? habit.completedDates : [],
      streak: Number(habit.streak ?? 0),
      lastCompletedDate: habit.lastCompletedDate || null
    }))
    .filter((habit) => habit.name !== "");
}
