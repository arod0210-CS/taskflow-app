import { downloadAnalyticsJson } from "./analytics-export.js";

export const ANALYTICS_RANGE_VALUES = ["last7", "last30", "thisMonth", "previousMonth", "all"];
const DAY_MS = 86400000;
const HABIT_RETENTION_DAYS = 31;
const HEATMAP_DAYS = 84;

const copy = {
  en: {
    eyebrow: "Analytics 2.0",
    title: "Productivity analytics",
    subtitle: "A transparent view of your retained TaskFlow activity.",
    range: "Date range",
    last7: "Last 7 days",
    last30: "Last 30 days",
    thisMonth: "This month",
    previousMonth: "Previous month",
    all: "All retained data",
    export: "Export analytics JSON",
    overview: "Selected-range overview",
    taskTrends: "Productivity trends",
    breakdowns: "Completion breakdowns",
    habits: "Habit consistency",
    focus: "Focus trends",
    projects: "Project performance",
    heatmap: "Task activity heatmap",
    insights: "Summary insights",
    limitations: "Data notes",
    historicalCompletions: "Task completions",
    currentCompleted: "Current completed tasks",
    activeDays: "Active days",
    averageActiveDay: "Average per active day",
    mostActive: "Most active day",
    noActiveDay: "No active day",
    previousUp: "{value}% more than the previous period",
    previousDown: "{value}% fewer than the previous period",
    previousSame: "Same as the previous period",
    previousUnavailable: "Previous-period comparison is unavailable for this range.",
    priority: "Priority",
    category: "Category",
    project: "Project",
    recurrence: "Recurrence",
    completionRate: "Due-task completion rate",
    completionRateHelp: "{done} of {total} tasks due in this range are currently complete.",
    noDuePopulation: "No current tasks have due dates in this range, so a completion rate cannot be calculated.",
    noData: "No retained activity is available for this range.",
    unassigned: "Unassigned",
    archived: "Archived",
    active: "Active",
    recurring: "Recurring",
    oneTime: "One-time",
    none: "None",
    low: "Low",
    medium: "Medium",
    high: "High",
    work: "Work",
    school: "School",
    personal: "Personal",
    health: "Health",
    learning: "Learning",
    other: "Other",
    consistency: "Overall consistency",
    eligibleDays: "{days} retained days used",
    habitAssumption: "Habits have no creation date, so each current habit is treated as active for the retained overlap.",
    completedFocus: "Completed focus sessions",
    focusMinutes: "Focus minutes",
    averageFocus: "Average focus session",
    completedBreaks: "Completed breaks",
    stoppedExcluded: "Stopped sessions are excluded. Completed breaks are shown separately.",
    unavailableTask: "Linked task unavailable",
    sessions: "sessions",
    minutes: "min",
    tasks: "tasks",
    currentInventory: "Current tasks",
    rangeCompletions: "Range completions",
    rangeFocus: "Range focus",
    heatmapSummary: "{count} task completions across the last 12 weeks; busiest day: {day}.",
    heatmapEmpty: "No retained task completions across the last 12 weeks.",
    less: "Less",
    more: "More",
    limitationTask: "Task trend totals combine current completedAt timestamps with the retained completedByDay aggregate, using the larger count per day to avoid double-counting. Aggregate history can include deleted or reopened tasks and is retained for about 31 days.",
    limitationHabit: "Habit completion dates are retained for about 31 days and habits do not store a creation timestamp. Older consistency and true lifetime denominators cannot be reconstructed.",
    limitationFocus: "Focus analytics use the latest 200 timer history entries. Only completed sessions count; links to deleted tasks are labeled unavailable.",
    limitationProject: "Project history is inferred from current task-to-project links. Deleted tasks and past project assignments cannot be reconstructed.",
    insightTasks: "You completed {count} tasks across {days} active days in this range.",
    insightPeak: "Your busiest retained day was {day} with {count} completion events.",
    insightDue: "{done} of {total} tasks due in this range are currently complete ({rate}%).",
    insightHabit: "{habit} has the strongest retained consistency at {rate}%.",
    insightFocus: "You logged {minutes} focused minutes in {sessions} completed sessions.",
    insightEmpty: "Add and complete tasks, habits, or focus sessions to build a useful analytics history.",
    exported: "Analytics JSON exported.",
    percent: "{value}%",
    dateSpan: "{start} – {end}"
  },
  es: {
    eyebrow: "Analíticas 2.0",
    title: "Analíticas de productividad",
    subtitle: "Una vista transparente de tu actividad conservada en TaskFlow.",
    range: "Rango de fechas",
    last7: "Últimos 7 días",
    last30: "Últimos 30 días",
    thisMonth: "Este mes",
    previousMonth: "Mes anterior",
    all: "Todos los datos conservados",
    export: "Exportar JSON de analíticas",
    overview: "Resumen del rango seleccionado",
    taskTrends: "Tendencias de productividad",
    breakdowns: "Desglose de finalizaciones",
    habits: "Constancia de hábitos",
    focus: "Tendencias de enfoque",
    projects: "Rendimiento de proyectos",
    heatmap: "Mapa de actividad de tareas",
    insights: "Conclusiones",
    limitations: "Notas sobre los datos",
    historicalCompletions: "Tareas completadas",
    currentCompleted: "Tareas completadas actuales",
    activeDays: "Días activos",
    averageActiveDay: "Promedio por día activo",
    mostActive: "Día más activo",
    noActiveDay: "Sin día activo",
    previousUp: "{value}% más que el período anterior",
    previousDown: "{value}% menos que el período anterior",
    previousSame: "Igual que el período anterior",
    previousUnavailable: "La comparación con el período anterior no está disponible para este rango.",
    priority: "Prioridad",
    category: "Categoría",
    project: "Proyecto",
    recurrence: "Recurrencia",
    completionRate: "Tasa de finalización por vencimiento",
    completionRateHelp: "{done} de {total} tareas que vencen en este rango están completadas actualmente.",
    noDuePopulation: "No hay tareas actuales con vencimiento en este rango; no se puede calcular una tasa.",
    noData: "No hay actividad conservada para este rango.",
    unassigned: "Sin asignar",
    archived: "Archivado",
    active: "Activo",
    recurring: "Recurrente",
    oneTime: "Única",
    none: "Ninguna",
    low: "Baja",
    medium: "Media",
    high: "Alta",
    work: "Trabajo",
    school: "Estudios",
    personal: "Personal",
    health: "Salud",
    learning: "Aprendizaje",
    other: "Otra",
    consistency: "Constancia general",
    eligibleDays: "{days} días conservados usados",
    habitAssumption: "Los hábitos no tienen fecha de creación; cada hábito actual se considera activo durante el solapamiento conservado.",
    completedFocus: "Sesiones de enfoque completadas",
    focusMinutes: "Minutos de enfoque",
    averageFocus: "Promedio por sesión",
    completedBreaks: "Descansos completados",
    stoppedExcluded: "Las sesiones detenidas se excluyen. Los descansos completados se muestran por separado.",
    unavailableTask: "Tarea vinculada no disponible",
    sessions: "sesiones",
    minutes: "min",
    tasks: "tareas",
    currentInventory: "Tareas actuales",
    rangeCompletions: "Finalizaciones del rango",
    rangeFocus: "Enfoque del rango",
    heatmapSummary: "{count} tareas completadas en las últimas 12 semanas; día más activo: {day}.",
    heatmapEmpty: "No hay tareas completadas conservadas en las últimas 12 semanas.",
    less: "Menos",
    more: "Más",
    limitationTask: "Las tendencias combinan completedAt con el agregado conservado completedByDay y usan el mayor valor diario para evitar duplicados. El agregado puede incluir tareas borradas o reabiertas y se conserva unos 31 días.",
    limitationHabit: "Las fechas de hábitos se conservan unos 31 días y los hábitos no guardan fecha de creación. No se puede reconstruir la constancia antigua ni el denominador histórico real.",
    limitationFocus: "Las analíticas usan las 200 entradas más recientes del temporizador. Solo cuentan sesiones completadas; las tareas borradas aparecen como no disponibles.",
    limitationProject: "El historial de proyectos se infiere de los vínculos actuales. No se pueden reconstruir tareas borradas ni asignaciones anteriores.",
    insightTasks: "Completaste {count} tareas durante {days} días activos en este rango.",
    insightPeak: "Tu día conservado más activo fue {day}, con {count} finalizaciones.",
    insightDue: "{done} de {total} tareas que vencen en este rango están completadas actualmente ({rate}%).",
    insightHabit: "{habit} tiene la mejor constancia conservada: {rate}%.",
    insightFocus: "Registraste {minutes} minutos de enfoque en {sessions} sesiones completadas.",
    insightEmpty: "Añade y completa tareas, hábitos o sesiones de enfoque para crear un historial útil.",
    exported: "JSON de analíticas exportado.",
    percent: "{value}%",
    dateSpan: "{start} – {end}"
  }
};

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(key) {
  const [year, month, day] = String(key).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function validDateKey(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key))) return false;
  const date = dateFromKey(key);
  return !Number.isNaN(date.getTime()) && localDateKey(date) === key;
}

