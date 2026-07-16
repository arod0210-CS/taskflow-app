import { addDays, getTodayString, parseDateOnly, toDateKey } from "./dates.js";
import { formatRecurrence } from "./recurrence.js";

export function getCalendarDays(year, monthIndex) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function groupTasksByDueDate(tasks) {
  return tasks.reduce((groups, task) => {
    if (!task.dueDate) return groups;
    if (!groups.has(task.dueDate)) groups.set(task.dueDate, []);
    groups.get(task.dueDate).push(task);
    return groups;
  }, new Map());
}

function categoryKey(category) {
  return `category${category[0].toUpperCase()}${category.slice(1)}`;
}

export function createCalendar({ t, sortTasks, openTask, toggleTask, prepareTaskForDate }) {
  const elements = {
    heading: document.getElementById("calendarMonthHeading"),
    weekdays: document.getElementById("calendarWeekdays"),
    grid: document.getElementById("calendarGrid"),
    previous: document.getElementById("calendarPreviousBtn"),
    next: document.getElementById("calendarNextBtn"),
    today: document.getElementById("calendarTodayBtn"),
    status: document.getElementById("calendarSelectionStatus"),
    agendaKicker: document.getElementById("agendaKicker"),
    agendaTitle: document.getElementById("agendaTitle"),
    agendaDate: document.getElementById("agendaDate"),
    agendaCount: document.getElementById("agendaCount"),
    agendaIncompleteTitle: document.getElementById("agendaIncompleteTitle"),
    agendaCompletedTitle: document.getElementById("agendaCompletedTitle"),
    agendaIncomplete: document.getElementById("agendaIncompleteList"),
    agendaCompleted: document.getElementById("agendaCompletedList"),
    agendaAddTask: document.getElementById("agendaAddTaskBtn")
  };

  const todayKey = getTodayString();
  const todayDate = parseDateOnly(todayKey);
  let visibleMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  let selectedDate = todayKey;
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

  function fullDateLabel(date, state) {
    return new Intl.DateTimeFormat(locale(state), {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }

  function moveSelection(date, shouldFocus = true) {
    selectedDate = toDateKey(date);
    visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    render(latestState, true);
    if (shouldFocus) {
      requestAnimationFrame(() => {
        elements.grid.querySelector(`[data-date="${selectedDate}"]`)?.focus();
      });
    }
  }

  function renderWeekdays(state) {
    const formatter = new Intl.DateTimeFormat(locale(state), { weekday: "short" });
    const headers = Array.from({ length: 7 }, (_, index) => {
      const header = document.createElement("span");
      header.className = "calendar-weekday";
      header.setAttribute("role", "columnheader");
      header.textContent = formatter.format(new Date(2026, 0, 4 + index)).replace(".", "");
      return header;
    });
    elements.weekdays.replaceChildren(...headers);
  }

  function buildTaskPreview(task, state) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `calendar-task-preview calendar-priority-${task.priority}`;
    if (task.recurrence) button.classList.add("calendar-task-recurring");
    const organization = organizationLabels(task, state);
    const status = task.completed ? t("calendarCompletedStatus") : t("calendarIncompleteStatus");
    const recurrence = task.recurrence ? `${t("recurringTask")}: ${formatRecurrence(task.recurrence, t)}` : null;
    button.setAttribute(
      "aria-label",
      [t("calendarOpenTask"), task.text, status, t(`${task.priority}Priority`), ...organization, recurrence]
        .filter(Boolean)
        .join(": ")
    );

    const marker = document.createElement("span");
    marker.className = "calendar-task-marker";
    marker.setAttribute("aria-hidden", "true");
    const title = document.createElement("span");
    title.className = "calendar-task-title";
    title.textContent = task.text;
    button.append(marker);
    if (task.recurrence) {
      const repeat = document.createElement("span");
      repeat.className = "calendar-recurrence-marker";
      repeat.setAttribute("aria-hidden", "true");
      repeat.textContent = "↻";
      button.appendChild(repeat);
    }
    button.appendChild(title);
    button.addEventListener("click", () => openTask(task.id));
    return button;
  }

  function buildDay(date, state, groupedTasks) {
    const dateKey = toDateKey(date);
    const tasks = sortTasks(groupedTasks.get(dateKey) || []);
    const incompleteCount = tasks.filter((task) => !task.completed).length;
    const completedCount = tasks.length - incompleteCount;
    const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
    const isToday = dateKey === todayKey;
    const isSelected = dateKey === selectedDate;

    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-selected", String(isSelected));
    cell.classList.toggle("calendar-day-outside", !isCurrentMonth);
    cell.classList.toggle("calendar-day-today", isToday);
    cell.classList.toggle("calendar-day-selected", isSelected);

    const select = document.createElement("button");
    select.type = "button";
    select.className = "calendar-day-select";
    select.dataset.date = dateKey;
    select.setAttribute(
      "aria-label",
      `${fullDateLabel(date, state)}. ${t("calendarTaskSummary")}`
        .replace("{incomplete}", incompleteCount)
        .replace("{completed}", completedCount)
    );
    if (isToday) select.setAttribute("aria-current", "date");

    const number = document.createElement("span");
    number.className = "calendar-day-number";
    number.textContent = String(date.getDate());
    select.appendChild(number);

    if (tasks.length > 0) {
      const counts = document.createElement("span");
      counts.className = "calendar-day-counts";
      if (incompleteCount > 0) {
        const open = document.createElement("span");
        open.className = "calendar-count calendar-count-open";
        open.dataset.count = String(incompleteCount);
        open.textContent = `${incompleteCount} ${t("calendarOpenShort")}`;
        counts.appendChild(open);
      }
      if (completedCount > 0) {
        const done = document.createElement("span");
        done.className = "calendar-count calendar-count-done";
        done.dataset.count = String(completedCount);
        done.textContent = `${completedCount} ${t("calendarDoneShort")}`;
        counts.appendChild(done);
      }
      select.appendChild(counts);
    }

    select.addEventListener("click", () => moveSelection(date, false));
    select.addEventListener("keydown", (event) => {
      const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!(event.key in offsets) && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      const offset = event.key === "Home"
        ? -date.getDay()
        : event.key === "End"
          ? 6 - date.getDay()
          : offsets[event.key];
      moveSelection(addDays(date, offset));
    });

    const previews = document.createElement("div");
    previews.className = "calendar-task-previews";
    tasks.slice(0, 3).forEach((task) => previews.appendChild(buildTaskPreview(task, state)));
    if (tasks.length > 3) {
      const more = document.createElement("span");
      more.className = "calendar-more-count";
      more.textContent = t("calendarMoreTasks").replace("{count}", tasks.length - 3);
      previews.appendChild(more);
    }

    cell.append(select, previews);
    return cell;
  }

  function createAgendaEmpty(message) {
    const item = document.createElement("li");
    item.className = "agenda-empty";
    item.setAttribute("role", "status");
    item.textContent = message;
    return item;
  }

  function buildAgendaTask(task, state) {
    const item = document.createElement("li");
    item.className = `agenda-task agenda-priority-${task.priority}${task.completed ? " agenda-task-completed" : ""}`;

    const content = document.createElement("div");
    content.className = "agenda-task-content";
    const title = document.createElement("strong");
    title.textContent = task.text;
    const metadata = document.createElement("span");
    metadata.className = "agenda-task-meta";
    const dueLabel = parseDateOnly(task.dueDate).toLocaleDateString(locale(state), { month: "short", day: "numeric" });
    metadata.textContent = [
      dueLabel,
      t(`${task.priority}Priority`),
      ...organizationLabels(task, state),
      ...(task.recurrence ? [`↻ ${formatRecurrence(task.recurrence, t)}`] : [])
    ].join(" · ");
    content.append(title, metadata);

    if (task.notes) {
      const notes = document.createElement("p");
      notes.className = "agenda-task-notes";
      notes.textContent = task.notes;
      content.appendChild(notes);
    }

    const actions = document.createElement("div");
    actions.className = "agenda-task-actions";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "agenda-complete-btn";
    toggle.setAttribute("aria-label", `${task.completed ? t("markTaskIncomplete") : t("markTaskComplete")}: ${task.text}`);
    toggle.setAttribute("aria-pressed", String(task.completed));
    toggle.textContent = task.completed ? "↶" : "✓";
    toggle.addEventListener("click", () => {
      const willComplete = !task.completed;
      toggleTask(task.id);
      elements.status.textContent = `${willComplete ? t("taskCompletedAnnouncement") : t("taskReopenedAnnouncement")}: ${task.text}`;
    });
    const open = document.createElement("button");
    open.type = "button";
    open.className = "agenda-open-btn";
    open.textContent = t("calendarOpenTask");
    open.setAttribute("aria-label", `${t("calendarOpenTask")}: ${task.text}`);
    open.addEventListener("click", () => openTask(task.id));
    actions.append(toggle, open);
    item.append(content, actions);
    return item;
  }

  function renderAgenda(state) {
    const tasks = sortTasks(state.tasks.filter((task) => task.dueDate === selectedDate));
    const incomplete = tasks.filter((task) => !task.completed);
    const completed = tasks.filter((task) => task.completed);
    const selected = parseDateOnly(selectedDate);

    elements.agendaKicker.textContent = t("calendarSelectedDate");
    elements.agendaTitle.textContent = t("agendaTitle");
    elements.agendaDate.textContent = fullDateLabel(selected, state);
    elements.agendaCount.textContent = t("agendaTaskCount").replace("{count}", tasks.length);
    elements.agendaIncompleteTitle.textContent = t("agendaIncomplete");
    elements.agendaCompletedTitle.textContent = t("agendaCompleted");
    elements.agendaAddTask.textContent = t("agendaAddTask");

    elements.agendaIncomplete.replaceChildren(
      ...(incomplete.length > 0
        ? incomplete.map((task) => buildAgendaTask(task, state))
        : [createAgendaEmpty(t("agendaNoIncomplete"))])
    );
    elements.agendaCompleted.replaceChildren(
      ...(completed.length > 0
        ? completed.map((task) => buildAgendaTask(task, state))
        : [createAgendaEmpty(t("agendaNoCompleted"))])
    );
  }

  function render(state, announce = false) {
    if (!state) return;
    latestState = state;
    const monthFormatter = new Intl.DateTimeFormat(locale(state), { month: "long", year: "numeric" });
    elements.heading.textContent = monthFormatter.format(visibleMonth);
    elements.previous.setAttribute("aria-label", t("calendarPreviousMonth"));
    elements.next.setAttribute("aria-label", t("calendarNextMonth"));
    elements.today.textContent = t("today");
    renderWeekdays(state);

    const groupedTasks = groupTasksByDueDate(state.tasks);
    const days = getCalendarDays(visibleMonth.getFullYear(), visibleMonth.getMonth());
    elements.grid.replaceChildren(...days.map((date) => buildDay(date, state, groupedTasks)));
    renderAgenda(state);
    if (announce) {
      elements.status.textContent = `${t("calendarSelectedDate")}: ${fullDateLabel(parseDateOnly(selectedDate), state)}`;
    }
  }

  elements.previous.addEventListener("click", () => {
    moveSelection(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1), false);
  });
  elements.next.addEventListener("click", () => {
    moveSelection(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1), false);
  });
  elements.today.addEventListener("click", () => moveSelection(parseDateOnly(getTodayString()), true));
  elements.agendaAddTask.addEventListener("click", () => prepareTaskForDate(selectedDate));

  return {
    render,
    getSelectedDate: () => selectedDate
  };
}
