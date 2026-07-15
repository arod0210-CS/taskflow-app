document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "taskflow-tasks-v3";
  const PLAYER_KEY = "taskflow-player-v1";
  const LANG_KEY = "taskflow-language-v1";
  const HABITS_KEY = "taskflow-habits-v1";
  const TAB_KEY = "taskflow-active-tab-v1";
  const THEME_CLASSES = ["theme-sunset", "theme-mint", "theme-galaxy", "theme-rose", "theme-ocean"];

  const DEFAULT_HABITS = [
    { emoji: "🚿", name: "Shower" },
    { emoji: "🦷", name: "Brush Teeth" },
    { emoji: "🚶", name: "Walk" },
    { emoji: "💧", name: "Drink Water" },
    { emoji: "💊", name: "Take Vitamins" },
    { emoji: "🧘", name: "Stretch" },
    { emoji: "😴", name: "Wind Down" }
  ];

  const translations = {
    en: {
      appLanguage: "en",
      eyebrow: "Stay organized",
      settings: "Settings",
      settingsMenu: "Settings menu",
      darkMode: "Dark mode",
      language: "Language",
      themes: "Themes",
      themeColor: "Theme color",
      dataManagement: "Data Management",
      exportData: "Export Data (.json)",
      importData: "Import Data",
      editModeOn: "Edit Mode: ON",
      editModeOff: "Edit Mode: OFF",
      tasksLeft: "Tasks Left",
      completed: "Completed",
      taskProgress: "Task Progress",
      playerRank: "Player Rank",
      progressSummary: "Progress Summary",
      level: "Level",
      xpProgress: "XP Progress",
      coins: "Coins",
      streak: "Streak",
      doneToday: "Done Today",
      rewardLow: "Low: +10 XP / +2 coins",
      rewardMedium: "Medium: +20 XP / +4 coins",
      rewardHigh: "High: +35 XP / +7 coins",
      dailyChallenges: "Daily Challenges",
      todayMissions: "Today’s Missions",
      addTaskPlaceholder: "Add a new task...",
      addTask: "Add Task",
      reset: "Reset",
      searchPlaceholder: "Search tasks...",
      all: "All",
      today: "Today",
      week: "Week",
      month: "Month",
      todo: "To Do",
      completedHeading: "Completed",
      editTask: "Edit Task",
      task: "Task",
      markTaskComplete: "Mark as complete",
      markTaskIncomplete: "Mark as incomplete",
      deleteTask: "Delete task",
      taskDescriptionPlaceholder: "Task description",
      dueDate: "Due Date",
      priority: "Priority",
      cancel: "Cancel",
      save: "Save",
      highPriority: "High Priority",
      mediumPriority: "Medium Priority",
      lowPriority: "Low Priority",
      highBadge: "🔥 High",
      mediumBadge: "👷 Medium",
      lowBadge: "🌱 Low",
      duePrefix: "Due",
      emptyView: "No tasks in this view.",
      clearConfirm: "Clear all tasks and reset game progress?",
      importSuccess: "Import successful!",
      invalidFile: "Invalid file.",
      complete3Tasks: "Complete 3 tasks today",
      complete1High: "Complete 1 high-priority task",
      complete2Medium: "Complete 2 medium tasks",
      rewardPrefix: "Reward",
      day: "day",
      days: "days",
      levelShort: "Lv",
      allLabel: "All",
      todayLabel: "Today",
      weekLabel: "This Week",
      monthLabel: "This Month",
      starter: "Starter",
      taskRookie: "Task Rookie",
      consistentWorker: "Consistent Worker",
      productivityPro: "Productivity Pro",
      taskMaster: "Task Master",
      elitePlanner: "Elite Planner",
      taskLegend: "Task Legend",
      dangerZone: "Danger Zone",
      clearCompleted: "Clear Completed",
      clearCompletedConfirm: "Clear all completed tasks?",
      notesLabel: "Notes",
      addNotes: "+ Add Notes",
      optionalNotesPlaceholder: "Optional notes...",
      achievements: "Achievements",
      weeklyProgress: "Weekly Progress",
      earnedStatus: "Earned",
      lockedStatus: "Locked",
      challengeCompleteStatus: "Complete",
      challengeInProgressStatus: "In progress",
      badgeFirstTask: "First Step",
      badgeFirstTaskDesc: "Complete your first task",
      badgeEarlyBird: "Early Bird",
      badgeEarlyBirdDesc: "Complete 5 tasks total",
      badgeTaskStreak: "On Fire",
      badgeTaskStreakDesc: "Reach a 5-day streak",
      badgeCentury: "Century",
      badgeCenturyDesc: "Complete 100 tasks total",
      badgePriorityKing: "Priority King",
      badgePriorityKingDesc: "Complete 10 high-priority tasks",
      badgeSpeedRunner: "Speed Runner",
      badgeSpeedRunnerDesc: "Complete 5 tasks on or before due date",
      badgePolyglot: "Polyglot",
      badgePolyglotDesc: "Use both languages",
      badgeNightOwl: "Night Owl",
      badgeNightOwlDesc: "Enable dark mode",
      tabTasks: "Tasks",
      tabHabits: "Habits",
      tabStats: "Stats",
      habitsTitle: "Daily Habits",
      habitsSubtitle: "Your daily routines",
      habitsDoneLabel: " done",
      addHabitPlaceholder: "New habit name...",
      addHabitBtn: "Add",
      addHabitHint: "Reminders only fire while this page is open",
      habitEmojiPlaceholder: "🌟",
      habitEmojiLabel: "Habit emoji",
      habitReminderLabel: "Optional reminder time",
      reminderAction: "Reminder",
      habitMarkDone: "Mark habit as done",
      habitMarkNotDone: "Mark habit as not done",
      deleteHabit: "Delete",
      closeReminder: "Dismiss reminder",
      noHabits: "No habits yet — add one below!",
      reminderSet: "⏰ Reminder set!",
      reminderCleared: "Reminder cleared.",
      notifPermDenied: "Notifications blocked. Enable them in browser settings.",
      notifBody: "Time to: ",
      quotes: [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
        { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
        { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
        { text: "Small daily improvements are the key to long-term results.", author: "Unknown" }
      ]
    },
    es: {
      appLanguage: "es",
      eyebrow: "Mantente organizado",
      settings: "Configuración",
      settingsMenu: "Menú de configuración",
      darkMode: "Modo oscuro",
      language: "Idioma",
      themes: "Temas",
      themeColor: "Color del tema",
      dataManagement: "Gestión de datos",
      exportData: "Exportar datos (.json)",
      importData: "Importar datos",
      editModeOn: "Modo edición: ACTIVADO",
      editModeOff: "Modo edición: DESACTIVADO",
      tasksLeft: "Tareas pendientes",
      completed: "Completadas",
      taskProgress: "Progreso de tareas",
      playerRank: "Rango del jugador",
      progressSummary: "Resumen de progreso",
      level: "Nivel",
      xpProgress: "Progreso XP",
      coins: "Monedas",
      streak: "Racha",
      doneToday: "Hechas hoy",
      rewardLow: "Baja: +10 XP / +2 monedas",
      rewardMedium: "Media: +20 XP / +4 monedas",
      rewardHigh: "Alta: +35 XP / +7 monedas",
      dailyChallenges: "Retos diarios",
      todayMissions: "Misiones de hoy",
      addTaskPlaceholder: "Agregar una nueva tarea...",
      addTask: "Agregar tarea",
      reset: "Reiniciar",
      searchPlaceholder: "Buscar tareas...",
      all: "Todas",
      today: "Hoy",
      week: "Semana",
      month: "Mes",
      todo: "Por hacer",
      completedHeading: "Completadas",
      editTask: "Editar tarea",
      task: "Tarea",
      markTaskComplete: "Marcar como completada",
      markTaskIncomplete: "Marcar como pendiente",
      deleteTask: "Eliminar tarea",
      taskDescriptionPlaceholder: "Descripción de la tarea",
      dueDate: "Fecha límite",
      priority: "Prioridad",
      cancel: "Cancelar",
      save: "Guardar",
      highPriority: "Prioridad alta",
      mediumPriority: "Prioridad media",
      lowPriority: "Prioridad baja",
      highBadge: "🔥 Alta",
      mediumBadge: "👷 Media",
      lowBadge: "🌱 Baja",
      duePrefix: "Vence",
      emptyView: "No hay tareas en esta vista.",
      clearConfirm: "¿Borrar todas las tareas y reiniciar el progreso del juego?",
      importSuccess: "¡Importación exitosa!",
      invalidFile: "Archivo inválido.",
      complete3Tasks: "Completa 3 tareas hoy",
      complete1High: "Completa 1 tarea de prioridad alta",
      complete2Medium: "Completa 2 tareas medias",
      rewardPrefix: "Recompensa",
      day: "día",
      days: "días",
      levelShort: "Nv",
      allLabel: "Todas",
      todayLabel: "Hoy",
      weekLabel: "Esta semana",
      monthLabel: "Este mes",
      starter: "Inicial",
      taskRookie: "Novato de tareas",
      consistentWorker: "Trabajador constante",
      productivityPro: "Pro de productividad",
      taskMaster: "Maestro de tareas",
      elitePlanner: "Planificador élite",
      taskLegend: "Leyenda de tareas",
      dangerZone: "Zona de peligro",
      clearCompleted: "Borrar completadas",
      clearCompletedConfirm: "¿Eliminar todas las tareas completadas?",
      notesLabel: "Notas",
      addNotes: "+ Agregar notas",
      optionalNotesPlaceholder: "Notas opcionales...",
      achievements: "Logros",
      weeklyProgress: "Progreso semanal",
      earnedStatus: "Conseguido",
      lockedStatus: "Bloqueado",
      challengeCompleteStatus: "Completado",
      challengeInProgressStatus: "En progreso",
      badgeFirstTask: "Primer paso",
      badgeFirstTaskDesc: "Completa tu primera tarea",
      badgeEarlyBird: "Madrugador",
      badgeEarlyBirdDesc: "Completa 5 tareas en total",
      badgeTaskStreak: "En llamas",
      badgeTaskStreakDesc: "Alcanza una racha de 5 días",
      badgeCentury: "Centenario",
      badgeCenturyDesc: "Completa 100 tareas en total",
      badgePriorityKing: "Rey de prioridades",
      badgePriorityKingDesc: "Completa 10 tareas de alta prioridad",
      badgeSpeedRunner: "Corredor veloz",
      badgeSpeedRunnerDesc: "Completa 5 tareas antes de su fecha límite",
      badgePolyglot: "Políglota",
      badgePolyglotDesc: "Usa ambos idiomas",
      badgeNightOwl: "Noctámbulo",
      badgeNightOwlDesc: "Activa el modo oscuro",
      tabTasks: "Tareas",
      tabHabits: "Hábitos",
      tabStats: "Stats",
      habitsTitle: "Hábitos diarios",
      habitsSubtitle: "Tus rutinas diarias",
      habitsDoneLabel: " hechos",
      addHabitPlaceholder: "Nombre del hábito...",
      addHabitBtn: "Agregar",
      addHabitHint: "Los recordatorios solo funcionan con la página abierta",
      habitEmojiPlaceholder: "🌟",
      habitEmojiLabel: "Emoji del hábito",
      habitReminderLabel: "Hora de recordatorio opcional",
      reminderAction: "Recordatorio",
      habitMarkDone: "Marcar hábito como hecho",
      habitMarkNotDone: "Marcar hábito como no hecho",
      deleteHabit: "Eliminar",
      closeReminder: "Cerrar recordatorio",
      noHabits: "¡Sin hábitos aún — agrega uno abajo!",
      reminderSet: "⏰ ¡Recordatorio establecido!",
      reminderCleared: "Recordatorio eliminado.",
      notifPermDenied: "Notificaciones bloqueadas. Actívalas en la configuración del navegador.",
      notifBody: "Hora de: ",
      quotes: [
        { text: "El secreto para avanzar es empezar.", author: "Mark Twain" },
        { text: "Siempre parece imposible hasta que se hace.", author: "Nelson Mandela" },
        { text: "La calidad no es un acto, es un hábito.", author: "Aristóteles" },
        { text: "Enfócate en ser productivo en vez de estar ocupado.", author: "Tim Ferriss" },
        { text: "La acción es la base fundamental de todo éxito.", author: "Pablo Picasso" },
        { text: "Las pequeñas mejoras diarias son la clave para los grandes resultados.", author: "Desconocido" }
      ]
    }
  };

  const taskInput = document.getElementById("taskInput");
  const dueDateInput = document.getElementById("dueDateInput");
  const priorityInput = document.getElementById("priorityInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const resetBtn = document.getElementById("resetBtn");
  const searchInput = document.getElementById("searchInput");

  const todoList = document.getElementById("todoList");
  const completedList = document.getElementById("completedList");
  const tasksLeft = document.getElementById("tasksLeft");
  const tasksCompleted = document.getElementById("tasksCompleted");
  const progressPercent = document.getElementById("progressPercent");
  const progressFill = document.getElementById("progressFill");
  const todoHeading = document.getElementById("todoHeading");
  const completedHeading = document.getElementById("completedHeading");
  const clearCompletedBtn = document.getElementById("clearCompletedBtn");

  const todayDate = document.getElementById("todayDate");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const themeSelect = document.getElementById("themeSelect");
  const languageSelect = document.getElementById("languageSelect");
  const exportBtn = document.getElementById("exportBtn");
  const importFile = document.getElementById("importFile");
  const editModeToggle = document.getElementById("editModeToggle");

  const editModal = document.getElementById("editModal");
  const editTextInput = document.getElementById("editTextInput");
  const editDateInput = document.getElementById("editDateInput");
  const editPriorityInput = document.getElementById("editPriorityInput");
  const editSaveBtn = document.getElementById("editSaveBtn");
  const editCancelBtn = document.getElementById("editCancelBtn");
  const editNotesInput = document.getElementById("editNotesInput");
  const notesToggle = document.getElementById("notesToggle");
  const notesArea = document.getElementById("notesArea");
  const notesInput = document.getElementById("notesInput");
  let modalReturnFocus = null;

  const levelCard = document.getElementById("levelCard");
  const levelToggle = document.getElementById("levelToggle");
  const challengeCard = document.getElementById("challengeCard");
  const challengeToggle = document.getElementById("challengeToggle");

  const playerLevel = document.getElementById("playerLevel");
  const miniPlayerLevel = document.getElementById("miniPlayerLevel");
  const rankTitle = document.getElementById("rankTitle");
  const xpProgressText = document.getElementById("xpProgressText");
  const miniXpProgressText = document.getElementById("miniXpProgressText");
  const xpFill = document.getElementById("xpFill");
  const collapsedXpFill = document.getElementById("collapsedXpFill");
  const playerCoins = document.getElementById("playerCoins");
  const playerStreak = document.getElementById("playerStreak");
  const doneToday = document.getElementById("doneToday");
  const challengeList = document.getElementById("challengeList");
  const challengeCount = document.getElementById("challengeCount");

  const viewButtons = document.querySelectorAll(".view-btn");
  const quoteContent = document.querySelector(".quote-content");
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");

  function safeParse(value, fallback) {
    if (value === null || value === undefined || value === "") return fallback;
    try {
      const parsed = JSON.parse(value);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  const State = {
    tasks: sanitizeTasks(safeParse(localStorage.getItem(STORAGE_KEY), [])),
    player: sanitizePlayer(safeParse(localStorage.getItem(PLAYER_KEY), defaultPlayer())),
    habits: sanitizeHabits(safeParse(localStorage.getItem(HABITS_KEY), null)),
    view: "all",
    searchQuery: "",
    editMode: safeParse(localStorage.getItem("editMode"), false),
    editingTaskId: null,
    language: localStorage.getItem(LANG_KEY) || "en",
    listeners: [],
    subscribe(listener) {
      this.listeners.push(listener);
    },
    notify() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
      localStorage.setItem(PLAYER_KEY, JSON.stringify(this.player));
      localStorage.setItem(HABITS_KEY, JSON.stringify(this.habits));
      localStorage.setItem(LANG_KEY, this.language);
      this.listeners.forEach((listener) => listener(this));
    },
    addTask(task) {
      this.tasks.unshift(task);
      this.notify();
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.notify();
    },
    toggleTask(id) {
  const task = this.tasks.find((item) => item.id === id);
  if (!task) return;

  if (task.completed) {
    task.completed = false;
    task.completedAt = null;
  } else {
    task.completed = true;
    task.completedAt = new Date().toISOString();

    if (!task.rewardGranted) {
      rewardForCompletion(task);
      task.rewardGranted = true;
    }
  }

  this.notify();
},
    updateTask(id, updates) {
      this.tasks = this.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              priority: normalizePriority(updates.priority ?? task.priority)
            }
          : task
      );
      this.notify();
    },
    reorderTasks(draggedId, targetId) {
      const draggedIndex = this.tasks.findIndex((task) => task.id === draggedId);
      const targetIndex = this.tasks.findIndex((task) => task.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        return;
      }

      const [draggedItem] = this.tasks.splice(draggedIndex, 1);
      this.tasks.splice(targetIndex, 0, draggedItem);
      this.notify();
    },
    setView(view) {
      this.view = view;
      this.notify();
    },
    setSearch(query) {
      this.searchQuery = query.trim().toLowerCase();
      this.notify();
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      localStorage.setItem("editMode", JSON.stringify(this.editMode));
      this.notify();
    },
    setLanguage(language) {
      this.language = language;
      this.notify();
    },
    resetAllData() {
      this.tasks = [];
      this.player = defaultPlayer();
      this.habits = sanitizeHabits(null);
      this.notify();
    },
    clearCompleted() {
      this.tasks = this.tasks.filter((task) => !task.completed);
      this.notify();
    },
    addHabit(habit) {
      this.habits.push(habit);
      this.notify();
    },
    toggleHabit(id) {
      const habit = this.habits.find((h) => h.id === id);
      if (!habit) return;
      const today = getTodayString();
      const doneToday = habit.completedDates.includes(today);
      if (!doneToday) {
        habit.completedDates.push(today);
        const yesterday = getYesterdayString();
        if (habit.lastCompletedDate === yesterday) {
          habit.streak += 1;
        } else if (habit.lastCompletedDate !== today) {
          habit.streak = 1;
        }
        habit.lastCompletedDate = today;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cutoffStr = cutoff.toISOString().slice(0, 10);
        habit.completedDates = habit.completedDates.filter((d) => d >= cutoffStr);
        addXpAndCoins(5, 1);
        showToast(5, 1);
      } else {
        habit.completedDates = habit.completedDates.filter((d) => d !== today);
        if (habit.streak > 0) habit.streak -= 1;
        habit.lastCompletedDate = habit.completedDates.length > 0
          ? habit.completedDates[habit.completedDates.length - 1]
          : null;
      }
      this.notify();
    },
    deleteHabit(id) {
      this.habits = this.habits.filter((h) => h.id !== id);
      this.notify();
    },
    setHabitReminder(id, time) {
      const habit = this.habits.find((h) => h.id === id);
      if (!habit) return;
      habit.reminderTime = time || null;
      this.notify();
    }
  };

  const priorityMeta = {
    high: { css: "high", xp: 35, coins: 7 },
    medium: { css: "medium", xp: 20, coins: 4 },
    low: { css: "low", xp: 10, coins: 2 }
  };

  const BADGE_DEFINITIONS = [
    {
      id: "first_task",
      emoji: "🌱",
      nameKey: "badgeFirstTask",
      descKey: "badgeFirstTaskDesc",
      check: (p) => p.totalCompleted >= 1
    },
    {
      id: "early_bird",
      emoji: "🐦",
      nameKey: "badgeEarlyBird",
      descKey: "badgeEarlyBirdDesc",
      check: (p) => p.totalCompleted >= 5
    },
    {
      id: "task_streak",
      emoji: "🔥",
      nameKey: "badgeTaskStreak",
      descKey: "badgeTaskStreakDesc",
      check: (p) => p.streak >= 5
    },
    {
      id: "century",
      emoji: "💯",
      nameKey: "badgeCentury",
      descKey: "badgeCenturyDesc",
      check: (p) => p.totalCompleted >= 100
    },
    {
      id: "priority_king",
      emoji: "👑",
      nameKey: "badgePriorityKing",
      descKey: "badgePriorityKingDesc",
      check: (p, tasks) => tasks.filter((t) => t.completed && t.priority === "high").length >= 10
    },
    {
      id: "speed_runner",
      emoji: "⚡",
      nameKey: "badgeSpeedRunner",
      descKey: "badgeSpeedRunnerDesc",
      check: (p, tasks) =>
        tasks.filter(
          (t) => t.completed && t.dueDate && t.completedAt && t.completedAt.slice(0, 10) <= t.dueDate
        ).length >= 5
    },
    {
      id: "polyglot",
      emoji: "🌍",
      nameKey: "badgePolyglot",
      descKey: "badgePolyglotDesc",
      check: (p) => p.usedBothLanguages === true
    },
    {
      id: "night_owl",
      emoji: "🦉",
      nameKey: "badgeNightOwl",
      descKey: "badgeNightOwlDesc",
      check: (p) => p.usedDarkMode === true
    }
  ];

  function t(key) {
    return translations[State.language][key];
  }

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
    return ["high", "medium", "low"].includes(priority) ? priority : "medium";
  }

 function sanitizeTasks(rawTasks) {
  if (!Array.isArray(rawTasks)) return [];

  return rawTasks
    .map((task, index) => ({
      id: String(task.id ?? `${Date.now()}-${index}`),
      text: String(task.text ?? "").trim(),
      completed: Boolean(task.completed),
      completedAt: task.completedAt || null,
      dueDate: task.dueDate || null,
      priority: normalizePriority(task.priority),
      createdAt: task.createdAt || new Date().toISOString(),
      notes: String(task.notes ?? "").trim(),
      rewardGranted: Boolean(task.rewardGranted)
    }))
    .filter((task) => task.text !== "");
}

  function sanitizePlayer(player) {
    return {
      ...defaultPlayer(),
      ...player
    };
  }

  function sanitizeHabits(rawHabits) {
    if (!Array.isArray(rawHabits)) {
      return DEFAULT_HABITS.map((h, i) => ({
        id: `default-${i}`,
        name: h.name,
        emoji: h.emoji,
        reminderTime: null,
        completedDates: [],
        streak: 0,
        lastCompletedDate: null
      }));
    }
    return rawHabits
      .map((h, i) => ({
        id: String(h.id ?? `habit-${Date.now()}-${i}`),
        name: String(h.name ?? "").trim(),
        emoji: String(h.emoji ?? "🌟").trim() || "🌟",
        reminderTime: h.reminderTime || null,
        completedDates: Array.isArray(h.completedDates) ? h.completedDates : [],
        streak: Number(h.streak ?? 0),
        lastCompletedDate: h.lastCompletedDate || null
      }))
      .filter((h) => h.name !== "");
  }

  function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getYesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function parseDateOnly(dateString) {
    return new Date(`${dateString}T00:00:00`);
  }

  function isInCurrentWeek(dateString) {
    const today = startOfToday();
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const due = parseDateOnly(dateString);
    return due >= today && due <= weekEnd;
  }

  function isInCurrentMonth(dateString) {
    const today = startOfToday();
    const due = parseDateOnly(dateString);
    return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();
  }

  function setDateConstraints() {
    const today = getTodayString();
    dueDateInput.min = today;
    editDateInput.min = today;
  }

  function formatHeaderDate() {
    const locale = State.language === "es" ? "es-ES" : "en-US";
    const dateOptions = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    todayDate.textContent = new Date().toLocaleDateString(locale, dateOptions);

    const greetingEl = document.getElementById("greetingText");
    if (greetingEl) {
      const hour = new Date().getHours();
      if (State.language === "es") {
        greetingEl.textContent = hour < 12 ? "¡Buenos días!" : hour < 18 ? "¡Buenas tardes!" : "¡Buenas noches!";
      } else {
        greetingEl.textContent = hour < 12 ? "Good morning!" : hour < 18 ? "Good afternoon!" : "Good evening!";
      }
    }
  }

  function updateEditModeUI() {
    editModeToggle.textContent = State.editMode ? t("editModeOn") : t("editModeOff");
    editModeToggle.classList.toggle("edit-mode-active", State.editMode);
    editModeToggle.setAttribute("aria-pressed", String(State.editMode));
  }

  function applyTheme(theme) {
    document.body.classList.remove(...THEME_CLASSES);
    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }

    const isDark = safeParse(localStorage.getItem("darkMode"), false) === true;
    document.body.classList.toggle("dark-mode", isDark);
    darkModeToggle.checked = isDark;
  }

  function updateStaticTranslations() {
    document.documentElement.lang = t("appLanguage");
    document.getElementById("eyebrowText").textContent = t("eyebrow");
    document.getElementById("settingsHeaderText").textContent = t("settings");
    settingsBtn.setAttribute("aria-label", t("settingsMenu"));
    document.getElementById("darkModeLabel").textContent = t("darkMode");
    document.getElementById("languageLabel").textContent = t("language");
    document.getElementById("themesHeaderText").textContent = t("themes");
    document.getElementById("themeColorLabel").textContent = t("themeColor");
    document.getElementById("dataHeaderText").textContent = t("dataManagement");
    exportBtn.textContent = t("exportData");
    document.getElementById("importBtnText").textContent = t("importData");

    document.getElementById("tasksLeftLabel").textContent = t("tasksLeft");
    document.getElementById("tasksCompletedLabel").textContent = t("completed");
    document.getElementById("taskProgressLabel").textContent = t("taskProgress");

    document.getElementById("playerRankMiniLabel").textContent = t("playerRank");
    document.getElementById("playerRankExpandedLabel").textContent = t("playerRank");
    document.getElementById("progressSummaryLabel").textContent = t("progressSummary");
    document.getElementById("levelLabel").textContent = t("level");
    document.getElementById("xpProgressLabel").textContent = t("xpProgress");
    document.getElementById("coinsLabel").textContent = t("coins");
    document.getElementById("streakLabel").textContent = t("streak");
    document.getElementById("doneTodayLabel").textContent = t("doneToday");
    document.getElementById("rewardLow").textContent = t("rewardLow");
    document.getElementById("rewardMedium").textContent = t("rewardMedium");
    document.getElementById("rewardHigh").textContent = t("rewardHigh");

    document.getElementById("dailyChallengesLabel").textContent = t("dailyChallenges");
    document.getElementById("todayMissionsLabel").textContent = t("todayMissions");

    taskInput.placeholder = t("addTaskPlaceholder");
    taskInput.setAttribute("aria-label", t("task"));
    dueDateInput.setAttribute("aria-label", t("dueDate"));
    priorityInput.setAttribute("aria-label", t("priority"));
    searchInput.placeholder = t("searchPlaceholder");
    searchInput.setAttribute("aria-label", t("searchPlaceholder"));
    editTextInput.placeholder = t("taskDescriptionPlaceholder");

    addTaskBtn.textContent = t("addTask");
    resetBtn.textContent = t("reset");
    document.getElementById("dangerZoneHeaderText").textContent = t("dangerZone");
    clearCompletedBtn.textContent = t("clearCompleted");
    document.getElementById("achievementsHeaderText") && (document.getElementById("achievementsHeaderText").textContent = t("achievements"));
    document.getElementById("analyticsHeaderText") && (document.getElementById("analyticsHeaderText").textContent = t("weeklyProgress"));

    document.getElementById("viewAllBtn").textContent = t("all");
    document.getElementById("viewTodayBtn").textContent = t("today");
    document.getElementById("viewWeekBtn").textContent = t("week");
    document.getElementById("viewMonthBtn").textContent = t("month");

    document.getElementById("editTaskTitle").textContent = t("editTask");
    document.getElementById("editTaskLabel").textContent = t("task");
    document.getElementById("editDueDateLabel").textContent = t("dueDate");
    document.getElementById("editPriorityLabel").textContent = t("priority");
    editCancelBtn.textContent = t("cancel");
    editSaveBtn.textContent = t("save");
    document.getElementById("editNotesLabel").textContent = t("notesLabel");
    editNotesInput.placeholder = t("optionalNotesPlaceholder");
    document.getElementById("notesToggleLabel").textContent = t("addNotes");
    notesInput.placeholder = t("optionalNotesPlaceholder");
    notesInput.setAttribute("aria-label", t("notesLabel"));

    priorityInput.options[0].text = t("highPriority");
    priorityInput.options[1].text = t("mediumPriority");
    priorityInput.options[2].text = t("lowPriority");

    editPriorityInput.options[0].text = t("highPriority");
    editPriorityInput.options[1].text = t("mediumPriority");
    editPriorityInput.options[2].text = t("lowPriority");

    const tabTasksLabel = document.getElementById("tabTasksLabel");
    const tabHabitsLabel = document.getElementById("tabHabitsLabel");
    const tabStatsLabel = document.getElementById("tabStatsLabel");
    if (tabTasksLabel) tabTasksLabel.textContent = t("tabTasks");
    if (tabHabitsLabel) tabHabitsLabel.textContent = t("tabHabits");
    if (tabStatsLabel) tabStatsLabel.textContent = t("tabStats");

    const habitsTitleEl = document.getElementById("habitsTitle");
    const habitsSubtitleEl = document.getElementById("habitsSubtitle");
    const addHabitHintEl = document.getElementById("addHabitHint");
    const habitNameInputEl = document.getElementById("habitNameInput");
    const habitEmojiInputEl = document.getElementById("habitEmojiInput");
    const habitReminderInputEl = document.getElementById("habitReminderInput");
    const addHabitBtnEl = document.getElementById("addHabitBtn");
    const reminderBannerCloseEl = document.getElementById("reminderBannerClose");
    if (habitsTitleEl) habitsTitleEl.textContent = t("habitsTitle");
    if (habitsSubtitleEl) habitsSubtitleEl.textContent = t("habitsSubtitle");
    if (addHabitHintEl) addHabitHintEl.textContent = t("addHabitHint");
    if (habitNameInputEl) habitNameInputEl.placeholder = t("addHabitPlaceholder");
    if (habitNameInputEl) habitNameInputEl.setAttribute("aria-label", t("addHabitPlaceholder"));
    if (habitEmojiInputEl) {
      habitEmojiInputEl.placeholder = t("habitEmojiPlaceholder");
      habitEmojiInputEl.setAttribute("aria-label", t("habitEmojiLabel"));
    }
    if (habitReminderInputEl) {
      habitReminderInputEl.title = t("habitReminderLabel");
      habitReminderInputEl.setAttribute("aria-label", t("habitReminderLabel"));
    }
    if (addHabitBtnEl) addHabitBtnEl.textContent = t("addHabitBtn");
    if (reminderBannerCloseEl) reminderBannerCloseEl.setAttribute("aria-label", t("closeReminder"));

    updateEditModeUI();
    formatHeaderDate();
  }

  function createEmptyState(message) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.setAttribute("role", "status");
    li.textContent = message;
    return li;
  }

  function getRankTitle(level) {
    if (level >= 10) return t("taskLegend");
    if (level >= 8) return t("elitePlanner");
    if (level >= 6) return t("taskMaster");
    if (level >= 4) return t("productivityPro");
    if (level >= 3) return t("consistentWorker");
    if (level >= 2) return t("taskRookie");
    return t("starter");
  }

  function xpNeededForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.2));
  }

  function addXpAndCoins(xp, coins) {
    const levelBefore = State.player.level;
    State.player.xp += xp;
    State.player.coins += coins;

    while (State.player.xp >= xpNeededForLevel(State.player.level)) {
      State.player.xp -= xpNeededForLevel(State.player.level);
      State.player.level += 1;
      State.player.coins += 15;
    }

    if (State.player.level > levelBefore) {
      showLevelUpBanner(State.player.level);
    }
  }

  function showToast(xpGained, coinsGained) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span class="toast-xp">+${xpGained} XP</span><span>·</span><span>+${coinsGained} 🪙</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("toast-exit");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, 2500);
  }

  function showBadgeToast(badge, index) {
    setTimeout(() => {
      const container = document.getElementById("toastContainer");
      const toast = document.createElement("div");
      toast.className = "toast toast-badge";
      toast.innerHTML = `${badge.emoji} <span class="toast-badge-text"><strong>${t(badge.nameKey)}</strong> unlocked!</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("toast-exit");
        toast.addEventListener("animationend", () => toast.remove(), { once: true });
      }, 3500);
    }, index * 120);
  }

  function showLevelUpBanner(newLevel) {
    const banner = document.getElementById("levelUpBanner");
    const levelUpText = document.getElementById("levelUpText");
    const prefix = State.language === "es"
      ? "🎉 ¡Subiste de nivel! Llegaste al nivel "
      : "🎉 Level Up! You reached Level ";
    levelUpText.textContent = `${prefix}${newLevel}!`;
    banner.classList.remove("hidden");
    setTimeout(() => banner.classList.add("hidden"), 3000);
  }

  function checkBadges() {
    const newBadges = [];
    BADGE_DEFINITIONS.forEach((def) => {
      if (!State.player.badges.includes(def.id) && def.check(State.player, State.tasks)) {
        State.player.badges.push(def.id);
        newBadges.push(def);
      }
    });
    newBadges.forEach((badge, index) => showBadgeToast(badge, index));
  }

  function renderBadges() {
    const badgesList = document.getElementById("badgesList");
    const badgesCount = document.getElementById("badgesCount");
    if (!badgesList || !badgesCount) return;

    const earned = State.player.badges;
    badgesCount.textContent = `${earned.length}/${BADGE_DEFINITIONS.length}`;
    badgesList.innerHTML = "";

    BADGE_DEFINITIONS.forEach((def) => {
      const isEarned = earned.includes(def.id);
      const card = document.createElement("div");
      card.className = "badge-card" + (isEarned ? "" : " badge-locked");
      card.title = t(def.descKey);
      card.tabIndex = 0;
      card.setAttribute("role", "group");
      card.setAttribute(
        "aria-label",
        `${t(def.nameKey)}. ${isEarned ? t("earnedStatus") : t("lockedStatus")}. ${t(def.descKey)}`
      );

      const emoji = document.createElement("span");
      emoji.className = "badge-emoji";
      emoji.textContent = def.emoji;

      const name = document.createElement("span");
      name.className = "badge-name";
      name.textContent = t(def.nameKey);

      const status = document.createElement("span");
      status.className = "badge-status";
      status.textContent = isEarned ? t("earnedStatus") : t("lockedStatus");

      card.appendChild(emoji);
      card.appendChild(name);
      card.appendChild(status);
      badgesList.appendChild(card);
    });
  }

  function renderAnalytics() {
    const chart = document.getElementById("analyticsChart");
    if (!chart) return;
    chart.innerHTML = "";
    chart.setAttribute("role", "group");
    chart.setAttribute("aria-label", t("weeklyProgress"));

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const dayAbbr = State.language === "es"
      ? ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"]
      : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const counts = days.map((d) => (State.player.completedByDay || {})[d] || 0);
    const maxCount = Math.max(...counts, 1);

    days.forEach((day, i) => {
      const count = counts[i];
      const pct = (count / maxCount) * 100;
      const date = new Date(day + "T00:00:00");

      const group = document.createElement("div");
      group.className = "analytics-bar-group" + (count === 0 ? " is-zero" : "");
      group.tabIndex = 0;
      group.setAttribute("role", "img");
      group.setAttribute("aria-label", `${dayAbbr[date.getDay()]}: ${count} ${t("completed").toLowerCase()}`);

      const countLabel = document.createElement("span");
      countLabel.className = "analytics-bar-count";
      countLabel.textContent = count;

      const track = document.createElement("div");
      track.className = "analytics-bar-track";
      track.setAttribute("aria-hidden", "true");

      const fill = document.createElement("div");
      fill.className = "analytics-bar-fill";
      fill.style.height = `${pct}%`;

      const label = document.createElement("span");
      label.className = "analytics-bar-label";
      label.textContent = dayAbbr[date.getDay()];

      track.appendChild(fill);
      group.appendChild(countLabel);
      group.appendChild(track);
      group.appendChild(label);
      chart.appendChild(group);
    });
  }

  function switchTab(name) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      const isActive = btn.dataset.tab === name;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${name}`);
    });
    localStorage.setItem(TAB_KEY, name);
  }

  const notifiedThisSession = new Set();

  function checkHabitReminders() {
    if (Notification.permission !== "granted") return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hh}:${mm}`;
    const today = getTodayString();
    State.habits.forEach((habit) => {
      if (!habit.reminderTime || habit.reminderTime !== currentTime) return;
      if (habit.completedDates.includes(today)) return;
      const key = `${habit.id}-${today}-${currentTime}`;
      if (notifiedThisSession.has(key)) return;
      notifiedThisSession.add(key);
      new Notification("TaskFlow", {
        body: `${t("notifBody")}${habit.name} ${habit.emoji}`,
        icon: "favicon.svg"
      });
    });
  }

  function checkHabitResets() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    let changed = false;
    State.habits.forEach((habit) => {
      const before = habit.completedDates.length;
      habit.completedDates = habit.completedDates.filter((d) => d >= cutoffStr);
      if (habit.completedDates.length !== before) changed = true;
    });
    if (changed) State.notify();
  }

  function showReminderBanner(message) {
    const banner = document.getElementById("reminderBanner");
    const text = document.getElementById("reminderBannerText");
    if (!banner || !text) return;
    text.textContent = message;
    banner.classList.remove("hidden");
    setTimeout(() => banner.classList.add("hidden"), 3500);
  }

  function handleSetReminder(habitId, currentTime) {
    const doPrompt = () => {
      const val = prompt(
        State.language === "es"
          ? "Hora del recordatorio (HH:MM) o vacío para eliminar:"
          : "Reminder time (HH:MM) or empty to clear:",
        currentTime || ""
      );
      if (val === null) return;
      const trimmed = val.trim();
      if (trimmed && !/^\d{2}:\d{2}$/.test(trimmed)) return;
      State.setHabitReminder(habitId, trimmed);
      showReminderBanner(trimmed ? t("reminderSet") : t("reminderCleared"));
    };

    if (typeof Notification === "undefined") {
      doPrompt();
      return;
    }
    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "denied") {
          showReminderBanner(t("notifPermDenied"));
        } else {
          doPrompt();
        }
      });
    } else if (Notification.permission === "denied") {
      showReminderBanner(t("notifPermDenied"));
    } else {
      doPrompt();
    }
  }

  function buildHabitElement(habit) {
    const today = getTodayString();
    const doneToday = habit.completedDates.includes(today);

    const card = document.createElement("div");
    card.className = "habit-card" + (doneToday ? " habit-done" : "");
    card.dataset.id = habit.id;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "habit-toggle" + (doneToday ? " done" : "");
    toggle.setAttribute("aria-label", doneToday ? t("habitMarkNotDone") : t("habitMarkDone"));
    toggle.setAttribute("aria-pressed", String(doneToday));
    toggle.textContent = doneToday ? "✓" : "";
    toggle.addEventListener("click", () => State.toggleHabit(habit.id));

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "habit-emoji";
    emojiSpan.textContent = habit.emoji;

    const info = document.createElement("div");
    info.className = "habit-info";

    const name = document.createElement("span");
    name.className = "habit-name" + (doneToday ? " done-text" : "");
    name.textContent = habit.name;
    info.appendChild(name);

    if (habit.streak >= 2) {
      const streak = document.createElement("span");
      streak.className = "habit-streak";
      streak.textContent = `🔥 ${habit.streak} ${State.language === "es" ? "días" : "days"}`;
      info.appendChild(streak);
    }

    const meta = document.createElement("div");
    meta.className = "habit-meta";

    const reminderBtn = document.createElement("button");
    reminderBtn.type = "button";
    reminderBtn.className = "habit-reminder-btn";
    reminderBtn.title = habit.reminderTime
      ? (State.language === "es" ? `Recordatorio: ${habit.reminderTime}` : `Reminder: ${habit.reminderTime}`)
      : (State.language === "es" ? "Establecer recordatorio" : "Set reminder");
    reminderBtn.setAttribute("aria-label", reminderBtn.title);
    reminderBtn.textContent = habit.reminderTime ? `⏰ ${habit.reminderTime}` : `⏰ ${t("reminderAction")}`;
    reminderBtn.addEventListener("click", () => handleSetReminder(habit.id, habit.reminderTime));
    meta.appendChild(reminderBtn);

    if (State.editMode) {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "habit-delete-btn";
      deleteBtn.textContent = t("deleteHabit");
      deleteBtn.setAttribute("aria-label", `${t("deleteHabit")}: ${habit.name}`);
      deleteBtn.addEventListener("click", () => State.deleteHabit(habit.id));
      meta.appendChild(deleteBtn);
    }

    card.appendChild(toggle);
    card.appendChild(emojiSpan);
    card.appendChild(info);
    card.appendChild(meta);
    return card;
  }

  function renderHeroCard(todoCount, streak) {
    const heroTitle = document.getElementById("heroTitle");
    const heroSub = document.getElementById("heroSub");
    const heroDeco = document.querySelector(".hero-card-deco");
    if (!heroTitle) return;

    if (todoCount === 0) {
      heroTitle.textContent = State.language === "es" ? "¡Todo listo! 🎉" : "All done! 🎉";
      heroSub.textContent = State.language === "es" ? "¡Completaste todo hoy!" : "You crushed it today!";
      if (heroDeco) heroDeco.textContent = "🏆";
    } else {
      heroTitle.textContent = State.language === "es"
        ? `${todoCount} tarea${todoCount !== 1 ? "s" : ""} pendiente${todoCount !== 1 ? "s" : ""}`
        : `${todoCount} task${todoCount !== 1 ? "s" : ""} remaining`;
      heroSub.textContent = streak > 1
        ? `🔥 ${streak}${State.language === "es" ? " días seguidos" : "-day streak!"}`
        : (State.language === "es" ? "¡Hagamos progreso hoy!" : "Let's make progress today!");
      if (heroDeco) heroDeco.textContent = "🎯";
    }
  }

  function renderWeekStrip() {
    const strip = document.getElementById("weekStrip");
    if (!strip) return;
    const today = new Date();
    const todayStr = getTodayString();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayLabelsEs = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const labels = State.language === "es" ? dayLabelsEs : dayLabels;

    strip.innerHTML = labels.map((label, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = d.toISOString().slice(0, 10);
      const isToday = dStr === todayStr;
      const hasTasks = State.tasks.some((t) => !t.completed && t.dueDate === dStr);
      return `<div class="week-day ${isToday ? "week-day-today" : ""}">
        <span class="week-day-label">${label}</span>
        <span class="week-day-num">${d.getDate()}</span>
        ${hasTasks ? '<span class="week-dot"></span>' : '<span class="week-dot-empty"></span>'}
      </div>`;
    }).join("");
  }

  function renderHabits() {
    const habitsList = document.getElementById("habitsList");
    const habitsDoneCount = document.getElementById("habitsDoneCount");
    const habitsTotalCount = document.getElementById("habitsTotalCount");
    const habitsDoneLabelEl = document.getElementById("habitsDoneLabel");
    if (!habitsList) return;

    const today = getTodayString();
    const habits = State.habits;
    const doneCount = habits.filter((h) => h.completedDates.includes(today)).length;

    if (habitsDoneCount) habitsDoneCount.textContent = doneCount;
    if (habitsTotalCount) habitsTotalCount.textContent = habits.length;
    if (habitsDoneLabelEl) habitsDoneLabelEl.textContent = t("habitsDoneLabel");

    habitsList.innerHTML = "";

    if (habits.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.setAttribute("role", "status");
      empty.textContent = t("noHabits");
      habitsList.appendChild(empty);
      return;
    }

    habits.forEach((habit) => {
      habitsList.appendChild(buildHabitElement(habit));
    });
  }

  function updateStreak() {
    const today = getTodayString();
    const lastDate = State.player.lastCompletedDate;

    if (!lastDate) {
      State.player.streak = 1;
      State.player.lastCompletedDate = today;
      return;
    }

    if (lastDate === today) return;

    const last = parseDateOnly(lastDate);
    const current = parseDateOnly(today);
    const diffDays = Math.floor((current - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      State.player.streak += 1;
    } else {
      State.player.streak = 1;
    }

    State.player.lastCompletedDate = today;
  }

  function getDailyChallenges() {
    const today = getTodayString();

    const completedTodayCount = State.tasks.filter(
      (task) => task.completed && task.completedAt && task.completedAt.startsWith(today)
    ).length;

    const highToday = State.tasks.filter(
      (task) => task.completed && task.priority === "high" && task.completedAt && task.completedAt.startsWith(today)
    ).length;

    const mediumToday = State.tasks.filter(
      (task) => task.completed && task.priority === "medium" && task.completedAt && task.completedAt.startsWith(today)
    ).length;

    return [
      {
        id: "daily-3",
        title: t("complete3Tasks"),
        progress: completedTodayCount,
        goal: 3,
        rewardXp: 40,
        rewardCoins: 20
      },
      {
        id: "daily-high",
        title: t("complete1High"),
        progress: highToday,
        goal: 1,
        rewardXp: 30,
        rewardCoins: 15
      },
      {
        id: "daily-medium-2",
        title: t("complete2Medium"),
        progress: mediumToday,
        goal: 2,
        rewardXp: 25,
        rewardCoins: 12
      }
    ];
  }

  function checkChallengeRewards() {
    const today = getTodayString();
    const rewardDate = State.player.challengeRewardedDate || null;

    if (rewardDate !== today) {
      State.player.challengeRewarded = [];
      State.player.challengeRewardedDate = today;
    }

    const challenges = getDailyChallenges();

    challenges.forEach((challenge) => {
      const alreadyRewarded = State.player.challengeRewarded.includes(challenge.id);
      const complete = challenge.progress >= challenge.goal;

      if (complete && !alreadyRewarded) {
        addXpAndCoins(challenge.rewardXp, challenge.rewardCoins);
        State.player.challengeRewarded.push(challenge.id);
      }
    });
  }

  function rewardForCompletion(task) {
    const priority = priorityMeta[normalizePriority(task.priority)];
    let xp = priority.xp;
    let coins = priority.coins;

    if (task.dueDate) {
      const today = getTodayString();
      if (today <= task.dueDate) {
        xp += 10;
      }
    }

    State.player.totalCompleted += 1;
    State.player.completedToday += 1;
    State.player.completedWeek += 1;

    if (State.player.completedToday === 3) {
      xp += 15;
      coins += 5;
    }

    if (State.player.completedToday === 5) {
      xp += 30;
      coins += 10;
    }

    const todayKey = getTodayString();
    if (!State.player.completedByDay) State.player.completedByDay = {};
    State.player.completedByDay[todayKey] = (State.player.completedByDay[todayKey] || 0) + 1;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    Object.keys(State.player.completedByDay).forEach((key) => {
      if (key < cutoffStr) delete State.player.completedByDay[key];
    });

    showToast(xp, coins);
    updateStreak();
    addXpAndCoins(xp, coins);
    checkChallengeRewards();
    checkBadges();
  }

  function normalizeDailyPlayerStats() {
    const today = getTodayString();
    const completedTodayCount = State.tasks.filter(
      (task) => task.completed && task.completedAt && task.completedAt.startsWith(today)
    ).length;

    State.player.completedToday = completedTodayCount;

    const rewardDate = State.player.challengeRewardedDate || null;
    if (rewardDate !== today) {
      State.player.challengeRewarded = [];
      State.player.challengeRewardedDate = today;
    }
  }

  function renderGamification() {
    normalizeDailyPlayerStats();
    checkChallengeRewards();

    const currentLevel = State.player.level;
    const currentRank = getRankTitle(currentLevel);
    const needed = xpNeededForLevel(currentLevel);
    const xpLabel = `${State.player.xp} / ${needed} XP`;
    const xpPercent = Math.min((State.player.xp / needed) * 100, 100);

    playerLevel.textContent = currentLevel;
    miniPlayerLevel.textContent = `${t("levelShort")} ${currentLevel}`;
    rankTitle.textContent = currentRank;
    playerCoins.textContent = State.player.coins;

    const dayWord = State.player.streak === 1 ? t("day") : t("days");
    playerStreak.textContent = `${State.player.streak} ${dayWord}`;
    doneToday.textContent = State.player.completedToday;

    xpProgressText.textContent = xpLabel;
    miniXpProgressText.textContent = xpLabel;
    xpFill.style.width = `${xpPercent}%`;
    collapsedXpFill.style.width = `${xpPercent}%`;
    const roundedXpPercent = Math.round(xpPercent);
    xpFill.parentElement.setAttribute("aria-valuenow", String(roundedXpPercent));
    collapsedXpFill.parentElement.setAttribute("aria-valuenow", String(roundedXpPercent));

    const challenges = getDailyChallenges();
    const completedChallengeCount = challenges.filter((challenge) => challenge.progress >= challenge.goal).length;
    challengeCount.textContent = `${completedChallengeCount}/${challenges.length}`;

    challengeList.innerHTML = "";

    challenges.forEach((challenge) => {
      const isComplete = challenge.progress >= challenge.goal;
      const item = document.createElement("div");
      item.className = "challenge-item" + (isComplete ? " challenge-complete" : "");
      item.setAttribute("role", "group");
      item.setAttribute(
        "aria-label",
        `${challenge.title}. ${Math.min(challenge.progress, challenge.goal)}/${challenge.goal}. ${isComplete ? t("challengeCompleteStatus") : t("challengeInProgressStatus")}`
      );

      const top = document.createElement("div");
      top.className = "challenge-item-top";

      const title = document.createElement("span");
      title.className = "challenge-title";
      title.textContent = challenge.title;

      const progress = document.createElement("span");
      progress.className = "challenge-progress";
      progress.textContent = `${Math.min(challenge.progress, challenge.goal)}/${challenge.goal}`;

      top.appendChild(title);
      top.appendChild(progress);

      const meta = document.createElement("div");
      meta.className = "challenge-meta";
      meta.textContent = `${t("rewardPrefix")}: +${challenge.rewardXp} XP • +${challenge.rewardCoins} ${t("coins").toLowerCase()}`;

      const bar = document.createElement("div");
      bar.className = "challenge-progress-bar";
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", String(challenge.goal));
      bar.setAttribute("aria-valuenow", String(Math.min(challenge.progress, challenge.goal)));
      bar.setAttribute("aria-label", challenge.title);

      const fill = document.createElement("div");
      fill.className = "challenge-progress-fill";
      fill.style.width = `${Math.min((challenge.progress / challenge.goal) * 100, 100)}%`;

      bar.appendChild(fill);
      item.appendChild(top);
      item.appendChild(meta);
      item.appendChild(bar);
      challengeList.appendChild(item);
    });
  }

  function openEditModal(taskId) {
    const task = State.tasks.find((item) => item.id === taskId);
    if (!task) return;

    modalReturnFocus = document.activeElement;
    State.editingTaskId = taskId;
    editTextInput.value = task.text;
    editDateInput.value = task.dueDate || "";
    editPriorityInput.value = normalizePriority(task.priority);
    editNotesInput.value = task.notes || "";

    editModal.classList.remove("hidden");
    editTextInput.focus();
  }

  function closeEditModal() {
    State.editingTaskId = null;
    editModal.classList.add("hidden");
    if (modalReturnFocus && modalReturnFocus.isConnected) {
      modalReturnFocus.focus();
    }
    modalReturnFocus = null;
  }

  function saveEdit() {
    if (!State.editingTaskId) return;

    const newText = editTextInput.value.trim();
    if (!newText) {
      editTextInput.classList.add("input-error");
      editTextInput.focus();
      editTextInput.addEventListener("input", () => editTextInput.classList.remove("input-error"), { once: true });
      return;
    }

    State.updateTask(State.editingTaskId, {
      text: newText,
      dueDate: editDateInput.value || null,
      priority: editPriorityInput.value,
      notes: editNotesInput.value.trim()
    });

    closeEditModal();
  }

  function getPriorityLabel(priority) {
    if (priority === "high") return t("highBadge");
    if (priority === "low") return t("lowBadge");
    return t("mediumBadge");
  }

  function buildTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-card";
    li.draggable = true;
    li.dataset.id = task.id;
    li.dataset.priority = normalizePriority(task.priority);

    if (task.dueDate && !task.completed) {
      const today = getTodayString();
      if (task.dueDate < today) li.classList.add("overdue");
      if (task.dueDate === today) li.classList.add("due-today");
    }

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "task-main";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-btn";
    toggleBtn.type = "button";
    toggleBtn.setAttribute("aria-label", task.completed ? t("markTaskIncomplete") : t("markTaskComplete"));
    toggleBtn.setAttribute("aria-pressed", String(task.completed));
    if (task.completed) toggleBtn.classList.add("completed");
    toggleBtn.addEventListener("click", () => State.toggleTask(task.id));

    const content = document.createElement("div");
    content.className = "task-content";

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    if (task.completed) textSpan.classList.add("completed");
    textSpan.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    if (task.dueDate) {
      const dateSpan = document.createElement("span");
      dateSpan.className = "due-date";
      dateSpan.textContent = `${t("duePrefix")}: ${task.dueDate}`;
      meta.appendChild(dateSpan);
    }

    const prioritySpan = document.createElement("span");
    prioritySpan.className = `priority-badge priority-${normalizePriority(task.priority)}`;
    prioritySpan.textContent = getPriorityLabel(normalizePriority(task.priority));
    meta.appendChild(prioritySpan);

    content.appendChild(textSpan);
    content.appendChild(meta);

    if (task.notes) {
      const notesP = document.createElement("p");
      notesP.className = "task-notes-preview";
      notesP.textContent = task.notes;
      content.appendChild(notesP);
    }

    mainWrapper.appendChild(toggleBtn);
    mainWrapper.appendChild(content);
    li.appendChild(mainWrapper);

    if (State.editMode) {
      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "task-action-btn edit-btn";
      editBtn.type = "button";
      editBtn.textContent = t("editTask");
      editBtn.setAttribute("aria-label", `${t("editTask")}: ${task.text}`);
      editBtn.addEventListener("click", () => openEditModal(task.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "task-action-btn delete-btn";
      deleteBtn.type = "button";
      deleteBtn.textContent = State.language === "es" ? "Eliminar" : "Delete";
      deleteBtn.setAttribute("aria-label", `${t("deleteTask")}: ${task.text}`);
      deleteBtn.addEventListener("click", () => State.deleteTask(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(actions);
    }

    return li;
  }

  function filterTasks(state) {
    return state.tasks.filter((task) => {
      if (state.searchQuery && !task.text.toLowerCase().includes(state.searchQuery)) {
        return false;
      }

      if (state.view === "today") {
        return task.dueDate === getTodayString();
      }

      if (state.view === "week") {
        return task.dueDate ? isInCurrentWeek(task.dueDate) : false;
      }

      if (state.view === "month") {
        return task.dueDate ? isInCurrentMonth(task.dueDate) : false;
      }

      return true;
    });
  }

  function sortTasks(taskList) {
    return [...taskList].sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        const diff = parseDateOnly(a.dueDate).getTime() - parseDateOnly(b.dueDate).getTime();
        if (diff !== 0) return diff;
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }

      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[normalizePriority(a.priority)] - priorityOrder[normalizePriority(b.priority)];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  function render(state) {
    updateStaticTranslations();

    todoList.innerHTML = "";
    completedList.innerHTML = "";

    const filteredTasks = filterTasks(state);
    const todoTasks = sortTasks(filteredTasks.filter((task) => !task.completed));
    const doneTasks = sortTasks(filteredTasks.filter((task) => task.completed));

    todoTasks.forEach((task) => todoList.appendChild(buildTaskElement(task)));
    doneTasks.forEach((task) => completedList.appendChild(buildTaskElement(task)));

    if (todoTasks.length === 0) {
      todoList.appendChild(createEmptyState(t("emptyView")));
    }

    if (doneTasks.length === 0) {
      completedList.appendChild(createEmptyState(t("emptyView")));
    }

    const labels = {
      all: t("allLabel"),
      today: t("todayLabel"),
      week: t("weekLabel"),
      month: t("monthLabel")
    };
    const label = labels[state.view] || t("allLabel");

    todoHeading.textContent = `${t("todo")} (${todoTasks.length})`;
    completedHeading.textContent = `${t("completedHeading")} (${doneTasks.length})`;

    const total = filteredTasks.length;
    const doneCount = doneTasks.length;
    const leftCount = todoTasks.length;
    const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    tasksLeft.textContent = leftCount;
    tasksCompleted.textContent = doneCount;
    progressPercent.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;
    progressFill.parentElement.setAttribute("aria-valuenow", String(percent));

    clearCompletedBtn.disabled = doneTasks.length === 0;
    viewButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.view === state.view));
    });

    renderHeroCard(todoTasks.length, state.player.streak);
    renderWeekStrip();
    renderGamification();
    renderBadges();
    renderAnalytics();
    renderHabits();
    updateQuote(true);
  }

  let searchTimeout;
  let draggedElementId = null;
  let currentQuoteIndex = Math.floor(Math.random() * translations.en.quotes.length);

  function updateQuote(forceInstant = false) {
    const quotes = t("quotes");
    const quote = quotes[currentQuoteIndex % quotes.length];

    if (forceInstant) {
      quoteText.textContent = `"${quote.text}"`;
      quoteAuthor.textContent = `- ${quote.author}`;
      return;
    }

    quoteContent.classList.add("quote-fade-out");
    setTimeout(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      const nextQuote = quotes[currentQuoteIndex];
      quoteText.textContent = `"${nextQuote.text}"`;
      quoteAuthor.textContent = `- ${nextQuote.author}`;
      quoteContent.classList.remove("quote-fade-out");
    }, 400);
  }

  function tryAddTask() {
    const text = taskInput.value.trim();
    if (!text) {
      taskInput.classList.add("input-error");
      taskInput.focus();
      taskInput.addEventListener("input", () => taskInput.classList.remove("input-error"), { once: true });
      return;
    }

    State.addTask({
  id: crypto.randomUUID(),
  text,
  completed: false,
  completedAt: null,
  dueDate: dueDateInput.value || null,
  priority: priorityInput.value || "medium",
  createdAt: new Date().toISOString(),
  notes: notesInput.value.trim(),
  rewardGranted: false
});

    taskInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "medium";
    notesInput.value = "";
    notesArea.classList.add("hidden");
    notesToggle.setAttribute("aria-expanded", "false");
    taskInput.focus();
  }

  notesToggle.addEventListener("click", () => {
    const expanded = notesToggle.getAttribute("aria-expanded") === "true";
    notesToggle.setAttribute("aria-expanded", String(!expanded));
    notesArea.classList.toggle("hidden", expanded);
    if (!expanded) notesInput.focus();
  });

  function setSettingsOpen(isOpen) {
    settingsPanel.classList.toggle("hidden", !isOpen);
    settingsBtn.setAttribute("aria-expanded", String(isOpen));
  }

  settingsBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setSettingsOpen(settingsPanel.classList.contains("hidden"));
  });

  document.addEventListener("click", (event) => {
    if (
      !settingsPanel.classList.contains("hidden") &&
      !settingsPanel.contains(event.target) &&
      !settingsBtn.contains(event.target)
    ) {
      setSettingsOpen(false);
    }
  });

  themeSelect.addEventListener("change", () => {
    localStorage.setItem("theme", themeSelect.value);
    applyTheme(themeSelect.value);
  });

  languageSelect.addEventListener("change", () => {
    State.player.usedBothLanguages = true;
    State.setLanguage(languageSelect.value);
    checkBadges();
    State.notify();
  });

  darkModeToggle.addEventListener("change", () => {
    localStorage.setItem("darkMode", JSON.stringify(darkModeToggle.checked));
    applyTheme(themeSelect.value);
    if (darkModeToggle.checked) {
      State.player.usedDarkMode = true;
      checkBadges();
      State.notify();
    }
  });

  if (levelToggle && levelCard) {
    levelToggle.addEventListener("click", () => {
      levelCard.classList.toggle("collapsed");
      const isExpanded = !levelCard.classList.contains("collapsed");
      levelToggle.setAttribute("aria-expanded", String(isExpanded));
    });
  }

  if (challengeToggle && challengeCard) {
    challengeToggle.addEventListener("click", () => {
      challengeCard.classList.toggle("collapsed");
      const isExpanded = !challengeCard.classList.contains("collapsed");
      challengeToggle.setAttribute("aria-expanded", String(isExpanded));
    });
  }

  const badgesToggle = document.getElementById("badgesToggle");
  const badgesBody = document.getElementById("badgesBody");
  const badgesToggleArrow = document.getElementById("badgesToggleArrow");
  if (badgesToggle && badgesBody) {
    badgesToggle.addEventListener("click", () => {
      const expanded = badgesToggle.getAttribute("aria-expanded") === "true";
      badgesToggle.setAttribute("aria-expanded", String(!expanded));
      badgesBody.classList.toggle("hidden", expanded);
      if (badgesToggleArrow) {
        badgesToggleArrow.style.transform = expanded ? "" : "rotate(180deg)";
      }
    });
  }

  const analyticsToggle = document.getElementById("analyticsToggle");
  const analyticsBody = document.getElementById("analyticsBody");
  const analyticsToggleArrow = document.getElementById("analyticsToggleArrow");
  if (analyticsToggle && analyticsBody) {
    analyticsToggle.addEventListener("click", () => {
      const expanded = analyticsToggle.getAttribute("aria-expanded") === "true";
      analyticsToggle.setAttribute("aria-expanded", String(!expanded));
      analyticsBody.classList.toggle("hidden", expanded);
      if (analyticsToggleArrow) {
        analyticsToggleArrow.style.transform = expanded ? "" : "rotate(180deg)";
      }
    });
  }

  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
  tabButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    btn.addEventListener("keydown", (event) => {
      let targetIndex = null;
      if (event.key === "ArrowRight") targetIndex = (index + 1) % tabButtons.length;
      if (event.key === "ArrowLeft") targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === "Home") targetIndex = 0;
      if (event.key === "End") targetIndex = tabButtons.length - 1;
      if (targetIndex === null) return;
      event.preventDefault();
      tabButtons[targetIndex].focus();
      switchTab(tabButtons[targetIndex].dataset.tab);
    });
  });

  const addHabitBtnEl = document.getElementById("addHabitBtn");
  const habitNameInputEl = document.getElementById("habitNameInput");
  const habitEmojiInputEl = document.getElementById("habitEmojiInput");
  const habitReminderInputEl = document.getElementById("habitReminderInput");

  function tryAddHabit() {
    const name = habitNameInputEl ? habitNameInputEl.value.trim() : "";
    if (!name) {
      if (habitNameInputEl) {
        habitNameInputEl.classList.add("input-error");
        habitNameInputEl.focus();
        habitNameInputEl.addEventListener("input", () => habitNameInputEl.classList.remove("input-error"), { once: true });
      }
      return;
    }
    const emoji = (habitEmojiInputEl ? habitEmojiInputEl.value.trim() : "") || "🌟";
    const reminderTime = (habitReminderInputEl ? habitReminderInputEl.value.trim() : "") || null;
    State.addHabit({
      id: String(Date.now()),
      name,
      emoji,
      reminderTime,
      completedDates: [],
      streak: 0,
      lastCompletedDate: null
    });
    if (habitNameInputEl) habitNameInputEl.value = "";
    if (habitEmojiInputEl) habitEmojiInputEl.value = "";
    if (habitReminderInputEl) habitReminderInputEl.value = "";
  }

  if (addHabitBtnEl) addHabitBtnEl.addEventListener("click", tryAddHabit);
  if (habitNameInputEl) {
    habitNameInputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); tryAddHabit(); }
    });
  }

  const reminderBannerClose = document.getElementById("reminderBannerClose");
  if (reminderBannerClose) {
    reminderBannerClose.addEventListener("click", () => {
      document.getElementById("reminderBanner").classList.add("hidden");
    });
  }

  const uploadLabel = document.querySelector(".upload-label");
  if (uploadLabel) {
    uploadLabel.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        importFile.click();
      }
    });
  }

  addTaskBtn.addEventListener("click", tryAddTask);

  [taskInput, dueDateInput, priorityInput].forEach((element) => {
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        tryAddTask();
      }
    });
  });

  resetBtn.addEventListener("click", () => {
    if (confirm(t("clearConfirm"))) {
      State.resetAllData();
    }
  });

  clearCompletedBtn.addEventListener("click", () => {
    if (confirm(t("clearCompletedConfirm"))) {
      State.clearCompleted();
    }
  });

  searchInput.addEventListener("input", (event) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => State.setSearch(event.target.value), 250);
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      viewButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      State.setView(button.dataset.view);
    });
  });

  document.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".task-card");
    if (!card) return;

    draggedElementId = card.dataset.id;
    card.classList.add("dragging");
  });

  document.addEventListener("dragend", (event) => {
    const card = event.target.closest(".task-card");
    if (!card) return;

    card.classList.remove("dragging");
    document.querySelectorAll(".drag-over").forEach((element) => element.classList.remove("drag-over"));
    draggedElementId = null;
  });

  document.addEventListener("dragover", (event) => {
    event.preventDefault();
    const targetCard = event.target.closest(".task-card");
    if (!targetCard || targetCard.dataset.id === draggedElementId) return;

    document.querySelectorAll(".drag-over").forEach((element) => element.classList.remove("drag-over"));
    targetCard.classList.add("drag-over");
  });

  document.addEventListener("drop", (event) => {
    event.preventDefault();
    const targetCard = event.target.closest(".task-card");
    if (!targetCard || !draggedElementId) return;

    State.reorderTasks(draggedElementId, targetCard.dataset.id);
  });

  exportBtn.addEventListener("click", () => {
    const exportData = {
      tasks: State.tasks,
      player: State.player,
      habits: State.habits,
      language: State.language
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "taskflow_data.json");
    downloadAnchor.click();
  });

  importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const imported = JSON.parse(loadEvent.target.result);

        if (Array.isArray(imported)) {
          State.tasks = sanitizeTasks(imported);
        } else {
          State.tasks = sanitizeTasks(imported.tasks || []);
          State.player = sanitizePlayer(imported.player || defaultPlayer());
          if (imported.habits) State.habits = sanitizeHabits(imported.habits);
          if (imported.language && translations[imported.language]) {
            State.language = imported.language;
            languageSelect.value = imported.language;
          }
        }

        State.notify();
        alert(t("importSuccess"));
      } catch (error) {
        alert(t("invalidFile"));
      }

      importFile.value = "";
    };
    reader.readAsText(file);
  });

  editModeToggle.addEventListener("click", () => State.toggleEditMode());

  editSaveBtn.addEventListener("click", saveEdit);
  editCancelBtn.addEventListener("click", closeEditModal);

  editModal.addEventListener("click", (event) => {
    if (event.target === editModal) {
      closeEditModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !settingsPanel.classList.contains("hidden")) {
      setSettingsOpen(false);
      settingsBtn.focus();
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
      return;
    }

    if (event.key === "Escape" && !editModal.classList.contains("hidden")) {
      closeEditModal();
      return;
    }

    if (event.key === "Tab" && !editModal.classList.contains("hidden")) {
      const focusable = Array.from(editModal.querySelectorAll("input, select, textarea, button"))
        .filter((element) => !element.disabled);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const validThemes = ["default", "sunset", "mint", "galaxy", "rose", "ocean"];
  const savedTheme = localStorage.getItem("theme") || "default";
  themeSelect.value = validThemes.includes(savedTheme) ? savedTheme : "default";
  languageSelect.value = State.language;
  applyTheme(themeSelect.value);
  setDateConstraints();
  formatHeaderDate();

  const savedTab = localStorage.getItem(TAB_KEY) || "tasks";
  switchTab(savedTab);

  checkHabitResets();
  setInterval(checkHabitReminders, 60000);

  State.subscribe(render);
  render(State);
  setInterval(() => updateQuote(false), 15000);
});