function shiftKey(key, days) {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function daysBetween(start, end) {
  return Math.max(0, Math.round((dateFromKey(end) - dateFromKey(start)) / DAY_MS) + 1);
}

function keysBetween(start, end) {
  const keys = [];
  for (let key = start; key <= end; key = shiftKey(key, 1)) keys.push(key);
  return keys;
}

function isoDateKey(value) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return null;
  return localDateKey(new Date(value));
}

function inRange(key, range) {
  return Boolean(key && key >= range.start && key <= range.end);
}

function earliestRetainedKey(data, today) {
  const candidates = [today];
  Object.keys(data.player?.completedByDay || {}).forEach((key) => candidates.push(key));
  data.tasks.forEach((task) => [isoDateKey(task.completedAt), isoDateKey(task.createdAt)].filter(Boolean).forEach((key) => candidates.push(key)));
  data.habits.forEach((habit) => (habit.completedDates || []).forEach((key) => candidates.push(key)));
  data.focusHistory.forEach((entry) => {
    const key = isoDateKey(entry.endedAt);
    if (key) candidates.push(key);
  });
  return candidates.filter((key) => validDateKey(key) && key <= today).sort()[0] || today;
}

export function getAnalyticsRange(value, now = new Date(), data = {}) {
  const selected = ANALYTICS_RANGE_VALUES.includes(value) ? value : "last30";
  const today = localDateKey(now);
  let start = today;
  let end = today;
  if (selected === "last7") start = shiftKey(today, -6);
  if (selected === "last30") start = shiftKey(today, -29);
  if (selected === "thisMonth") start = localDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
  if (selected === "previousMonth") {
    start = localDateKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    end = localDateKey(new Date(now.getFullYear(), now.getMonth(), 0));
  }
  if (selected === "all") start = earliestRetainedKey({
    tasks: data.tasks || [], habits: data.habits || [], focusHistory: data.focusHistory || [], player: data.player || {}
  }, today);
  const length = daysBetween(start, end);
  const previous = selected === "all" ? null : {
    start: shiftKey(start, -length),
    end: shiftKey(start, -1)
  };
  return { value: selected, start, end, days: length, previous };
}

