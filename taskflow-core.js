(function attachTaskFlowCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.TaskFlowCore = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createTaskFlowCore() {
  const VALID_PRIORITIES = ["high", "medium", "low"];
  const VALID_LANGUAGES = ["en", "es"];
  const VALID_THEMES = ["default", "sunset", "mint", "galaxy", "rose", "ocean"];
  const MAX_TEXT_LENGTH = 300;
  const MAX_NOTES_LENGTH = 2000;
  const PRIORITY_REWARDS = {
    high: { xp: 35, coins: 7 },
    medium: { xp: 20, coins: 4 },
    low: { xp: 10, coins: 2 }
  };

  function defaultPlayer() {
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

  function normalizePriority(priority) {
    return VALID_PRIORITIES.includes(priority) ? priority : "medium";
  }

  function clampNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(Math.max(number, min), max);
  }

  function toCleanString(value, maxLength) {
    return String(value ?? "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, maxLength);
  }

  function isDateOnly(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  function isIsoLike(value) {
    return typeof value === "string" && !Number.isNaN(Date.parse(value));
  }

  function uniqueId(base, usedIds, prefix) {
    const cleanBase = toCleanString(base, 80) || `${prefix}-${Date.now()}`;
    let id = cleanBase;
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `${cleanBase}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    return id;
  }

  function sanitizeTasks(rawTasks) {
    if (!Array.isArray(rawTasks)) return [];
    const usedIds = new Set();
    return rawTasks
      .map((task, index) => {
        if (!task || typeof task !== "object" || Array.isArray(task)) return null;
        const text = toCleanString(task.text, MAX_TEXT_LENGTH);
        if (!text) return null;
        return {
          id: uniqueId(task.id ?? `task-${index}`, usedIds, "task"),
          text,
          completed: Boolean(task.completed),
          completedAt: isIsoLike(task.completedAt) ? task.completedAt : null,
          dueDate: isDateOnly(task.dueDate) ? task.dueDate : null,
          priority: normalizePriority(task.priority),
          createdAt: isIsoLike(task.createdAt) ? task.createdAt : new Date().toISOString(),
          notes: toCleanString(task.notes, MAX_NOTES_LENGTH)
        };
      })
      .filter(Boolean);
  }

  function sanitizePlayer(rawPlayer) {
    const player = rawPlayer && typeof rawPlayer === "object" && !Array.isArray(rawPlayer) ? rawPlayer : {};
    const defaults = defaultPlayer();
    const completedByDay = {};
    if (player.completedByDay && typeof player.completedByDay === "object" && !Array.isArray(player.completedByDay)) {
      Object.entries(player.completedByDay).forEach(([day, count]) => {
        if (isDateOnly(day)) completedByDay[day] = clampNumber(count, 0, 0, 10000);
      });
    }
    return {
      ...defaults,
      xp: clampNumber(player.xp, defaults.xp, 0, 1000000),
      level: clampNumber(player.level, defaults.level, 1, 1000),
      coins: clampNumber(player.coins, defaults.coins, 0, 1000000),
      streak: clampNumber(player.streak, defaults.streak, 0, 10000),
      lastCompletedDate: isDateOnly(player.lastCompletedDate) ? player.lastCompletedDate : null,
      completedToday: clampNumber(player.completedToday, defaults.completedToday, 0, 10000),
      completedWeek: clampNumber(player.completedWeek, defaults.completedWeek, 0, 10000),
      totalCompleted: clampNumber(player.totalCompleted, defaults.totalCompleted, 0, 1000000),
      challengeRewarded: Array.isArray(player.challengeRewarded)
        ? player.challengeRewarded.map((id) => toCleanString(id, 80)).filter(Boolean)
        : [],
      challengeRewardedDate: isDateOnly(player.challengeRewardedDate) ? player.challengeRewardedDate : null,
      badges: Array.isArray(player.badges) ? player.badges.map((id) => toCleanString(id, 80)).filter(Boolean) : [],
      usedBothLanguages: Boolean(player.usedBothLanguages),
      usedDarkMode: Boolean(player.usedDarkMode),
      completedByDay
    };
  }

  function sanitizeHabits(rawHabits, defaultHabits) {
    const source = Array.isArray(rawHabits) ? rawHabits : defaultHabits || [];
    const usedIds = new Set();
    return source
      .map((habit, index) => {
        if (!habit || typeof habit !== "object" || Array.isArray(habit)) return null;
        const name = toCleanString(habit.name, 120);
        if (!name) return null;
        return {
          id: uniqueId(habit.id ?? `habit-${index}`, usedIds, "habit"),
          name,
          emoji: toCleanString(habit.emoji || "🌟", 6) || "🌟",
          reminderTime:
            typeof habit.reminderTime === "string" && /^\d{2}:\d{2}$/.test(habit.reminderTime)
              ? habit.reminderTime
              : null,
          completedDates: Array.isArray(habit.completedDates) ? habit.completedDates.filter(isDateOnly).slice(-30) : [],
          streak: clampNumber(habit.streak, 0, 0, 10000),
          lastCompletedDate: isDateOnly(habit.lastCompletedDate) ? habit.lastCompletedDate : null
        };
      })
      .filter(Boolean);
  }

  function parseDateOnly(dateString) {
    return new Date(`${dateString}T00:00:00`);
  }

  function isInCurrentWeek(dateString, todayString) {
    const today = parseDateOnly(todayString);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const due = parseDateOnly(dateString);
    return due >= today && due <= weekEnd;
  }

  function isInCurrentMonth(dateString, todayString) {
    const today = parseDateOnly(todayString);
    const due = parseDateOnly(dateString);
    return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();
  }

  function filterTasks(tasks, options) {
    const state = {
      view: "all",
      searchQuery: "",
      today: new Date().toISOString().slice(0, 10),
      ...options
    };
    const query = state.searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      if (query && !`${task.text} ${task.notes || ""}`.toLowerCase().includes(query)) return false;
      if (state.view === "today") return task.dueDate === state.today;
      if (state.view === "week") return task.dueDate ? isInCurrentWeek(task.dueDate, state.today) : false;
      if (state.view === "month") return task.dueDate ? isInCurrentMonth(task.dueDate, state.today) : false;
      return true;
    });
  }

  function xpNeededForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.2));
  }

  function applyXpAndCoins(player, xp, coins) {
    const next = sanitizePlayer(player);
    next.xp += xp;
    next.coins += coins;
    while (next.xp >= xpNeededForLevel(next.level)) {
      next.xp -= xpNeededForLevel(next.level);
      next.level += 1;
      next.coins += 15;
    }
    return next;
  }

  function calculateTaskReward(task, completedTodayCount, todayString) {
    const priority = PRIORITY_REWARDS[normalizePriority(task.priority)];
    let xp = priority.xp;
    let coins = priority.coins;
    if (task.dueDate && todayString <= task.dueDate) xp += 10;
    if (completedTodayCount === 3) {
      xp += 15;
      coins += 5;
    }
    if (completedTodayCount === 5) {
      xp += 30;
      coins += 10;
    }
    return { xp, coins };
  }

  function validateBackup(raw, defaultHabits) {
    let parsed;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return { ok: false, error: "invalidJson" };
    }
    if (!parsed || typeof parsed !== "object") return { ok: false, error: "invalidShape" };

    const legacyTasksOnly = Array.isArray(parsed);
    const candidate = legacyTasksOnly ? { tasks: parsed } : parsed;
    if (!Array.isArray(candidate.tasks)) return { ok: false, error: "tasksMissing" };
    if (candidate.habits !== undefined && !Array.isArray(candidate.habits))
      return { ok: false, error: "habitsInvalid" };
    if (candidate.player !== undefined && (typeof candidate.player !== "object" || Array.isArray(candidate.player))) {
      return { ok: false, error: "playerInvalid" };
    }

    return {
      ok: true,
      data: {
        schemaVersion: 1,
        exportedAt: isIsoLike(candidate.exportedAt) ? candidate.exportedAt : new Date().toISOString(),
        tasks: sanitizeTasks(candidate.tasks),
        player: sanitizePlayer(candidate.player),
        habits: sanitizeHabits(candidate.habits, defaultHabits),
        language: VALID_LANGUAGES.includes(candidate.language) ? candidate.language : "en",
        settings: {
          theme: VALID_THEMES.includes(candidate.settings?.theme) ? candidate.settings.theme : "default",
          darkMode: Boolean(candidate.settings?.darkMode),
          editMode: Boolean(candidate.settings?.editMode)
        }
      }
    };
  }

  function getTaskEmptyState(tasks, filteredTasks, todoTasks, doneTasks, options) {
    const state = { section: "todo", view: "all", searchQuery: "", ...options };
    const hasAnyTasks = tasks.length > 0;
    const hasActiveSearchOrFilter = state.searchQuery.trim().length > 0 || state.view !== "all";
    const hasFilteredTasks = filteredTasks.length > 0;
    if (state.section === "todo" && todoTasks.length === 0) {
      if (!hasAnyTasks) return "emptyTasks";
      if (!hasFilteredTasks && hasActiveSearchOrFilter) return "noResults";
      return "allClear";
    }
    if (state.section === "completed" && doneTasks.length === 0) {
      if (!hasFilteredTasks && hasAnyTasks && hasActiveSearchOrFilter) return "noResults";
      return "noCompleted";
    }
    return null;
  }

  return {
    VALID_PRIORITIES,
    VALID_LANGUAGES,
    VALID_THEMES,
    PRIORITY_REWARDS,
    defaultPlayer,
    normalizePriority,
    sanitizeTasks,
    sanitizePlayer,
    sanitizeHabits,
    filterTasks,
    xpNeededForLevel,
    applyXpAndCoins,
    calculateTaskReward,
    validateBackup,
    getTaskEmptyState
  };
});
