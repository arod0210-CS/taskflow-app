import {
  HABITS_KEY,
  LANG_KEY,
  PLAYER_KEY,
  PROJECTS_KEY,
  STORAGE_KEY,
  TAB_KEY,
  THEME_CLASSES
} from "./constants.js";
import {
  defaultPlayer,
  normalizePriority,
  sanitizeCategory,
  sanitizeHabits,
  sanitizePlayer,
  sanitizeTasks
} from "./data.js";
import {
  getTodayString,
  getYesterdayString,
  isInCurrentMonth,
  isInCurrentWeek,
  parseDateOnly
} from "./dates.js";
import { safeParse } from "./storage.js";
import { createDashboard } from "./dashboard.js";
import { createCalendar } from "./calendar.js";
import { createReminderCenter } from "./reminders.js";
import {
  createNextOccurrence,
  formatRecurrence,
  sanitizeRecurrence
} from "./recurrence.js";
import {
  createProjectsUI,
  sanitizeProjects,
  sanitizeTaskProjectReferences
} from "./projects.js";

export function startApp() {

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
      addNotes: "+ Notes & repeat",
      optionalNotesPlaceholder: "Optional notes...",
      repeat: "Repeat",
      doesNotRepeat: "Does not repeat",
      recurrenceDaily: "Daily",
      recurrenceWeekdays: "Every weekday",
      recurrenceWeekly: "Weekly",
      recurrenceMonthly: "Monthly",
      recurrenceCustom: "Custom",
      recurrenceEvery: "Every",
      recurrenceUnit: "Interval unit",
      recurrenceDay: "day",
      recurrenceDays: "days",
      recurrenceWeek: "week",
      recurrenceWeeks: "weeks",
      recurrenceMonth: "month",
      recurrenceMonths: "months",
      recurrenceEnds: "Ends",
      recurrenceNever: "Never",
      recurrenceEndDate: "End date",
      recurringTask: "Recurring task",
      nextOccurrence: "Next occurrence",
      recurrenceNeedsDueDate: "Add a due date to enable recurrence.",
      recurrenceInvalidInterval: "Enter a whole number from 1 to 999.",
      recurrenceInvalidEndDate: "Choose an end date on or after the due date.",
      taskCompletedAnnouncement: "Task completed",
      taskReopenedAnnouncement: "Task reopened",
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
      tabDashboard: "Dashboard",
      tabCalendar: "Calendar",
      calendarEyebrow: "Plan by date",
      calendarTitle: "Calendar",
      calendarSubtitle: "See deadlines and completed work across the month.",
      calendarPreviousMonth: "Previous month",
      calendarNextMonth: "Next month",
      calendarSelectedDate: "Selected date",
      calendarTaskSummary: "{incomplete} open, {completed} completed",
      calendarOpenShort: "open",
      calendarDoneShort: "done",
      calendarIncompleteStatus: "Incomplete",
      calendarCompletedStatus: "Completed",
      calendarOpenTask: "Open task",
      calendarMoreTasks: "+{count} more",
      agendaTitle: "Daily Agenda",
      agendaTaskCount: "{count} tasks",
      agendaIncomplete: "Incomplete",
      agendaCompleted: "Completed",
      agendaNoIncomplete: "No incomplete tasks for this date.",
      agendaNoCompleted: "No completed tasks for this date.",
      agendaAddTask: "Add task for this date",
      dashboardEyebrow: "At a glance",
      dashboardTitle: "Dashboard",
      dashboardSubtitle: "Your priorities and progress for today.",
      dashboardOverview: "Today overview",
      dashboardRemainingToday: "Remaining today",
      dashboardCompletedToday: "Completed today",
      dashboardHabitsMetric: "Habits today",
      dashboardScheduleKicker: "Schedule",
      dashboardUpcoming: "Upcoming Deadlines",
      dashboardPrioritiesKicker: "Priorities",
      dashboardFocus: "Today’s Focus",
      dashboardRoutinesKicker: "Routines",
      dashboardHabitsTitle: "Habits Today",
      dashboardViewHabits: "View Habits",
      dashboardActivityKicker: "Last seven days",
      dashboardActivity: "Weekly Activity",
      dashboardShortcutsKicker: "Shortcuts",
      dashboardQuickActions: "Quick Actions",
      dashboardAddHabit: "Add Habit",
      dashboardViewStats: "View Stats",
      dashboardNoDeadlines: "No upcoming deadlines.",
      dashboardNoFocus: "Nothing needs your attention right now.",
      dashboardHabitSummary: "{done} of {total} habits completed today",
      dashboardNoHabits: "No habits yet.",
      dashboardAllHabitsDone: "All habits are complete for today.",
      dashboardOverdue: "Overdue",
      dashboardDueToday: "Today",
      dashboardHighPriority: "High Priority",
      dashboardNext: "Next",
      projects: "Projects",
      project: "Project",
      category: "Category",
      projectEmoji: "Project emoji",
      projectName: "Project name",
      addProject: "Add Project",
      noProjects: "No projects yet.",
      renameProject: "Rename",
      deleteProject: "Delete project",
      deleteProjectConfirm: "Delete {name}? Its tasks will become unassigned.",
      projectTaskCount: "{count} tasks",
      noProject: "No Project",
      noCategory: "No Category",
      allProjects: "All Projects",
      unassigned: "Unassigned",
      allCategories: "All Categories",
      projectFilter: "Project filter",
      categoryFilter: "Category filter",
      taskOrganization: "Task organization",
      organizationFilters: "Organization filters",
      categoryWork: "Work",
      categorySchool: "School",
      categoryPersonal: "Personal",
      categoryHealth: "Health",
      categoryOther: "Other",
      habitsTitle: "Daily Habits",
      habitsSubtitle: "Your daily routines",
      habitsDoneLabel: " done",
      addHabitPlaceholder: "New habit name...",
      addHabitBtn: "Add",
      addHabitHint: "Set a time for in-app reminders; browser alerts only fire while this page is open.",
      addHabitHintGranted: "Browser alerts and the in-app reminder center work while this page is open.",
      addHabitHintDenied: "Browser alerts are blocked; in-app reminders still work while this page is open.",
      addHabitHintUnsupported: "In-app reminders work while this page is open; browser alerts are unavailable.",
      habitEmojiPlaceholder: "🌟",
      habitEmojiLabel: "Habit emoji",
      habitReminderLabel: "Optional reminder time",
      reminderAction: "Reminder",
      reminderSetLabel: "Reminder set",
      reminderSetAction: "Set reminder",
      reminderPrompt: "Reminder time (HH:MM) or empty to clear:",
      reminderInvalidTime: "Enter a valid time from 00:00 to 23:59.",
      habitMarkDone: "Mark habit as done",
      habitMarkNotDone: "Mark habit as not done",
      deleteHabit: "Delete",
      closeReminder: "Dismiss reminder",
      noHabits: "No habits yet — add one below!",
      reminderSet: "⏰ Reminder set!",
      reminderCleared: "Reminder cleared.",
      notifPermDenied: "Browser notifications are blocked. In-app reminders still work while TaskFlow is open.",
      notifBody: "Time to: ",
      reminderCenterTitle: "Reminder Center",
      reminderCenterSubtitle: "Current deadlines and habit reminders",
      reminderCenterClose: "Close reminder center",
      reminderNeedsAttention: "Needs attention",
      reminderTomorrowSection: "Tomorrow",
      reminderSummary: "{count} actionable reminders",
      reminderNone: "No reminders need attention.",
      reminderOverdue: "Overdue",
      reminderDueToday: "Due today",
      reminderDueTomorrow: "Due tomorrow",
      reminderHabitUpcoming: "Habit reminder",
      reminderHabitMissed: "Missed habit reminder",
      reminderTaskType: "Task",
      reminderHabitType: "Habit",
      reminderOpenTask: "Open task",
      reminderOpenHabit: "Open habit",
      reminderMarkComplete: "Mark complete",
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
      addNotes: "+ Notas y repetición",
      optionalNotesPlaceholder: "Notas opcionales...",
      repeat: "Repetir",
      doesNotRepeat: "No se repite",
      recurrenceDaily: "Diariamente",
      recurrenceWeekdays: "Cada día laborable",
      recurrenceWeekly: "Semanalmente",
      recurrenceMonthly: "Mensualmente",
      recurrenceCustom: "Personalizado",
      recurrenceEvery: "Cada",
      recurrenceUnit: "Unidad del intervalo",
      recurrenceDay: "día",
      recurrenceDays: "días",
      recurrenceWeek: "semana",
      recurrenceWeeks: "semanas",
      recurrenceMonth: "mes",
      recurrenceMonths: "meses",
      recurrenceEnds: "Termina",
      recurrenceNever: "Nunca",
      recurrenceEndDate: "Fecha de finalización",
      recurringTask: "Tarea recurrente",
      nextOccurrence: "Próxima repetición",
      recurrenceNeedsDueDate: "Agrega una fecha límite para activar la recurrencia.",
      recurrenceInvalidInterval: "Ingresa un número entero entre 1 y 999.",
      recurrenceInvalidEndDate: "Elige una fecha final igual o posterior a la fecha límite.",
      taskCompletedAnnouncement: "Tarea completada",
      taskReopenedAnnouncement: "Tarea reabierta",
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
      tabDashboard: "Resumen",
      tabCalendar: "Calendario",
      calendarEyebrow: "Planifica por fecha",
      calendarTitle: "Calendario",
      calendarSubtitle: "Consulta las fechas límite y el trabajo completado del mes.",
      calendarPreviousMonth: "Mes anterior",
      calendarNextMonth: "Mes siguiente",
      calendarSelectedDate: "Fecha seleccionada",
      calendarTaskSummary: "{incomplete} pendientes, {completed} completadas",
      calendarOpenShort: "pend.",
      calendarDoneShort: "hechas",
      calendarIncompleteStatus: "Pendiente",
      calendarCompletedStatus: "Completada",
      calendarOpenTask: "Abrir tarea",
      calendarMoreTasks: "+{count} más",
      agendaTitle: "Agenda diaria",
      agendaTaskCount: "{count} tareas",
      agendaIncomplete: "Pendientes",
      agendaCompleted: "Completadas",
      agendaNoIncomplete: "No hay tareas pendientes para esta fecha.",
      agendaNoCompleted: "No hay tareas completadas para esta fecha.",
      agendaAddTask: "Agregar tarea para esta fecha",
      dashboardEyebrow: "De un vistazo",
      dashboardTitle: "Resumen",
      dashboardSubtitle: "Tus prioridades y progreso de hoy.",
      dashboardOverview: "Resumen de hoy",
      dashboardRemainingToday: "Pendientes hoy",
      dashboardCompletedToday: "Completadas hoy",
      dashboardHabitsMetric: "Hábitos de hoy",
      dashboardScheduleKicker: "Agenda",
      dashboardUpcoming: "Próximas fechas límite",
      dashboardPrioritiesKicker: "Prioridades",
      dashboardFocus: "Enfoque de hoy",
      dashboardRoutinesKicker: "Rutinas",
      dashboardHabitsTitle: "Hábitos de hoy",
      dashboardViewHabits: "Ver hábitos",
      dashboardActivityKicker: "Últimos siete días",
      dashboardActivity: "Actividad semanal",
      dashboardShortcutsKicker: "Atajos",
      dashboardQuickActions: "Acciones rápidas",
      dashboardAddHabit: "Agregar hábito",
      dashboardViewStats: "Ver estadísticas",
      dashboardNoDeadlines: "No hay próximas fechas límite.",
      dashboardNoFocus: "Nada requiere tu atención ahora.",
      dashboardHabitSummary: "{done} de {total} hábitos completados hoy",
      dashboardNoHabits: "Aún no hay hábitos.",
      dashboardAllHabitsDone: "Todos los hábitos están completos hoy.",
      dashboardOverdue: "Atrasada",
      dashboardDueToday: "Hoy",
      dashboardHighPriority: "Prioridad alta",
      dashboardNext: "Siguiente",
      projects: "Proyectos",
      project: "Proyecto",
      category: "Categoría",
      projectEmoji: "Emoji del proyecto",
      projectName: "Nombre del proyecto",
      addProject: "Agregar proyecto",
      noProjects: "Aún no hay proyectos.",
      renameProject: "Renombrar",
      deleteProject: "Eliminar proyecto",
      deleteProjectConfirm: "¿Eliminar {name}? Sus tareas quedarán sin asignar.",
      projectTaskCount: "{count} tareas",
      noProject: "Sin proyecto",
      noCategory: "Sin categoría",
      allProjects: "Todos los proyectos",
      unassigned: "Sin asignar",
      allCategories: "Todas las categorías",
      projectFilter: "Filtro de proyecto",
      categoryFilter: "Filtro de categoría",
      taskOrganization: "Organización de tareas",
      organizationFilters: "Filtros de organización",
      categoryWork: "Trabajo",
      categorySchool: "Escuela",
      categoryPersonal: "Personal",
      categoryHealth: "Salud",
      categoryOther: "Otro",
      habitsTitle: "Hábitos diarios",
      habitsSubtitle: "Tus rutinas diarias",
      habitsDoneLabel: " hechos",
      addHabitPlaceholder: "Nombre del hábito...",
      addHabitBtn: "Agregar",
      addHabitHint: "Elige una hora para recordatorios internos; las alertas solo aparecen con la página abierta.",
      addHabitHintGranted: "Las alertas del navegador y el centro de recordatorios funcionan con la página abierta.",
      addHabitHintDenied: "Las alertas están bloqueadas; los recordatorios internos siguen funcionando con la página abierta.",
      addHabitHintUnsupported: "Los recordatorios internos funcionan con la página abierta; las alertas del navegador no están disponibles.",
      habitEmojiPlaceholder: "🌟",
      habitEmojiLabel: "Emoji del hábito",
      habitReminderLabel: "Hora de recordatorio opcional",
      reminderAction: "Recordatorio",
      reminderSetLabel: "Recordatorio activo",
      reminderSetAction: "Establecer recordatorio",
      reminderPrompt: "Hora del recordatorio (HH:MM) o vacío para eliminar:",
      reminderInvalidTime: "Ingresa una hora válida entre 00:00 y 23:59.",
      habitMarkDone: "Marcar hábito como hecho",
      habitMarkNotDone: "Marcar hábito como no hecho",
      deleteHabit: "Eliminar",
      closeReminder: "Cerrar recordatorio",
      noHabits: "¡Sin hábitos aún — agrega uno abajo!",
      reminderSet: "⏰ ¡Recordatorio establecido!",
      reminderCleared: "Recordatorio eliminado.",
      notifPermDenied: "Las notificaciones del navegador están bloqueadas. Los recordatorios internos funcionan mientras TaskFlow está abierto.",
      notifBody: "Hora de: ",
      reminderCenterTitle: "Centro de recordatorios",
      reminderCenterSubtitle: "Fechas límite y recordatorios de hábitos actuales",
      reminderCenterClose: "Cerrar centro de recordatorios",
      reminderNeedsAttention: "Requiere atención",
      reminderTomorrowSection: "Mañana",
      reminderSummary: "{count} recordatorios activos",
      reminderNone: "Ningún recordatorio requiere atención.",
      reminderOverdue: "Atrasada",
      reminderDueToday: "Vence hoy",
      reminderDueTomorrow: "Vence mañana",
      reminderHabitUpcoming: "Recordatorio de hábito",
      reminderHabitMissed: "Recordatorio de hábito perdido",
      reminderTaskType: "Tarea",
      reminderHabitType: "Hábito",
      reminderOpenTask: "Abrir tarea",
      reminderOpenHabit: "Abrir hábito",
      reminderMarkComplete: "Marcar como completado",
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
  const taskProjectInput = document.getElementById("taskProjectInput");
  const taskCategoryInput = document.getElementById("taskCategoryInput");
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
  const editProjectInput = document.getElementById("editProjectInput");
  const editCategoryInput = document.getElementById("editCategoryInput");
  const editSaveBtn = document.getElementById("editSaveBtn");
  const editCancelBtn = document.getElementById("editCancelBtn");
  const editNotesInput = document.getElementById("editNotesInput");
  const notesToggle = document.getElementById("notesToggle");
  const notesArea = document.getElementById("notesArea");
  const notesInput = document.getElementById("notesInput");
  const addRecurrenceControls = {
    recurrence: document.getElementById("taskRecurrenceInput"),
    customFields: document.getElementById("taskRecurrenceCustomFields"),
    interval: document.getElementById("taskRecurrenceIntervalInput"),
    unit: document.getElementById("taskRecurrenceUnitInput"),
    endModeField: document.getElementById("taskRecurrenceEndModeField"),
    endMode: document.getElementById("taskRecurrenceEndModeInput"),
    endDateField: document.getElementById("taskRecurrenceEndDateField"),
    endDate: document.getElementById("taskRecurrenceEndDateInput"),
    feedback: document.getElementById("taskRecurrenceFeedback"),
    dueDate: dueDateInput
  };
  const editRecurrenceControls = {
    recurrence: document.getElementById("editRecurrenceInput"),
    customFields: document.getElementById("editRecurrenceCustomFields"),
    interval: document.getElementById("editRecurrenceIntervalInput"),
    unit: document.getElementById("editRecurrenceUnitInput"),
    endModeField: document.getElementById("editRecurrenceEndModeField"),
    endMode: document.getElementById("editRecurrenceEndModeInput"),
    endDateField: document.getElementById("editRecurrenceEndDateField"),
    endDate: document.getElementById("editRecurrenceEndDateInput"),
    feedback: document.getElementById("editRecurrenceFeedback"),
    dueDate: editDateInput
  };
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
  let dashboard = null;
  let calendar = null;
  let reminderCenter = null;
  let projectsUI = null;

  const storedProjects = sanitizeProjects(safeParse(localStorage.getItem(PROJECTS_KEY), []));
  const storedTasks = sanitizeTaskProjectReferences(
    sanitizeTasks(safeParse(localStorage.getItem(STORAGE_KEY), [])),
    storedProjects
  );

  const State = {
    tasks: storedTasks,
    projects: storedProjects,
    player: sanitizePlayer(safeParse(localStorage.getItem(PLAYER_KEY), defaultPlayer())),
    habits: sanitizeHabits(safeParse(localStorage.getItem(HABITS_KEY), null)),
    view: "all",
    searchQuery: "",
    projectFilter: "all",
    categoryFilter: "all",
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
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(this.projects));
      this.listeners.forEach((listener) => listener(this));
    },
    addTask(task) {
      const [sanitizedTask] = sanitizeTasks([task]);
      if (!sanitizedTask) return;
      this.tasks.unshift(sanitizedTask);
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

        const nextOccurrence = createNextOccurrence(
          task,
          this.tasks,
          () => crypto.randomUUID()
        );
        if (nextOccurrence.handled) {
          task.nextOccurrenceGenerated = true;
          if (nextOccurrence.task) this.tasks.unshift(nextOccurrence.task);
        }
      }

      this.notify();
    },
    updateTask(id, updates) {
      this.tasks = this.tasks.map((task) => {
        if (task.id !== id) return task;
        const [sanitizedTask] = sanitizeTasks([{
          ...task,
          ...updates,
          priority: normalizePriority(updates.priority ?? task.priority),
          projectId: updates.projectId === undefined
            ? task.projectId
            : this.projects.some((project) => project.id === updates.projectId)
              ? updates.projectId
              : null,
          category: updates.category === undefined
            ? task.category
            : sanitizeCategory(updates.category)
        }]);
        return sanitizedTask || task;
      });
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
    setProjectFilter(projectId) {
      this.projectFilter = projectId === "unassigned" || this.projects.some((project) => project.id === projectId)
        ? projectId
        : "all";
      this.notify();
    },
    setCategoryFilter(category) {
      this.categoryFilter = sanitizeCategory(category) || "all";
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
      this.projects = [];
      this.projectFilter = "all";
      this.categoryFilter = "all";
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
    },
    addProject(project) {
      this.projects = sanitizeProjects([...this.projects, project]);
      this.notify();
    },
    renameProject(id, name) {
      const project = this.projects.find((item) => item.id === id);
      if (!project) return;
      project.name = String(name).trim();
      if (!project.name) return;
      this.notify();
    },
    deleteProject(id) {
      this.projects = this.projects.filter((project) => project.id !== id);
      this.tasks = this.tasks.map((task) => task.projectId === id ? { ...task, projectId: null } : task);
      if (this.projectFilter === id) this.projectFilter = "all";
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

  function setSelectOptionLabels(select, labels) {
    Array.from(select.options).forEach((option) => {
      if (labels[option.value]) option.textContent = labels[option.value];
    });
  }

  function updateRecurrenceControls(controls) {
    const hasDueDate = Boolean(controls.dueDate.value);
    const type = controls.recurrence.value;
    const repeats = hasDueDate && type !== "none";
    const isCustom = repeats && type === "interval";
    const hasEndDate = repeats && controls.endMode.value === "date";

    controls.recurrence.disabled = !hasDueDate;
    controls.customFields.classList.toggle("hidden", !isCustom);
    controls.endModeField.classList.toggle("hidden", !repeats);
    controls.endDateField.classList.toggle("hidden", !hasEndDate);
    controls.interval.disabled = !isCustom;
    controls.unit.disabled = !isCustom;
    controls.endMode.disabled = !repeats;
    controls.endDate.disabled = !hasEndDate;
    controls.endDate.min = controls.dueDate.value || "";

    if (!hasDueDate) {
      controls.recurrence.value = "none";
      controls.feedback.textContent = t("recurrenceNeedsDueDate");
    } else if (!controls.feedback.dataset.validationError) {
      controls.feedback.textContent = "";
    }
  }

  function setRecurrenceControls(controls, recurrence) {
    controls.recurrence.value = recurrence?.type || "none";
    controls.interval.value = recurrence?.type === "interval" ? String(recurrence.interval) : "2";
    controls.unit.value = recurrence?.type === "interval" ? recurrence.unit : "days";
    controls.endMode.value = recurrence?.endDate ? "date" : "never";
    controls.endDate.value = recurrence?.endDate || "";
    controls.feedback.textContent = "";
    delete controls.feedback.dataset.validationError;
    updateRecurrenceControls(controls);
  }

  function readRecurrenceControls(controls) {
    delete controls.feedback.dataset.validationError;
    if (controls.recurrence.value === "none") {
      controls.feedback.textContent = "";
      return { valid: true, recurrence: null };
    }

    const dueDate = controls.dueDate.value;
    if (!dueDate) {
      controls.feedback.dataset.validationError = "true";
      controls.feedback.textContent = t("recurrenceNeedsDueDate");
      controls.dueDate.focus();
      return { valid: false, recurrence: null };
    }

    const interval = Number(controls.interval.value);
    if (controls.recurrence.value === "interval" &&
      (!Number.isInteger(interval) || interval < 1 || interval > 999)) {
      controls.feedback.dataset.validationError = "true";
      controls.feedback.textContent = t("recurrenceInvalidInterval");
      controls.interval.focus();
      return { valid: false, recurrence: null };
    }

    const endDate = controls.endMode.value === "date" ? controls.endDate.value : null;
    if (controls.endMode.value === "date" && (!endDate || endDate < dueDate)) {
      controls.feedback.dataset.validationError = "true";
      controls.feedback.textContent = t("recurrenceInvalidEndDate");
      controls.endDate.focus();
      return { valid: false, recurrence: null };
    }

    const due = parseDateOnly(dueDate);
    const recurrence = sanitizeRecurrence({
      type: controls.recurrence.value,
      interval: controls.recurrence.value === "interval" ? interval : 1,
      unit: controls.recurrence.value === "interval" ? controls.unit.value : null,
      endDate,
      anchorDay: due.getDate()
    }, dueDate);

    if (!recurrence) {
      controls.feedback.dataset.validationError = "true";
      controls.feedback.textContent = t("recurrenceInvalidInterval");
      return { valid: false, recurrence: null };
    }

    controls.feedback.textContent = "";
    return { valid: true, recurrence };
  }

  function bindRecurrenceControls(controls) {
    controls.dueDate.addEventListener("change", () => {
      delete controls.feedback.dataset.validationError;
      updateRecurrenceControls(controls);
    });
    controls.recurrence.addEventListener("change", () => {
      delete controls.feedback.dataset.validationError;
      updateRecurrenceControls(controls);
    });
    controls.endMode.addEventListener("change", () => {
      delete controls.feedback.dataset.validationError;
      updateRecurrenceControls(controls);
    });
    controls.interval.addEventListener("input", () => {
      delete controls.feedback.dataset.validationError;
      controls.feedback.textContent = "";
    });
    controls.endDate.addEventListener("change", () => {
      delete controls.feedback.dataset.validationError;
      controls.feedback.textContent = "";
    });
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
    document.getElementById("projectsHeaderText").textContent = t("projects");
    document.getElementById("projectEmojiInput").setAttribute("aria-label", t("projectEmoji"));
    document.getElementById("projectNameInput").placeholder = t("projectName");
    document.getElementById("projectNameInput").setAttribute("aria-label", t("projectName"));
    document.getElementById("addProjectBtn").textContent = t("addProject");

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
    taskProjectInput.setAttribute("aria-label", t("project"));
    taskCategoryInput.setAttribute("aria-label", t("category"));
    document.getElementById("taskProjectLabel").textContent = t("project");
    document.getElementById("taskCategoryLabel").textContent = t("category");
    document.querySelector(".task-organization-row").setAttribute("aria-label", t("taskOrganization"));
    document.getElementById("projectFilterLabel").textContent = t("project");
    document.getElementById("categoryFilterLabel").textContent = t("category");
    document.getElementById("projectFilterInput").setAttribute("aria-label", t("projectFilter"));
    document.getElementById("categoryFilterInput").setAttribute("aria-label", t("categoryFilter"));
    document.querySelector(".organization-filters").setAttribute("aria-label", t("organizationFilters"));
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
    document.getElementById("editProjectLabel").textContent = t("project");
    document.getElementById("editCategoryLabel").textContent = t("category");
    editProjectInput.setAttribute("aria-label", t("project"));
    editCategoryInput.setAttribute("aria-label", t("category"));
    editCancelBtn.textContent = t("cancel");
    editSaveBtn.textContent = t("save");
    document.getElementById("editNotesLabel").textContent = t("notesLabel");
    editNotesInput.placeholder = t("optionalNotesPlaceholder");
    document.getElementById("notesToggleLabel").textContent = t("addNotes");
    notesInput.placeholder = t("optionalNotesPlaceholder");
    notesInput.setAttribute("aria-label", t("notesLabel"));

    ["task", "edit"].forEach((prefix) => {
      document.getElementById(`${prefix}RecurrenceLegend`).textContent = t("repeat");
      document.getElementById(`${prefix}RecurrenceLabel`).textContent = t("repeat");
      document.getElementById(`${prefix}RecurrenceEveryLabel`).textContent = t("recurrenceEvery");
      document.getElementById(`${prefix}RecurrenceUnitLabel`).textContent = t("recurrenceUnit");
      document.getElementById(`${prefix}RecurrenceEndsLabel`).textContent = t("recurrenceEnds");
      document.getElementById(`${prefix}RecurrenceEndDateLabel`).textContent = t("recurrenceEndDate");
    });
    [addRecurrenceControls, editRecurrenceControls].forEach((controls) => {
      setSelectOptionLabels(controls.recurrence, {
        none: t("doesNotRepeat"),
        daily: t("recurrenceDaily"),
        weekdays: t("recurrenceWeekdays"),
        weekly: t("recurrenceWeekly"),
        monthly: t("recurrenceMonthly"),
        interval: t("recurrenceCustom")
      });
      setSelectOptionLabels(controls.unit, {
        days: t("recurrenceDays"),
        weeks: t("recurrenceWeeks"),
        months: t("recurrenceMonths")
      });
      setSelectOptionLabels(controls.endMode, {
        never: t("recurrenceNever"),
        date: t("recurrenceEndDate")
      });
      controls.interval.setAttribute("aria-label", t("recurrenceEvery"));
      controls.interval.setAttribute("aria-describedby", controls.feedback.id);
      controls.unit.setAttribute("aria-describedby", controls.feedback.id);
      controls.endMode.setAttribute("aria-label", t("recurrenceEnds"));
      controls.endDate.setAttribute("aria-label", t("recurrenceEndDate"));
      controls.endDate.setAttribute("aria-describedby", controls.feedback.id);
      updateRecurrenceControls(controls);
    });

    priorityInput.options[0].text = t("highPriority");
    priorityInput.options[1].text = t("mediumPriority");
    priorityInput.options[2].text = t("lowPriority");

    editPriorityInput.options[0].text = t("highPriority");
    editPriorityInput.options[1].text = t("mediumPriority");
    editPriorityInput.options[2].text = t("lowPriority");

    const tabTasksLabel = document.getElementById("tabTasksLabel");
    const tabHabitsLabel = document.getElementById("tabHabitsLabel");
    const tabStatsLabel = document.getElementById("tabStatsLabel");
    const tabDashboardLabel = document.getElementById("tabDashboardLabel");
    const tabCalendarLabel = document.getElementById("tabCalendarLabel");
    if (tabTasksLabel) tabTasksLabel.textContent = t("tabTasks");
    if (tabHabitsLabel) tabHabitsLabel.textContent = t("tabHabits");
    if (tabStatsLabel) tabStatsLabel.textContent = t("tabStats");
    if (tabDashboardLabel) tabDashboardLabel.textContent = t("tabDashboard");
    if (tabCalendarLabel) tabCalendarLabel.textContent = t("tabCalendar");

    document.getElementById("calendarEyebrow").textContent = t("calendarEyebrow");
    document.getElementById("calendarTitle").textContent = t("calendarTitle");
    document.getElementById("calendarSubtitle").textContent = t("calendarSubtitle");
    document.getElementById("calendarPreviousBtn").setAttribute("aria-label", t("calendarPreviousMonth"));
    document.getElementById("calendarNextBtn").setAttribute("aria-label", t("calendarNextMonth"));
    document.getElementById("calendarTodayBtn").textContent = t("today");

    document.getElementById("dashboardEyebrow").textContent = t("dashboardEyebrow");
    document.getElementById("dashboardTitle").textContent = t("dashboardTitle");
    document.getElementById("dashboardSubtitle").textContent = t("dashboardSubtitle");
    document.getElementById("dashboardOverview").setAttribute("aria-label", t("dashboardOverview"));
    document.getElementById("dashboardUpcomingKicker").textContent = t("dashboardScheduleKicker");
    document.getElementById("dashboardUpcomingTitle").textContent = t("dashboardUpcoming");
    document.getElementById("dashboardFocusKicker").textContent = t("dashboardPrioritiesKicker");
    document.getElementById("dashboardFocusTitle").textContent = t("dashboardFocus");
    document.getElementById("dashboardHabitsKicker").textContent = t("dashboardRoutinesKicker");
    document.getElementById("dashboardHabitsTitle").textContent = t("dashboardHabitsTitle");
    document.getElementById("dashboardOpenHabits").textContent = t("dashboardViewHabits");
    document.getElementById("dashboardActivityKicker").textContent = t("dashboardActivityKicker");
    document.getElementById("dashboardActivityTitle").textContent = t("dashboardActivity");
    document.getElementById("dashboardQuickKicker").textContent = t("dashboardShortcutsKicker");
    document.getElementById("dashboardQuickTitle").textContent = t("dashboardQuickActions");
    document.getElementById("dashboardAddTaskLabel").textContent = t("addTask");
    document.getElementById("dashboardAddHabitLabel").textContent = t("dashboardAddHabit");
    document.getElementById("dashboardViewStatsLabel").textContent = t("dashboardViewStats");

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
    if (addHabitHintEl) {
      const hintKey = typeof Notification === "undefined"
        ? "addHabitHintUnsupported"
        : Notification.permission === "granted"
          ? "addHabitHintGranted"
          : Notification.permission === "denied"
            ? "addHabitHintDenied"
            : "addHabitHint";
      addHabitHintEl.textContent = t(hintKey);
    }
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
    if (typeof Notification === "undefined") return;
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
      const val = prompt(t("reminderPrompt"), currentTime || "");
      if (val === null) return;
      const trimmed = val.trim();
      if (trimmed && !/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
        showReminderBanner(t("reminderInvalidTime"));
        return;
      }
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
        }
        doPrompt();
      });
    } else if (Notification.permission === "denied") {
      showReminderBanner(t("notifPermDenied"));
      doPrompt();
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
      ? `${t("reminderSetLabel")}: ${habit.reminderTime}`
      : t("reminderSetAction");
    reminderBtn.setAttribute("aria-label", reminderBtn.title);
    reminderBtn.textContent = habit.reminderTime
      ? `⏰ ${t("reminderSetLabel")} · ${habit.reminderTime}`
      : `⏰ ${t("reminderSetAction")}`;
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
    editProjectInput.value = task.projectId || "";
    editCategoryInput.value = task.category || "";
    editNotesInput.value = task.notes || "";
    setRecurrenceControls(editRecurrenceControls, task.recurrence);

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

    const recurrenceResult = readRecurrenceControls(editRecurrenceControls);
    if (!recurrenceResult.valid) return;
    const task = State.tasks.find((item) => item.id === State.editingTaskId);
    if (!task) return;
    const recurrence = recurrenceResult.recurrence;

    State.updateTask(State.editingTaskId, {
      text: newText,
      dueDate: editDateInput.value || null,
      priority: editPriorityInput.value,
      projectId: editProjectInput.value || null,
      category: editCategoryInput.value || null,
      notes: editNotesInput.value.trim(),
      recurrence,
      recurrenceSeriesId: recurrence ? task.recurrenceSeriesId || task.id : null,
      recurrenceSourceId: recurrence ? task.recurrenceSourceId : null,
      recurrenceOccurrenceDate: recurrence ? editDateInput.value : null,
      nextOccurrenceGenerated: recurrence ? task.nextOccurrenceGenerated : false
    });

    closeEditModal();
  }

  function getPriorityLabel(priority) {
    if (priority === "high") return t("highBadge");
    if (priority === "low") return t("lowBadge");
    return t("mediumBadge");
  }

  function getCategoryLabel(category) {
    if (!category) return "";
    return t(`category${category[0].toUpperCase()}${category.slice(1)}`);
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

    if (task.recurrence) {
      const recurrenceSpan = document.createElement("span");
      recurrenceSpan.className = "task-recurrence-chip";
      recurrenceSpan.setAttribute("aria-label", `${t("recurringTask")}: ${formatRecurrence(task.recurrence, t)}`);
      const recurrenceIcon = document.createElement("span");
      recurrenceIcon.setAttribute("aria-hidden", "true");
      recurrenceIcon.textContent = "↻";
      const recurrenceText = document.createElement("span");
      recurrenceText.textContent = formatRecurrence(task.recurrence, t);
      recurrenceSpan.append(recurrenceIcon, recurrenceText);
      meta.appendChild(recurrenceSpan);
    }

    const project = State.projects.find((item) => item.id === task.projectId);
    if (project) {
      const projectSpan = document.createElement("span");
      projectSpan.className = "task-organization-chip task-project-chip";
      projectSpan.textContent = `${project.emoji} ${project.name}`;
      meta.appendChild(projectSpan);
    }

    if (task.category) {
      const categorySpan = document.createElement("span");
      categorySpan.className = "task-organization-chip task-category-chip";
      categorySpan.textContent = getCategoryLabel(task.category);
      meta.appendChild(categorySpan);
    }

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
      const project = state.projects.find((item) => item.id === task.projectId);
      const searchableText = [
        task.text,
        project?.name || "",
        task.category ? getCategoryLabel(task.category) : "",
        task.recurrence ? formatRecurrence(task.recurrence, t) : ""
      ].join(" ").toLowerCase();

      if (state.searchQuery && !searchableText.includes(state.searchQuery)) {
        return false;
      }

      if (state.projectFilter === "unassigned" && task.projectId !== null) return false;
      if (state.projectFilter !== "all" && state.projectFilter !== "unassigned" && task.projectId !== state.projectFilter) return false;
      if (state.categoryFilter !== "all" && task.category !== state.categoryFilter) return false;

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
    projectsUI?.render(state);
    dashboard?.render(state);
    calendar?.render(state);
    reminderCenter?.render(state);
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

    const recurrenceResult = readRecurrenceControls(addRecurrenceControls);
    if (!recurrenceResult.valid) {
      notesArea.classList.remove("hidden");
      notesToggle.setAttribute("aria-expanded", "true");
      return;
    }

    const id = crypto.randomUUID();
    const recurrence = recurrenceResult.recurrence;

    State.addTask({
      id,
      text,
      completed: false,
      completedAt: null,
      dueDate: dueDateInput.value || null,
      priority: priorityInput.value || "medium",
      createdAt: new Date().toISOString(),
      notes: notesInput.value.trim(),
      rewardGranted: false,
      projectId: taskProjectInput.value || null,
      category: taskCategoryInput.value || null,
      recurrence,
      recurrenceSeriesId: recurrence ? id : null,
      recurrenceSourceId: null,
      recurrenceOccurrenceDate: recurrence ? dueDateInput.value : null,
      nextOccurrenceGenerated: false
    });

    taskInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "medium";
    taskProjectInput.value = "";
    taskCategoryInput.value = "";
    notesInput.value = "";
    setRecurrenceControls(addRecurrenceControls, null);
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

  bindRecurrenceControls(addRecurrenceControls);
  bindRecurrenceControls(editRecurrenceControls);
  setRecurrenceControls(addRecurrenceControls, null);

  function setSettingsOpen(isOpen) {
    if (isOpen) reminderCenter?.close(false);
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
      language: State.language,
      projects: State.projects
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
          State.tasks = sanitizeTaskProjectReferences(sanitizeTasks(imported), State.projects);
        } else {
          if (Array.isArray(imported.projects)) {
            State.projects = sanitizeProjects(imported.projects);
          }
          State.tasks = sanitizeTaskProjectReferences(sanitizeTasks(imported.tasks || []), State.projects);
          State.player = sanitizePlayer(imported.player || defaultPlayer());
          if (imported.habits) State.habits = sanitizeHabits(imported.habits);
          if (imported.language && translations[imported.language]) {
            State.language = imported.language;
            languageSelect.value = imported.language;
          }
          if (State.projectFilter !== "all" && State.projectFilter !== "unassigned" && !State.projects.some((project) => project.id === State.projectFilter)) {
            State.projectFilter = "all";
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

  dashboard = createDashboard({
    t,
    switchTab,
    sortTasks,
    toggleTask: (id) => State.toggleTask(id),
    toggleHabit: (id) => State.toggleHabit(id),
    xpNeededForLevel
  });

  calendar = createCalendar({
    t,
    sortTasks,
    openTask: (id) => openEditModal(id),
    toggleTask: (id) => State.toggleTask(id),
    prepareTaskForDate: (date) => {
      switchTab("tasks");
      dueDateInput.value = date;
      updateRecurrenceControls(addRecurrenceControls);
      requestAnimationFrame(() => taskInput.focus());
    }
  });

  reminderCenter = createReminderCenter({
    t,
    openTask: (id) => openEditModal(id),
    toggleTask: (id) => State.toggleTask(id),
    openHabit: (id) => {
      switchTab("habits");
      requestAnimationFrame(() => {
        const card = Array.from(document.querySelectorAll(".habit-card"))
          .find((element) => element.dataset.id === id);
        card?.querySelector(".habit-toggle")?.focus();
      });
    },
    toggleHabit: (id) => State.toggleHabit(id),
    closeSettings: () => setSettingsOpen(false)
  });

  projectsUI = createProjectsUI({
    t,
    addProject: (project) => State.addProject(project),
    renameProject: (id, name) => State.renameProject(id, name),
    deleteProject: (id) => State.deleteProject(id),
    setProjectFilter: (projectId) => State.setProjectFilter(projectId),
    setCategoryFilter: (category) => State.setCategoryFilter(category)
  });

  State.subscribe(render);
  render(State);
  setInterval(() => updateQuote(false), 15000);
}