function countCurrentCompletions(tasks) {
  const counts = {};
  tasks.forEach((task) => {
    if (!task.completed) return;
    const key = isoDateKey(task.completedAt);
    if (key) counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function combinedTaskCounts(tasks, player) {
  const current = countCurrentCompletions(tasks);
  const historical = player?.completedByDay || {};
  const keys = new Set([...Object.keys(current), ...Object.keys(historical)]);
  return Object.fromEntries([...keys].map((key) => [key, Math.max(current[key] || 0, Number(historical[key]) || 0)]));
}

function trendForRange(counts, range) {
  const days = keysBetween(range.start, range.end).map((date) => ({ date, count: counts[date] || 0 }));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const active = days.filter((day) => day.count > 0);
  const mostActive = active.slice().sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))[0] || null;
  return {
    days,
    total,
    activeDays: active.length,
    averageActiveDay: active.length ? Number((total / active.length).toFixed(1)) : 0,
    mostActive
  };
}

function tally(items, valueFor) {
  const totals = new Map();
  items.forEach((item) => {
    const value = valueFor(item);
    totals.set(value, (totals.get(value) || 0) + 1);
  });
  return [...totals].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));
}

function completedTasksInRange(tasks, range) {
  return tasks.filter((task) => task.completed && inRange(isoDateKey(task.completedAt), range));
}

