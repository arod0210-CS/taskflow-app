import { addDays, parseDateOnly, toDateKey } from "./dates.js";
import { formatRecurrence } from "./recurrence.js";

function categoryKey(category) {
  return `category${category[0].toUpperCase()}${category.slice(1)}`;
}

export function selectReminders(state, now = new Date()) {
  const today = toDateKey(now);
  const tomorrow = toDateKey(addDays(now, 1));
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const taskItems = state.tasks
    .filter((task) => !task.completed && task.dueDate && task.dueDate <= tomorrow)
    .map((task) => ({
      id: task.id,
      kind: "task",
      item: task,
      status: task.dueDate < today ? "overdue" : task.dueDate === today ? "today" : "tomorrow",
      actionable: task.dueDate <= today
    }));

  const habitItems = state.habits
    .filter((habit) => habit.reminderTime && !habit.completedDates.includes(today))
    .map((habit) => ({
      id: habit.id,
      kind: "habit",
      item: habit,
      status: habit.reminderTime < currentTime ? "missedHabit" : "habit",
      actionable: true
    }));

  const actionable = [...taskItems.filter((entry) => entry.actionable), ...habitItems]
    .sort((a, b) => {
      const statusOrder = { overdue: 0, today: 1, missedHabit: 2, habit: 3 };
      const statusDifference = statusOrder[a.status] - statusOrder[b.status];
      if (statusDifference) return statusDifference;
      if (a.kind === "task" && b.kind === "task") {
        return priorityOrder[a.item.priority] - priorityOrder[b.item.priority];
      }
      if (a.kind === "habit" && b.kind === "habit") {
        return a.item.reminderTime.localeCompare(b.item.reminderTime);
      }
      return 0;
    });

  return {
    actionable,
    upcoming: taskItems.filter((entry) => entry.status === "tomorrow")
  };
}

