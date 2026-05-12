document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "taskflow-tasks-v3";
  const PLAYER_KEY = "taskflow-player-v1";
  const LANG_KEY = "taskflow-language-v1";
  const THEME_CLASSES = ["theme-blue", "theme-green", "theme-purple", "theme-fritolay"];

  const translations = {
    en: {
      appLanguage: "en",
      eyebrow: "Stay organized",
      settings: "Settings",
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

  const State = {
    tasks: sanitizeTasks(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []),
    player: sanitizePlayer(JSON.parse(localStorage.getItem(PLAYER_KEY)) || defaultPlayer()),
    view: "all",
    searchQuery: "",
    editMode: JSON.parse(localStorage.getItem("editMode")) || false,
    editingTaskId: null,
    language: localStorage.getItem(LANG_KEY) || "en",
    listeners: [],
    subscribe(listener) {
      this.listeners.push(listener);
    },
    notify() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
      localStorage.setItem(PLAYER_KEY, JSON.stringify(this.player));
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

      if (!task.completed) {
        task.completed = true;
        task.completedAt = new Date().toISOString();
        rewardForCompletion(task);
      } else {
        task.completed = false;
        task.completedAt = null;
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
      this.notify();
    },
    clearCompleted() {
      this.tasks = this.tasks.filter((task) => !task.completed);
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
        notes: String(task.notes ?? "").trim()
      }))
      .filter((task) => task.text !== "");
  }

  function sanitizePlayer(player) {
    return {
      ...defaultPlayer(),
      ...player
    };
  }

  function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
  }

  function updateEditModeUI() {
    editModeToggle.textContent = State.editMode ? t("editModeOn") : t("editModeOff");
    editModeToggle.classList.toggle("edit-mode-active", State.editMode);
  }

  function applyTheme(theme) {
    document.body.classList.remove(...THEME_CLASSES);
    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }

    const isDark = JSON.parse(localStorage.getItem("darkMode")) || false;
    document.body.classList.toggle("dark-mode", isDark);
    darkModeToggle.checked = isDark;
  }

  function updateStaticTranslations() {
    document.documentElement.lang = t("appLanguage");
    document.getElementById("eyebrowText").textContent = t("eyebrow");
    document.getElementById("settingsHeaderText").textContent = t("settings");
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
    searchInput.placeholder = t("searchPlaceholder");
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

    priorityInput.options[0].text = t("highPriority");
    priorityInput.options[1].text = t("mediumPriority");
    priorityInput.options[2].text = t("lowPriority");

    editPriorityInput.options[0].text = t("highPriority");
    editPriorityInput.options[1].text = t("mediumPriority");
    editPriorityInput.options[2].text = t("lowPriority");

    updateEditModeUI();
    formatHeaderDate();
  }

  function createEmptyState(message) {
    const li = document.createElement("li");
    li.className = "empty-state";
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

      const emoji = document.createElement("span");
      emoji.className = "badge-emoji";
      emoji.textContent = def.emoji;

      const name = document.createElement("span");
      name.className = "badge-name";
      name.textContent = t(def.nameKey);

      card.appendChild(emoji);
      card.appendChild(name);
      badgesList.appendChild(card);
    });
  }

  function renderAnalytics() {
    const chart = document.getElementById("analyticsChart");
    if (!chart) return;
    chart.innerHTML = "";

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const dayAbbr = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const counts = days.map((d) => (State.player.completedByDay || {})[d] || 0);
    const maxCount = Math.max(...counts, 1);

    days.forEach((day, i) => {
      const count = counts[i];
      const pct = (count / maxCount) * 100;
      const date = new Date(day + "T00:00:00");

      const group = document.createElement("div");
      group.className = "analytics-bar-group";

      const countLabel = document.createElement("span");
      countLabel.className = "analytics-bar-count";
      countLabel.textContent = count > 0 ? count : "";

      const track = document.createElement("div");
      track.className = "analytics-bar-track";

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

    const challenges = getDailyChallenges();
    const completedChallengeCount = challenges.filter((challenge) => challenge.progress >= challenge.goal).length;
    challengeCount.textContent = `${completedChallengeCount}/${challenges.length}`;

    challengeList.innerHTML = "";

    challenges.forEach((challenge) => {
      const item = document.createElement("div");
      item.className = "challenge-item";

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

      const fill = document.createElement("div");
      fill.className = "challenge-progress-fill";
      fill.style.width = `${Math.min((challenge.progress / challenge.goal) * 100, 100)}%`;

      if (challenge.progress >= challenge.goal) {
        item.classList.add("challenge-complete");
      }

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
    toggleBtn.setAttribute("aria-label", task.completed ? "Mark as incomplete" : "Mark as complete");
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
      editBtn.addEventListener("click", () => openEditModal(task.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "task-action-btn delete-btn";
      deleteBtn.type = "button";
      deleteBtn.textContent = State.language === "es" ? "Eliminar" : "Delete";
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

      return Number(b.id) - Number(a.id);
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

    clearCompletedBtn.disabled = doneTasks.length === 0;

    renderGamification();
    renderBadges();
    renderAnalytics();
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
      id: String(Date.now()),
      text,
      completed: false,
      completedAt: null,
      dueDate: dueDateInput.value || null,
      priority: priorityInput.value || "medium",
      createdAt: new Date().toISOString(),
      notes: notesInput.value.trim()
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

  settingsBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    settingsPanel.classList.toggle("hidden");
  });

  document.addEventListener("click", (event) => {
    if (
      !settingsPanel.classList.contains("hidden") &&
      !settingsPanel.contains(event.target) &&
      !settingsBtn.contains(event.target)
    ) {
      settingsPanel.classList.add("hidden");
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
    if (event.key === "Escape" && !editModal.classList.contains("hidden")) {
      closeEditModal();
    }
  });

  themeSelect.value = localStorage.getItem("theme") || "default";
  languageSelect.value = State.language;
  applyTheme(themeSelect.value);
  setDateConstraints();
  formatHeaderDate();

  State.subscribe(render);
  render(State);
  setInterval(() => updateQuote(false), 15000);
});