function buildHabitSummary(habits, range, today) {
  const retentionStart = shiftKey(today, -(HABIT_RETENTION_DAYS - 1));
  const overlapStart = range.start > retentionStart ? range.start : retentionStart;
  const overlapEnd = range.end < today ? range.end : today;
  const eligibleDays = overlapStart <= overlapEnd ? daysBetween(overlapStart, overlapEnd) : 0;
  const items = habits.map((habit) => {
    const completions = (habit.completedDates || []).filter((key) => key >= overlapStart && key <= overlapEnd).length;
    return {
      id: habit.id,
      name: habit.name,
      emoji: habit.emoji,
      completions,
      eligibleDays,
      rate: eligibleDays ? Math.round((completions / eligibleDays) * 100) : 0,
      streak: Number(habit.streak) || 0
    };
  }).sort((a, b) => b.rate - a.rate || b.completions - a.completions || a.name.localeCompare(b.name));
  const possible = habits.length * eligibleDays;
  const completions = items.reduce((sum, habit) => sum + habit.completions, 0);
  return { eligibleDays, overlapStart, overlapEnd, completions, possible, rate: possible ? Math.round((completions / possible) * 100) : 0, items };
}

function buildFocusSummary(history, tasks, range) {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const completed = history.filter((entry) => entry.completed && inRange(isoDateKey(entry.endedAt), range));
  const focusEntries = completed.filter((entry) => entry.mode === "focus");
  const breaks = completed.filter((entry) => entry.mode !== "focus");
  const minutes = Math.round(focusEntries.reduce((sum, entry) => sum + Number(entry.durationSeconds || 0), 0) / 60);
  const unavailableTaskLinks = focusEntries.filter((entry) => entry.taskId && !taskMap.has(entry.taskId)).length;
  return {
    sessions: focusEntries.length,
    minutes,
    averageMinutes: focusEntries.length ? Math.round(minutes / focusEntries.length) : 0,
    breaks: breaks.length,
    unavailableTaskLinks,
    byDay: tally(focusEntries, (entry) => isoDateKey(entry.endedAt))
  };
}

function buildProjectSummary(projects, tasks, completedTasks, focusHistory, range) {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const ids = new Set(projects.map((project) => project.id));
  if (tasks.some((task) => !task.projectId)) ids.add("unassigned");
  const completedFocus = focusHistory.filter((entry) => entry.completed && entry.mode === "focus" && inRange(isoDateKey(entry.endedAt), range));
  return [...ids].map((id) => {
    const project = projectMap.get(id);
    const isUnassigned = id === "unassigned";
    const projectTasks = tasks.filter((task) => isUnassigned ? !task.projectId : task.projectId === id);
    const completions = completedTasks.filter((task) => isUnassigned ? !task.projectId : task.projectId === id).length;
    const focusMinutes = Math.round(completedFocus.reduce((sum, entry) => {
      const task = taskMap.get(entry.taskId);
      const matches = task && (isUnassigned ? !task.projectId : task.projectId === id);
      return sum + (matches ? Number(entry.durationSeconds || 0) : 0);
    }, 0) / 60);
    return {
      id,
      name: project?.name || "",
      emoji: project?.emoji || "📥",
      archived: Boolean(project?.archived),
      currentTasks: projectTasks.length,
      activeTasks: projectTasks.filter((task) => !task.completed).length,
      completions,
      focusMinutes
    };
  }).sort((a, b) => b.completions - a.completions || b.focusMinutes - a.focusMinutes || a.name.localeCompare(b.name));
}