export function createReminderCenter({
  t,
  openTask,
  toggleTask,
  openHabit,
  toggleHabit,
  closeSettings
}) {
  const elements = {
    button: document.getElementById("reminderCenterBtn"),
    badge: document.getElementById("reminderCenterBadge"),
    panel: document.getElementById("reminderCenterPanel"),
    close: document.getElementById("reminderCenterClose"),
    title: document.getElementById("reminderCenterTitle"),
    subtitle: document.getElementById("reminderCenterSubtitle"),
    summary: document.getElementById("reminderCenterSummary"),
    actionableTitle: document.getElementById("reminderActionableTitle"),
    actionableList: document.getElementById("reminderActionableList"),
    upcomingSection: document.getElementById("reminderUpcomingSection"),
    upcomingTitle: document.getElementById("reminderUpcomingTitle"),
    upcomingList: document.getElementById("reminderUpcomingList")
  };
  let latestState = null;

  function locale(state) {
    return state.language === "es" ? "es-ES" : "en-US";
  }

  function organizationLabels(task, state) {
    const labels = [];
    const project = state.projects.find((item) => item.id === task.projectId);
    if (project) labels.push(`${project.emoji} ${project.name}`);
    if (task.category) labels.push(t(categoryKey(task.category)));
    return labels;
  }

  function statusLabel(entry) {
    const keys = {
      overdue: "reminderOverdue",
      today: "reminderDueToday",
      tomorrow: "reminderDueTomorrow",
      habit: "reminderHabitUpcoming",
      missedHabit: "reminderHabitMissed"
    };
    return t(keys[entry.status]);
  }

  function close(restoreFocus = true) {
    if (elements.panel.classList.contains("hidden")) return;
    elements.panel.classList.add("hidden");
    elements.button.setAttribute("aria-expanded", "false");
    if (restoreFocus) elements.button.focus();
  }

  function open() {
    closeSettings();
    if (latestState) render(latestState);
    elements.panel.classList.remove("hidden");
    elements.button.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => elements.close.focus());
  }

  function createEmpty() {
    const item = document.createElement("li");
    item.className = "reminder-center-empty";
    item.setAttribute("role", "status");
    item.textContent = t("reminderNone");
    return item;
  }

  function buildReminder(entry, state) {
    const row = document.createElement("li");
    row.className = `reminder-center-item reminder-${entry.kind} reminder-status-${entry.status}`;

    const copy = document.createElement("div");
    copy.className = "reminder-item-copy";
    const type = document.createElement("span");
    type.className = "reminder-item-type";
    type.textContent = entry.kind === "task" ? t("reminderTaskType") : t("reminderHabitType");
    const title = document.createElement("strong");
    title.textContent = entry.kind === "task"
      ? entry.item.text
      : `${entry.item.emoji} ${entry.item.name}`;
    const metadata = document.createElement("span");
    metadata.className = "reminder-item-meta";

    if (entry.kind === "task") {
      const date = parseDateOnly(entry.item.dueDate).toLocaleDateString(locale(state), { month: "short", day: "numeric" });
      metadata.textContent = [
        statusLabel(entry),
        date,
        t(`${entry.item.priority}Priority`),
        ...organizationLabels(entry.item, state),
        ...(entry.item.recurrence ? [`↻ ${formatRecurrence(entry.item.recurrence, t)}`] : [])
      ].join(" · ");
    } else {
      metadata.textContent = `${statusLabel(entry)} · ${entry.item.reminderTime}`;
    }
    copy.append(type, title, metadata);

    const actions = document.createElement("div");
    actions.className = "reminder-item-actions";
    const complete = document.createElement("button");
    complete.type = "button";
    complete.className = "reminder-complete-action";
    complete.textContent = t("reminderMarkComplete");
    complete.setAttribute(
      "aria-label",
      `${t("reminderMarkComplete")}: ${entry.kind === "task" ? entry.item.text : entry.item.name}`
    );
    complete.addEventListener("click", (event) => {
      event.stopPropagation();
      if (entry.kind === "task") toggleTask(entry.id);
      else toggleHabit(entry.id);
    });

    const openAction = document.createElement("button");
    openAction.type = "button";
    openAction.className = "reminder-open-action";
    openAction.textContent = entry.kind === "task" ? t("reminderOpenTask") : t("reminderOpenHabit");
    openAction.setAttribute(
      "aria-label",
      `${openAction.textContent}: ${entry.kind === "task" ? entry.item.text : entry.item.name}`
    );
    openAction.addEventListener("click", (event) => {
      event.stopPropagation();
      close(false);
      if (entry.kind === "task") {
        elements.button.focus();
        openTask(entry.id);
      } else {
        openHabit(entry.id);
      }
    });
    actions.append(complete, openAction);
    row.append(copy, actions);
    return row;
  }

  function render(state) {
    latestState = state;
    const reminders = selectReminders(state);
    const count = reminders.actionable.length;
    elements.title.textContent = t("reminderCenterTitle");
    elements.subtitle.textContent = t("reminderCenterSubtitle");
    elements.close.setAttribute("aria-label", t("reminderCenterClose"));
    elements.actionableTitle.textContent = t("reminderNeedsAttention");
    elements.upcomingTitle.textContent = t("reminderTomorrowSection");
    elements.summary.textContent = t("reminderSummary").replace("{count}", count);
    elements.badge.textContent = count > 99 ? "99+" : String(count);
    elements.badge.classList.toggle("hidden", count === 0);
    elements.button.setAttribute(
      "aria-label",
      `${t("reminderCenterTitle")}. ${t("reminderSummary").replace("{count}", count)}`
    );
    elements.actionableList.replaceChildren(
      ...(reminders.actionable.length > 0
        ? reminders.actionable.map((entry) => buildReminder(entry, state))
        : [createEmpty()])
    );
    elements.upcomingSection.classList.toggle("hidden", reminders.upcoming.length === 0);
    elements.upcomingList.replaceChildren(...reminders.upcoming.map((entry) => buildReminder(entry, state)));
  }

  elements.button.addEventListener("click", (event) => {
    event.stopPropagation();
    if (elements.panel.classList.contains("hidden")) open();
    else close();
  });
  elements.close.addEventListener("click", (event) => {
    event.stopPropagation();
    close();
  });
  document.addEventListener("click", (event) => {
    if (
      !elements.panel.classList.contains("hidden") &&
      !elements.panel.contains(event.target) &&
      !elements.button.contains(event.target)
    ) {
      close();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.panel.classList.contains("hidden")) {
      event.preventDefault();
      close();
    }
  });

  return { render, close };
}
