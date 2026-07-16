import { getTodayString, parseDateOnly } from "./dates.js";
import { formatRecurrence } from "./recurrence.js";
import { calculateProjectMetrics } from "./project-dashboard.js";

function isCompletedToday(task, today) {
  if (!task.completed || !task.completedAt) return false;
  const completed = new Date(task.completedAt);
  const completedKey = [
    completed.getFullYear(),
    String(completed.getMonth() + 1).padStart(2, "0"),
    String(completed.getDate()).padStart(2, "0")
  ].join("-");
  return completedKey === today;
}

function getFocusReason(task, today, t) {
  if (task.dueDate && task.dueDate < today) return t("dashboardOverdue");
  if (task.dueDate === today) return t("dashboardDueToday");
  if (task.priority === "high") return t("dashboardHighPriority");
  return t("dashboardNext");
}

function getLocalDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function getTaskOrganization(task, state, t) {
  const labels = [];
  const project = state.projects?.find((item) => item.id === task.projectId);
  if (project) labels.push(`${project.emoji} ${project.name}${project.archived ? ` · ${t("archived")}` : ""}`);
  if (task.category) {
    const categoryKey = `category${task.category[0].toUpperCase()}${task.category.slice(1)}`;
    labels.push(t(categoryKey));
  }
  return labels;
}

function createEmptyItem(message) {
  const item = document.createElement("li");
  item.className = "dashboard-empty";
  item.setAttribute("role", "status");
  item.textContent = message;
  return item;
}