export function buildAnalyticsSummary(data, rangeValue = "last30", now = new Date()) {
  const normalized = {
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    habits: Array.isArray(data.habits) ? data.habits : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    focusHistory: Array.isArray(data.focusHistory) ? data.focusHistory : [],
    player: data.player || {}
  };
  const range = getAnalyticsRange(rangeValue, now, normalized);
  const today = localDateKey(now);
  const counts = combinedTaskCounts(normalized.tasks, normalized.player);
  const taskTrends = trendForRange(counts, range);
  const previousTrend = range.previous ? trendForRange(counts, range.previous) : null;
  const completedTasks = completedTasksInRange(normalized.tasks, range);
  const projectMap = new Map(normalized.projects.map((project) => [project.id, project]));
  const dueTasks = normalized.tasks.filter((task) => inRange(task.dueDate, range));
  const dueCompleted = dueTasks.filter((task) => task.completed).length;
  const breakdowns = {
    priority: tally(completedTasks, (task) => task.priority || "medium"),
    category: tally(completedTasks, (task) => task.category || "none"),
    project: tally(completedTasks, (task) => {
      if (!task.projectId) return "unassigned";
      const project = projectMap.get(task.projectId);
      return project ? `${project.archived ? "archived" : "active"}:${project.id}` : "unassigned";
    }),
    recurrence: tally(completedTasks, (task) => task.recurrence?.type && task.recurrence.type !== "none" ? "recurring" : "oneTime"),
    completionRate: { due: dueTasks.length, completed: dueCompleted, rate: dueTasks.length ? Math.round((dueCompleted / dueTasks.length) * 100) : null }
  };
  const habits = buildHabitSummary(normalized.habits, range, today);
  const focus = buildFocusSummary(normalized.focusHistory, normalized.tasks, range);
  const projects = buildProjectSummary(normalized.projects, normalized.tasks, completedTasks, normalized.focusHistory, range);
  const heatmapRange = { start: shiftKey(today, -(HEATMAP_DAYS - 1)), end: today };
  const heatmapTrend = trendForRange(counts, heatmapRange);
  const heatmap = { start: heatmapRange.start, end: today, days: heatmapTrend.days, total: heatmapTrend.total, mostActive: heatmapTrend.mostActive };
  const topHabit = habits.items[0] || null;
  const insights = [];
  if (taskTrends.total) {
    insights.push({ key: "insightTasks", values: { count: taskTrends.total, days: taskTrends.activeDays } });
    if (taskTrends.mostActive) insights.push({ key: "insightPeak", values: { day: taskTrends.mostActive.date, count: taskTrends.mostActive.count } });
  }
  if (breakdowns.completionRate.rate !== null) insights.push({
    key: "insightDue",
    values: {
      done: breakdowns.completionRate.completed,
      total: breakdowns.completionRate.due,
      rate: breakdowns.completionRate.rate
    }
  });
  if (topHabit && topHabit.eligibleDays && topHabit.rate > 0) insights.push({ key: "insightHabit", values: { habit: `${topHabit.emoji} ${topHabit.name}`, rate: topHabit.rate } });
  if (focus.sessions) insights.push({ key: "insightFocus", values: { minutes: focus.minutes, sessions: focus.sessions } });
  if (!insights.length) insights.push({ key: "insightEmpty", values: {} });
  const previousChange = previousTrend && previousTrend.total
    ? Math.round(((taskTrends.total - previousTrend.total) / previousTrend.total) * 100)
    : previousTrend && taskTrends.total === 0 && previousTrend.total === 0 ? 0 : null;
  return {
    range,
    overview: { historicalCompletions: taskTrends.total, currentCompleted: completedTasks.length, activeDays: taskTrends.activeDays, focusMinutes: focus.minutes },
    taskTrends: { ...taskTrends, previousTotal: previousTrend?.total ?? null, previousChange },
    breakdowns,
    habits,
    focus,
    projects,
    heatmap,
    insights,
    limitations: ["limitationTask", "limitationHabit", "limitationFocus", "limitationProject"]
  };
}

function translator(language) {
  const strings = copy[language] || copy.en;
  return (key, values = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), strings[key] || copy.en[key] || key);
}

function formatDate(key, language, options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat(language === "es" ? "es" : "en", options).format(dateFromKey(key));
}

function section(title, className = "") {
  const element = document.createElement("section");
  element.className = `analytics2-card ${className}`.trim();
  const heading = document.createElement("h3");
  heading.textContent = title;
  element.appendChild(heading);
  return element;
}

function metric(label, value, detail = "") {
  const item = document.createElement("div");
  item.className = "analytics2-metric";
  const strong = document.createElement("strong");
  strong.textContent = value;
  const span = document.createElement("span");
  span.textContent = label;
  item.append(strong, span);
  if (detail) {
    const small = document.createElement("small");
    small.textContent = detail;
    item.appendChild(small);
  }
  return item;
}

function renderBars(container, items, labelFor, emptyText) {
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "analytics2-empty";
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }
  const max = Math.max(...items.map((item) => item.count), 1);
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "analytics2-breakdown-row";
    const header = document.createElement("div");
    const label = document.createElement("span");
    label.textContent = labelFor(item.key);
    const count = document.createElement("strong");
    count.textContent = item.count;
    header.append(label, count);
    const track = document.createElement("div");
    track.className = "analytics2-progress";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", `${label.textContent}: ${item.count}`);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(max));
    track.setAttribute("aria-valuenow", String(item.count));
    const fill = document.createElement("span");
    fill.style.width = `${(item.count / max) * 100}%`;
    track.appendChild(fill);
    row.append(header, track);
    container.appendChild(row);
  });
}

function renderTrendChart(summary, language, t) {
  const card = section(t ("taskTrends"), "analytics2-trend-card");
  const comparison = document.createElement("p");
  comparison.className = "analytics2-comparison";
  if (summary.taskTrends.previousChange === null) comparison.textContent = t ("previousUnavailable");
  else if (summary.taskTrends.previousChange > 0) comparison.textContent = t ("previousUp", { value: summary.taskTrends.previousChange });
  else if (summary.taskTrends.previousChange < 0) comparison.textContent = t ("previousDown", { value: Math.abs(summary.taskTrends.previousChange) });
  else comparison.textContent = t ("previousSame");
  card.appendChild(comparison);
  const stats = document.createElement("div");
  stats.className = "analytics2-metrics analytics2-metrics-compact";
  stats.append(
    metric(t ("historicalCompletions"), summary.taskTrends.total),
    metric(t ("averageActiveDay"), summary.taskTrends.averageActiveDay),
    metric(t ("mostActive"), summary.taskTrends.mostActive ? formatDate(summary.taskTrends.mostActive.date, language) : t ("noActiveDay"), summary.taskTrends.mostActive ? String(summary.taskTrends.mostActive.count) : "")
  );
  card.appendChild(stats);
  const chart = document.createElement("div");
  chart.className = "analytics2-trend";
  chart.setAttribute("role", "img");
  chart.setAttribute("aria-label", `${t ("historicalCompletions")}: ${summary.taskTrends.total}`);
  const visible = summary.taskTrends.days.length > 31
    ? summary.taskTrends.days.filter((_, index) => index % Math.ceil(summary.taskTrends.days.length / 31) === 0 || index === summary.taskTrends.days.length - 1)
    : summary.taskTrends.days;
  const max = Math.max(...visible.map((day) => day.count), 1);
  visible.forEach((day) => {
    const bar = document.createElement("span");
    bar.className = "analytics2-trend-bar";
    bar.style.height = `${Math.max(day.count ? 10 : 2, (day.count / max) * 100)}%`;
    bar.title = `${formatDate(day.date, language)}: ${day.count}`;
    chart.appendChild(bar);
  });
  card.appendChild(chart);
  return card;
}

function renderBreakdowns(summary, language, t, data) {
  const card = section(t ("breakdowns"));
  const grid = document.createElement("div");
  grid.className = "analytics2-breakdown-grid";
  const projectMap = new Map(data.projects.map((project) => [project.id, project]));
  const groups = [
    ["priority", summary.breakdowns.priority, (key) => t(key)],
    ["category", summary.breakdowns.category, (key) => t(key)],
    ["project", summary.breakdowns.project, (key) => {
      if (key === "unassigned") return t ("unassigned");
      const [status, id] = key.split(":");
      const project = projectMap.get(id);
      return `${project?.emoji || "📁"} ${project?.name || t ("unassigned")} · ${t(status)}`;
    }],
    ["recurrence", summary.breakdowns.recurrence, (key) => t(key)]
  ];
  groups.forEach(([titleKey, items, labelFor]) => {
    const group = document.createElement("div");
    const heading = document.createElement("h4");
    heading.textContent = t(titleKey);
    group.appendChild(heading);
    renderBars(group, items, labelFor, t ("noData"));
    grid.appendChild(group);
  });
  card.appendChild(grid);
  const rate = summary.breakdowns.completionRate;
  const rateBox = document.createElement("div");
  rateBox.className = "analytics2-rate";
  rateBox.appendChild(metric(t ("completionRate"), rate.rate === null ? "—" : t ("percent", { value: rate.rate }), rate.rate === null ? t ("noDuePopulation") : t ("completionRateHelp", { done: rate.completed, total: rate.due })));
  card.appendChild(rateBox);
  return card;
}