export function createDashboard({
  t,
  switchTab,
  sortTasks,
  toggleTask,
  toggleHabit,
  xpNeededForLevel,
  openProject
}) {
  const elements = {
    overview: document.getElementById("dashboardOverview"),
    upcoming: document.getElementById("dashboardUpcomingList"),
    focus: document.getElementById("dashboardFocusList"),
    habitSummary: document.getElementById("dashboardHabitSummary"),
    habits: document.getElementById("dashboardHabitList"),
    activity: document.getElementById("dashboardActivity"),
    date: document.getElementById("dashboardDate"),
    projectsSummary: document.getElementById("dashboardProjectsSummary"),
    projects: document.getElementById("dashboardProjectsList")
  };

  function navigateAndFocus(tab, elementId) {
    switchTab(tab);
    requestAnimationFrame(() => document.getElementById(elementId)?.focus());
  }

  document.getElementById("dashboardOpenHabits")?.addEventListener("click", () => switchTab("habits"));
  document.getElementById("dashboardAddTask")?.addEventListener("click", () => navigateAndFocus("tasks", "taskInput"));
  document.getElementById("dashboardAddHabit")?.addEventListener("click", () => navigateAndFocus("habits", "habitNameInput"));
  document.getElementById("dashboardViewStats")?.addEventListener("click", () => switchTab("stats"));
  document.getElementById("dashboardOpenProjects")?.addEventListener("click", () => switchTab("projects"));

  function renderMetric({ icon, label, value, progress }) {
    const card = document.createElement("article");
    card.className = "dashboard-metric";
    card.setAttribute("aria-label", `${label}: ${value}`);

    const iconElement = document.createElement("span");
    iconElement.className = "dashboard-metric-icon";
    iconElement.setAttribute("aria-hidden", "true");
    iconElement.textContent = icon;

    const copy = document.createElement("div");
    copy.className = "dashboard-metric-copy";
    const valueElement = document.createElement("strong");
    valueElement.textContent = value;
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    copy.append(valueElement, labelElement);

    card.append(iconElement, copy);

    if (Number.isFinite(progress)) {
      const track = document.createElement("div");
      track.className = "dashboard-metric-progress";
      track.setAttribute("role", "progressbar");
      track.setAttribute("aria-label", label);
      track.setAttribute("aria-valuemin", "0");
      track.setAttribute("aria-valuemax", "100");
      track.setAttribute("aria-valuenow", String(Math.round(progress)));
      const fill = document.createElement("span");
      fill.style.width = `${Math.min(progress, 100)}%`;
      track.appendChild(fill);
      card.appendChild(track);
    }

    return card;
  }

  function renderOverview(state, today) {
    const remainingToday = state.tasks.filter((task) => !task.completed && task.dueDate === today).length;
    const completedToday = state.tasks.filter((task) => isCompletedToday(task, today)).length;
    const habitsCompleted = state.habits.filter((habit) => habit.completedDates.includes(today)).length;
    const needed = xpNeededForLevel(state.player.level);
    const xpProgress = needed === 0 ? 0 : (state.player.xp / needed) * 100;

    const metrics = [
      { icon: "◎", label: t("dashboardRemainingToday"), value: String(remainingToday) },
      { icon: "✓", label: t("dashboardCompletedToday"), value: String(completedToday) },
      { icon: "◷", label: t("dashboardHabitsMetric"), value: `${habitsCompleted}/${state.habits.length}` },
      { icon: "🔥", label: t("streak"), value: `${state.player.streak} ${state.player.streak === 1 ? t("day") : t("days")}` },
      { icon: "◆", label: t("level"), value: String(state.player.level) },
      { icon: "↗", label: t("xpProgress"), value: `${state.player.xp}/${needed} XP`, progress: xpProgress }
    ];

    elements.overview.replaceChildren(...metrics.map(renderMetric));
  }

  function renderUpcoming(state, today) {
    const tasks = state.tasks
      .filter((task) => !task.completed && task.dueDate)
      .sort((a, b) => {
        const dateDifference = parseDateOnly(a.dueDate) - parseDateOnly(b.dueDate);
        return dateDifference || sortTasks([a, b]).indexOf(a) - sortTasks([a, b]).indexOf(b);
      })
      .slice(0, 5);

    if (tasks.length === 0) {
      elements.upcoming.replaceChildren(createEmptyItem(t("dashboardNoDeadlines")));
      return;
    }

    const locale = state.language === "es" ? "es-ES" : "en-US";
    const items = tasks.map((task) => {
      const item = document.createElement("li");
      item.className = "dashboard-task-row";
      const link = document.createElement("button");
      link.className = "dashboard-task-link";
      link.type = "button";
      link.addEventListener("click", () => switchTab("tasks"));

      const title = document.createElement("strong");
      title.textContent = task.text;
      const metadata = document.createElement("span");
      metadata.className = "dashboard-task-meta";
      const dateLabel = parseDateOnly(task.dueDate).toLocaleDateString(locale, { month: "short", day: "numeric" });
      const status = task.dueDate < today
        ? t("dashboardOverdue")
        : task.dueDate === today
          ? t("dashboardDueToday")
          : dateLabel;
      metadata.textContent = [
        status,
        t(`${task.priority}Priority`),
        ...getTaskOrganization(task, state, t),
        ...(task.recurrence ? [`↻ ${formatRecurrence(task.recurrence, t)}`] : [])
      ].join(" · ");
      link.append(title, metadata);
      item.appendChild(link);
      return item;
    });

    elements.upcoming.replaceChildren(...items);
  }

  function renderFocus(state, today) {
    const sorted = sortTasks(state.tasks.filter((task) => !task.completed));
    const originalOrder = new Map(sorted.map((task, index) => [task.id, index]));
    const bucket = (task) => {
      if (task.dueDate && task.dueDate < today) return 0;
      if (task.dueDate === today) return 1;
      if (task.priority === "high") return 2;
      return 3;
    };
    const tasks = [...sorted]
      .sort((a, b) => bucket(a) - bucket(b) || originalOrder.get(a.id) - originalOrder.get(b.id))
      .slice(0, 3);

    if (tasks.length === 0) {
      elements.focus.replaceChildren(createEmptyItem(t("dashboardNoFocus")));
      return;
    }

    const items = tasks.map((task) => {
      const item = document.createElement("li");
      item.className = "dashboard-focus-row";
      const copy = document.createElement("div");
      const reason = document.createElement("span");
      reason.className = "dashboard-reason";
      reason.textContent = getFocusReason(task, today, t);
      const title = document.createElement("strong");
      title.textContent = task.text;
      copy.append(reason, title);
      const metadataLabels = [
        ...getTaskOrganization(task, state, t),
        ...(task.recurrence ? [`↻ ${formatRecurrence(task.recurrence, t)}`] : [])
      ];
      if (metadataLabels.length > 0) {
        const metadata = document.createElement("span");
        metadata.className = "dashboard-organization";
        metadata.textContent = metadataLabels.join(" · ");
        copy.appendChild(metadata);
      }

      const complete = document.createElement("button");
      complete.className = "dashboard-complete-btn";
      complete.type = "button";
      complete.setAttribute("aria-label", `${t("markTaskComplete")}: ${task.text}`);
      complete.textContent = "✓";
      complete.addEventListener("click", () => toggleTask(task.id));
      item.append(copy, complete);
      return item;
    });

    elements.focus.replaceChildren(...items);
  }

  function renderHabits(state, today) {
    const completedCount = state.habits.filter((habit) => habit.completedDates.includes(today)).length;
    elements.habitSummary.textContent = t("dashboardHabitSummary")
      .replace("{done}", completedCount)
      .replace("{total}", state.habits.length);

    if (state.habits.length === 0) {
      elements.habits.replaceChildren(createEmptyItem(t("dashboardNoHabits")));
      return;
    }

    const incomplete = state.habits
      .filter((habit) => !habit.completedDates.includes(today))
      .slice(0, 3);

    if (incomplete.length === 0) {
      elements.habits.replaceChildren(createEmptyItem(t("dashboardAllHabitsDone")));
      return;
    }

    const items = incomplete.map((habit) => {
      const item = document.createElement("li");
      item.className = "dashboard-habit-row";
      const label = document.createElement("span");
      label.className = "dashboard-habit-name";
      label.textContent = `${habit.emoji} ${habit.name}`;
      const streak = document.createElement("span");
      streak.className = "dashboard-habit-streak";
      streak.textContent = habit.streak > 0 ? `🔥 ${habit.streak}` : "";
      const complete = document.createElement("button");
      complete.className = "dashboard-complete-btn";
      complete.type = "button";
      complete.setAttribute("aria-label", `${t("habitMarkDone")}: ${habit.name}`);
      complete.textContent = "✓";
      complete.addEventListener("click", () => toggleHabit(habit.id));
      item.append(label, streak, complete);
      return item;
    });

    elements.habits.replaceChildren(...items);
  }

  function renderActivity(state) {
    const locale = state.language === "es" ? "es-ES" : "en-US";
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = getLocalDateKey(date);
      days.push({ date, count: Number(state.player.completedByDay?.[key] || 0) });
    }
    const maxCount = Math.max(...days.map((day) => day.count), 1);
    elements.activity.setAttribute("aria-label", t("weeklyProgress"));

    const bars = days.map(({ date, count }) => {
      const dayName = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
      const item = document.createElement("div");
      item.className = "dashboard-activity-day";
      item.setAttribute("role", "img");
      item.setAttribute("aria-label", `${dayName}: ${count} ${t("completed").toLowerCase()}`);
      const countLabel = document.createElement("span");
      countLabel.className = "dashboard-activity-count";
      countLabel.textContent = String(count);
      const track = document.createElement("span");
      track.className = "dashboard-activity-track";
      const fill = document.createElement("span");
      fill.className = "dashboard-activity-fill";
      fill.style.height = `${(count / maxCount) * 100}%`;
      track.appendChild(fill);
      const label = document.createElement("span");
      label.className = "dashboard-activity-label";
      label.textContent = dayName.replace(".", "");
      item.append(countLabel, track, label);
      return item;
    });

    elements.activity.replaceChildren(...bars);
  }

  function renderProjects(state) {
    const active = state.projects.filter((project) => !project.archived);
    const entries = active.map((project) => ({
      project,
      metrics: calculateProjectMetrics(state.tasks, project.id)
    })).sort((a, b) => b.metrics.openTasks - a.metrics.openTasks || a.project.name.localeCompare(b.project.name)).slice(0, 3);
    const totalOpen = active.reduce((total, project) => total + calculateProjectMetrics(state.tasks, project.id).openTasks, 0);
    elements.projectsSummary.textContent = t(active.length === 1 ? "dashboardProjectsSummaryOne" : "dashboardProjectsSummary")
      .replace("{count}", active.length)
      .replace("{open}", totalOpen);
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "dashboard-empty";
      empty.textContent = t("noProjects");
      elements.projects.replaceChildren(empty);
      return;
    }
    elements.projects.replaceChildren(...entries.map(({ project, metrics }) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "dashboard-project-summary-card";
      card.addEventListener("click", () => openProject(project.id));
      const name = document.createElement("strong");
      name.textContent = `${project.emoji} ${project.name}`;
      const open = document.createElement("span");
      open.textContent = metrics.openTasks === 1
        ? t("dashboardProjectOpenTask")
        : t("dashboardProjectOpenTasks").replace("{count}", metrics.openTasks);
      card.append(name, open);
      if (metrics.nearestDeadline) {
        const deadline = document.createElement("span");
        deadline.textContent = t("dashboardProjectDeadline").replace(
          "{date}",
          parseDateOnly(metrics.nearestDeadline).toLocaleDateString(state.language === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric" })
        );
        card.appendChild(deadline);
      }
      return card;
    }));
  }

  function render(state) {
    const today = getTodayString();
    const locale = state.language === "es" ? "es-ES" : "en-US";
    elements.date.textContent = new Date().toLocaleDateString(locale, {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
    renderOverview(state, today);
    renderUpcoming(state, today);
    renderFocus(state, today);
    renderHabits(state, today);
    renderActivity(state);
    renderProjects(state);
  }

  return { render };
}