function renderHabits(summary, t) {
  const card = section(t ("habits"));
  const metrics = document.createElement("div");
  metrics.className = "analytics2-metrics analytics2-metrics-compact";
  metrics.append(metric(t ("consistency"), t ("percent", { value: summary.habits.rate }), t ("eligibleDays", { days: summary.habits.eligibleDays })));
  card.appendChild(metrics);
  const list = document.createElement("div");
  list.className = "analytics2-habit-list";
  summary.habits.items.forEach((habit) => {
    const item = document.createElement("div");
    item.className = "analytics2-habit-row";
    const name = document.createElement("span");
    name.textContent = `${habit.emoji} ${habit.name}`;
    const value = document.createElement("strong");
    value.textContent = `${habit.rate}% · ${habit.completions}/${habit.eligibleDays}`;
    item.append(name, value);
    list.appendChild(item);
  });
  if (!summary.habits.items.length) {
    const empty = document.createElement("p");
    empty.className = "analytics2-empty";
    empty.textContent = t ("noData");
    list.appendChild(empty);
  }
  card.appendChild(list);
  const note = document.createElement("p");
  note.className = "analytics2-note";
  note.textContent = t ("habitAssumption");
  card.appendChild(note);
  return card;
}

function renderFocus(summary, t) {
  const card = section(t ("focus"));
  const metrics = document.createElement("div");
  metrics.className = "analytics2-metrics analytics2-metrics-compact";
  metrics.append(
    metric(t ("completedFocus"), summary.focus.sessions),
    metric(t ("focusMinutes"), summary.focus.minutes),
    metric(t ("averageFocus"), `${summary.focus.averageMinutes} ${t ("minutes")}`),
    metric(t ("completedBreaks"), summary.focus.breaks)
  );
  card.appendChild(metrics);
  const note = document.createElement("p");
  note.className = "analytics2-note";
  note.textContent = t ("stoppedExcluded") + (summary.focus.unavailableTaskLinks ? ` ${t ("unavailableTask")}: ${summary.focus.unavailableTaskLinks}.` : "");
  card.appendChild(note);
  return card;
}

function renderProjects(summary, t) {
  const card = section(t ("projects"));
  const table = document.createElement("div");
  table.className = "analytics2-projects";
  summary.projects.forEach((project) => {
    const row = document.createElement("article");
    const title = document.createElement("h4");
    title.textContent = project.id === "unassigned" ? `📥 ${t ("unassigned")}` : `${project.emoji} ${project.name}`;
    if (project.archived) title.textContent += ` · ${t ("archived")}`;
    const values = document.createElement("p");
    values.textContent = `${t ("currentInventory")}: ${project.currentTasks} · ${t ("rangeCompletions")}: ${project.completions} · ${t ("rangeFocus")}: ${project.focusMinutes} ${t ("minutes")}`;
    row.append(title, values);
    table.appendChild(row);
  });
  if (!summary.projects.length) {
    const empty = document.createElement("p");
    empty.className = "analytics2-empty";
    empty.textContent = t ("noData");
    table.appendChild(empty);
  }
  card.appendChild(table);
  return card;
}

function renderHeatmap(summary, language, t) {
  const card = section(t ("heatmap"));
  const max = Math.max(...summary.heatmap.days.map((day) => day.count), 1);
  const grid = document.createElement("div");
  grid.className = "analytics2-heatmap";
  grid.setAttribute("role", "img");
  const summaryText = summary.heatmap.total
    ? t ("heatmapSummary", { count: summary.heatmap.total, day: formatDate(summary.heatmap.mostActive.date, language) })
    : t ("heatmapEmpty");
  grid.setAttribute("aria-label", summaryText);
  summary.heatmap.days.forEach((day) => {
    const cell = document.createElement("span");
    const level = day.count ? Math.max(1, Math.ceil((day.count / max) * 4)) : 0;
    cell.className = `analytics2-heatmap-cell level-${level}`;
    cell.title = `${formatDate(day.date, language)}: ${day.count}`;
    grid.appendChild(cell);
  });
  card.appendChild(grid);
  const caption = document.createElement("p");
  caption.className = "analytics2-note";
  caption.textContent = summaryText;
  card.appendChild(caption);
  return card;
}

function renderInsights(summary, language, t) {
  const card = section(t ("insights"));
  const list = document.createElement("ul");
  summary.insights.slice(0, 4).forEach((insight) => {
    const item = document.createElement("li");
    const values = { ...insight.values };
    if (values.day) values.day = formatDate(values.day, language, { weekday: "long", month: "short", day: "numeric" });
    item.textContent = t(insight.key, values);
    list.appendChild(item);
  });
  card.appendChild(list);
  return card;
}

export function createAnalyticsUI({ appVersion = "unknown" } = {}) {
  const elements = {
    section: document.getElementById("analytics2Section"),
    eyebrow: document.getElementById("analytics2Eyebrow"),
    title: document.getElementById("analytics2Title"),
    subtitle: document.getElementById("analytics2Subtitle"),
    rangeLabel: document.getElementById("analytics2RangeLabel"),
    range: document.getElementById("analytics2Range"),
    exportButton: document.getElementById("analytics2Export"),
    status: document.getElementById("analytics2Status"),
    body: document.getElementById("analytics2Body")
  };
  let latestData = null;
  let latestSummary = null;

  elements.range?.addEventListener("change", () => {
    if (latestData) render(latestData);
  });
  elements.exportButton?.addEventListener("click", () => {
    if (!latestSummary) return;
    downloadAnalyticsJson(latestSummary, appVersion);
    const t = translator(latestData.language);
    elements.status.textContent = t ("exported");
  });

  function render(data) {
    if (!elements.body) return;
    latestData = data;
    const language = data.language === "es" ? "es" : "en";
    const t = translator(language);
    const selected = ANALYTICS_RANGE_VALUES.includes(elements.range.value) ? elements.range.value : "last30";
    latestSummary = buildAnalyticsSummary(data, selected);
    document.documentElement.lang = language;
    elements.eyebrow.textContent = t ("eyebrow");
    elements.title.textContent = t ("title");
    elements.subtitle.textContent = t ("subtitle");
    elements.rangeLabel.textContent = t ("range");
    elements.exportButton.textContent = t ("export");
    [...elements.range.options].forEach((option) => { option.textContent = t(option.value); });
    elements.body.innerHTML = "";
    const overview = section(t ("overview"), "analytics2-overview");
    const span = document.createElement("p");
    span.className = "analytics2-range-span";
    span.textContent = t ("dateSpan", {
      start: formatDate(latestSummary.range.start, language, { year: "numeric", month: "short", day: "numeric" }),
      end: formatDate(latestSummary.range.end, language, { year: "numeric", month: "short", day: "numeric" })
    });
    overview.appendChild(span);
    const metrics = document.createElement("div");
    metrics.className = "analytics2-metrics";
    metrics.append(
      metric(t ("historicalCompletions"), latestSummary.overview.historicalCompletions),
      metric(t ("currentCompleted"), latestSummary.overview.currentCompleted),
      metric(t ("activeDays"), latestSummary.overview.activeDays),
      metric(t ("focusMinutes"), latestSummary.overview.focusMinutes)
    );
    overview.appendChild(metrics);
    elements.body.append(
      overview,
      renderTrendChart(latestSummary, language, t),
      renderBreakdowns(latestSummary, language, t, data),
      renderHabits(latestSummary, t),
      renderFocus(latestSummary, t),
      renderProjects(latestSummary, t),
      renderHeatmap(latestSummary, language, t),
      renderInsights(latestSummary, language, t)
    );
    const limitations = section(t ("limitations"), "analytics2-limitations");
    const list = document.createElement("ul");
    latestSummary.limitations.forEach((key) => {
      const item = document.createElement("li");
      item.textContent = t(key);
      list.appendChild(item);
    });
    limitations.appendChild(list);
    elements.body.appendChild(limitations);
  }

  return { render };
}
