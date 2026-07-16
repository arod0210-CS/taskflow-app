import { getTodayString, parseDateOnly } from "./dates.js";
import { formatRecurrence } from "./recurrence.js";

export const UNASSIGNED_PROJECT_ID = "__unassigned__";

function localDateKey(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function belongsToProject(task, projectId) {
  return projectId === UNASSIGNED_PROJECT_ID ? !task.projectId : task.projectId === projectId;
}

export function calculateProjectMetrics(tasks, projectId, now = new Date()) {
  const today = localDateKey(now) || getTodayString();
  const projectTasks = tasks.filter((task) => belongsToProject(task, projectId));
  const openTasks = projectTasks.filter((task) => !task.completed);
  const completedTasks = projectTasks.filter((task) => task.completed);
  const deadlineTasks = openTasks.filter((task) => task.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return {
    tasks: projectTasks,
    totalTasks: projectTasks.length,
    openTasks: openTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: openTasks.filter((task) => task.dueDate && task.dueDate < today).length,
    completedToday: completedTasks.filter((task) => localDateKey(task.completedAt) === today).length,
    completionPercent: projectTasks.length ? Math.round((completedTasks.length / projectTasks.length) * 100) : null,
    nearestDeadline: deadlineTasks[0]?.dueDate || null
  };
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatDate(dateKey, language, options = { month: "short", day: "numeric" }) {
  if (!dateKey) return "";
  return parseDateOnly(dateKey).toLocaleDateString(language === "es" ? "es-ES" : "en-US", options);
}

function projectName(project, t) {
  return project ? `${project.emoji} ${project.name}` : `📥 ${t("unassigned")}`;
}

export function createRichProjectsUI({
  t,
  switchTab,
  sortTasks,
  openTask,
  toggleTask,
  prepareFocus,
  prepareTaskForProject,
  viewProjectTasks,
  viewProjectCalendar,
  openCreateProject,
  updateProject,
  archiveProject,
  deleteProject
}) {
  const elements = {
    overview: document.getElementById("projectsOverview"),
    detail: document.getElementById("projectDetail"),
    activeGrid: document.getElementById("activeProjectsGrid"),
    archivedGrid: document.getElementById("archivedProjectsGrid"),
    archivedSection: document.getElementById("archivedProjectsSection"),
    archivedToggle: document.getElementById("archivedProjectsToggle"),
    count: document.getElementById("projectsPageCount"),
    status: document.getElementById("projectsPageStatus"),
    detailStatus: document.getElementById("projectDetailStatus"),
    empty: document.getElementById("projectsEmptyState"),
    create: document.getElementById("projectsCreateBtn"),
    emptyCreate: document.getElementById("projectsEmptyCreateBtn"),
    back: document.getElementById("projectDetailBack"),
    identity: document.getElementById("projectDetailIdentity"),
    description: document.getElementById("projectDetailDescription"),
    metrics: document.getElementById("projectDetailMetrics"),
    progress: document.getElementById("projectDetailProgress"),
    progressFill: document.getElementById("projectDetailProgressFill"),
    progressText: document.getElementById("projectDetailProgressText"),
    search: document.getElementById("projectDetailSearch"),
    statusFilter: document.getElementById("projectDetailStatusFilter"),
    openList: document.getElementById("projectDetailOpenTasks"),
    completedList: document.getElementById("projectDetailCompletedTasks"),
    openHeading: document.getElementById("projectDetailOpenHeading"),
    completedHeading: document.getElementById("projectDetailCompletedHeading"),
    deadlines: document.getElementById("projectDeadlineList"),
    activity: document.getElementById("projectActivityList"),
    addTask: document.getElementById("projectAddTaskBtn"),
    viewTasks: document.getElementById("projectViewTasksBtn"),
    viewCalendar: document.getElementById("projectViewCalendarBtn"),
    edit: document.getElementById("projectEditBtn"),
    archive: document.getElementById("projectArchiveBtn"),
    remove: document.getElementById("projectDeleteBtn"),
    editDialog: document.getElementById("projectEditDialog"),
    editForm: document.getElementById("projectEditForm"),
    editEmoji: document.getElementById("projectEditEmoji"),
    editName: document.getElementById("projectEditName"),
    editDescription: document.getElementById("projectEditDescription"),
    editCancel: document.getElementById("projectEditCancel"),
    editSave: document.getElementById("projectEditSave")
  };
  let latestState = null;
  let selectedProjectId = null;
  let detailReturnFocus = null;
  let editReturnFocus = null;
  let archivedExpanded = false;

  function announce(key, replacements = {}) {
    let message = t(key);
    Object.entries(replacements).forEach(([name, value]) => { message = message.replace(`{${name}}`, value); });
    elements.status.textContent = message;
    elements.detailStatus.textContent = message;
  }

  function currentProject() {
    if (selectedProjectId === UNASSIGNED_PROJECT_ID) return null;
    return latestState?.projects.find((project) => project.id === selectedProjectId) || null;
  }

  function currentTasks() {
    return latestState?.tasks.filter((task) => belongsToProject(task, selectedProjectId)) || [];
  }

  function renderProgress(container, metrics, label) {
    container.replaceChildren();
    if (metrics.completionPercent === null) {
      container.appendChild(createElement("span", "project-card-empty-progress", t("projectNoProgress")));
      return;
    }
    const track = createElement("span", "project-progress-track");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", label);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", String(metrics.completionPercent));
    const fill = createElement("span", "project-progress-fill");
    fill.style.width = `${metrics.completionPercent}%`;
    track.appendChild(fill);
    container.append(track, createElement("strong", "project-progress-value", `${metrics.completionPercent}%`));
  }

  function openDetail(id, trigger) {
    selectedProjectId = id;
    detailReturnFocus = trigger || document.activeElement;
    elements.search.value = "";
    elements.statusFilter.value = "all";
    elements.overview.classList.add("hidden");
    elements.detail.classList.remove("hidden");
    renderDetail();
    requestAnimationFrame(() => elements.back.focus());
  }

  function closeDetail() {
    const previousProjectId = selectedProjectId;
    selectedProjectId = null;
    elements.detail.classList.add("hidden");
    elements.overview.classList.remove("hidden");
    renderOverview();
    const fallbackCard = Array.from(document.querySelectorAll(".rich-project-card"))
      .find((card) => card.dataset.projectId === previousProjectId);
    const fallback = fallbackCard?.querySelector(".rich-project-card-open") || elements.create;
    if (detailReturnFocus?.isConnected) detailReturnFocus.focus();
    else fallback.focus();
    detailReturnFocus = null;
  }

  function renderProjectCard(project, id) {
    const metrics = calculateProjectMetrics(latestState.tasks, id);
    const card = createElement("article", `rich-project-card${project?.archived ? " rich-project-card-archived" : ""}`);
    card.dataset.projectId = id;
    const button = createElement("button", "rich-project-card-open");
    button.type = "button";
    button.setAttribute("aria-label", `${t("openProject")}: ${projectName(project, t)}`);
    button.addEventListener("click", (event) => openDetail(id, event.currentTarget));
    const header = createElement("span", "rich-project-card-header");
    header.append(
      createElement("span", "rich-project-emoji", project?.emoji || "📥"),
      createElement("strong", "rich-project-name", project?.name || t("unassigned"))
    );
    if (project?.archived) header.appendChild(createElement("span", "project-archive-badge", t("archived")));
    const description = createElement("span", "rich-project-description", project?.description || (project ? t("projectNoDescription") : t("unassignedProjectDescription")));
    const metricsRow = createElement("span", "rich-project-card-metrics");
    metricsRow.append(
      createElement("span", "", metrics.openTasks === 1 ? `1 ${t("openTaskSingular")}` : `${metrics.openTasks} ${t("openTasks").toLocaleLowerCase()}`),
      createElement("span", "", metrics.completedTasks === 1 ? `1 ${t("completedTaskSingular")}` : `${metrics.completedTasks} ${t("completedTasks").toLocaleLowerCase()}`),
      createElement("span", metrics.overdueTasks ? "project-overdue-value" : "", `${metrics.overdueTasks} ${t("overdue").toLocaleLowerCase()}`)
    );
    const progress = createElement("span", "rich-project-card-progress");
    renderProgress(progress, metrics, `${t("completionProgress")}: ${project?.name || t("unassigned")}`);
    const footer = createElement("span", "rich-project-card-footer");
    footer.textContent = metrics.nearestDeadline
      ? `${t("nearestDeadline")}: ${formatDate(metrics.nearestDeadline, latestState.language)}`
      : t("noUpcomingDeadlines");
    button.append(header, description, metricsRow, progress, footer);
    card.appendChild(button);
    return card;
  }

  function renderOverview() {
    if (!latestState) return;
    const active = latestState.projects.filter((project) => !project.archived);
    const archived = latestState.projects.filter((project) => project.archived);
    elements.count.textContent = active.length === 1 ? t("projectCountOne") : t("projectCount").replace("{count}", active.length);
    elements.empty.classList.toggle("hidden", active.length > 0);
    elements.activeGrid.classList.remove("hidden");
    elements.activeGrid.replaceChildren(
      renderProjectCard(null, UNASSIGNED_PROJECT_ID),
      ...active.map((project) => renderProjectCard(project, project.id))
    );
    elements.archivedSection.classList.toggle("hidden", archived.length === 0);
    elements.archivedToggle.setAttribute("aria-expanded", String(archivedExpanded));
    elements.archivedGrid.classList.toggle("hidden", !archivedExpanded);
    elements.archivedGrid.replaceChildren(...archived.map((project) => renderProjectCard(project, project.id)));
  }

  function taskMetadata(task) {
    const values = [t(`${task.priority}Priority`)];
    if (task.category) values.push(t(`category${task.category[0].toUpperCase()}${task.category.slice(1)}`));
    if (task.recurrence) values.push(`↻ ${formatRecurrence(task.recurrence, t)}`);
    return values.join(" · ");
  }

  function createTaskActions(task, compact = false) {
    const actions = createElement("span", compact ? "project-task-actions project-task-actions-compact" : "project-task-actions");
    const open = createElement("button", "", t("openTask"));
    open.type = "button";
    open.addEventListener("click", () => openTask(task.id));
    const complete = createElement("button", "", task.completed ? t("reopenTasks") : t("markTaskComplete"));
    complete.type = "button";
    complete.addEventListener("click", () => toggleTask(task.id));
    actions.append(open, complete);
    if (!task.completed) {
      const focus = createElement("button", "", t("focusTaskAction"));
      focus.type = "button";
      focus.addEventListener("click", () => prepareFocus(task.id));
      actions.appendChild(focus);
    }
    return actions;
  }

  function createTaskRow(task) {
    const item = createElement("li", `project-task-row${task.completed ? " project-task-row-completed" : ""}`);
    const copy = createElement("div", "project-task-copy");
    copy.append(createElement("strong", "", task.text), createElement("span", "", taskMetadata(task)));
    if (task.dueDate) copy.appendChild(createElement("span", task.dueDate < getTodayString() && !task.completed ? "project-task-overdue" : "", `${t("dueDate")}: ${formatDate(task.dueDate, latestState.language)}`));
    item.append(copy, createTaskActions(task));
    return item;
  }

  function filteredDetailTasks() {
    const query = elements.search.value.trim().toLocaleLowerCase();
    const status = elements.statusFilter.value;
    return sortTasks(currentTasks()).filter((task) => {
      if (status === "open" && task.completed) return false;
      if (status === "completed" && !task.completed) return false;
      if (!query) return true;
      return [task.text, task.notes, task.category].filter(Boolean).join(" ").toLocaleLowerCase().includes(query);
    });
  }

  function renderTaskLists() {
    const tasks = filteredDetailTasks();
    const open = tasks.filter((task) => !task.completed);
    const completed = tasks.filter((task) => task.completed);
    elements.openHeading.textContent = `${t("openTasks")} (${open.length})`;
    elements.completedHeading.textContent = `${t("completedTasks")} (${completed.length})`;
    const empty = () => {
      const item = createElement("li", "project-detail-empty", t("noTasksInProject"));
      item.setAttribute("role", "status");
      return item;
    };
    elements.openList.replaceChildren(...(open.length ? open.map(createTaskRow) : [empty()]));
    elements.completedList.replaceChildren(...(completed.length ? completed.map(createTaskRow) : [empty()]));
  }

  function renderDeadlines(tasks) {
    const order = new Map(sortTasks(tasks).map((task, index) => [task.id, index]));
    const deadlines = tasks.filter((task) => !task.completed && task.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || order.get(a.id) - order.get(b.id))
      .slice(0, 5);
    if (!deadlines.length) {
      elements.deadlines.replaceChildren(createElement("li", "project-detail-empty", t("noUpcomingDeadlines")));
      return;
    }
    elements.deadlines.replaceChildren(...deadlines.map((task) => {
      const item = createElement("li", "project-deadline-row");
      const copy = createElement("div", "project-task-copy");
      const today = getTodayString();
      const dueStatus = task.dueDate < today ? t("overdue") : task.dueDate === today ? t("dashboardDueToday") : formatDate(task.dueDate, latestState.language);
      copy.append(createElement("strong", "", task.text), createElement("span", task.dueDate < today ? "project-task-overdue" : "", `${dueStatus} · ${taskMetadata(task)}`));
      item.append(copy, createTaskActions(task, true));
      return item;
    }));
  }

  function renderActivity(tasks) {
    const taskIds = new Set(tasks.map((task) => task.id));
    const activities = [];
    tasks.forEach((task) => {
      if (task.completedAt) activities.push({ at: task.completedAt, label: t("projectTaskCompletedActivity").replace("{task}", task.text) });
      if (task.createdAt) activities.push({ at: task.createdAt, label: t("projectTaskCreatedActivity").replace("{task}", task.text) });
    });
    (latestState.focusHistory || []).forEach((entry) => {
      if (entry.completed && entry.mode === "focus" && taskIds.has(entry.taskId)) {
        activities.push({ at: entry.endedAt, label: t("projectFocusActivity").replace("{minutes}", Math.round(entry.durationSeconds / 60)) });
      }
    });
    const recent = activities.filter((item) => Number.isFinite(Date.parse(item.at))).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 8);
    if (!recent.length) {
      elements.activity.replaceChildren(createElement("li", "project-detail-empty", t("noRecentActivity")));
      return;
    }
    elements.activity.replaceChildren(...recent.map((activity) => {
      const item = createElement("li", "project-activity-row");
      item.append(createElement("span", "", activity.label), createElement("time", "", new Date(activity.at).toLocaleDateString(latestState.language === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric" })));
      return item;
    }));
  }

  function renderDetail() {
    if (!latestState || !selectedProjectId) return;
    const project = currentProject();
    if (selectedProjectId !== UNASSIGNED_PROJECT_ID && !project) {
      closeDetail();
      return;
    }
    const metrics = calculateProjectMetrics(latestState.tasks, selectedProjectId);
    elements.identity.textContent = projectName(project, t);
    elements.description.textContent = project?.description || (project ? t("projectNoDescription") : t("unassignedProjectDescription"));
    const metricValues = [
      [t("openTasks"), metrics.openTasks],
      [t("completedTasks"), metrics.completedTasks],
      [t("overdue"), metrics.overdueTasks],
      [t("completedToday"), metrics.completedToday]
    ];
    elements.metrics.replaceChildren(...metricValues.map(([label, value]) => {
      const card = createElement("div", "project-detail-metric");
      card.append(createElement("strong", "", String(value)), createElement("span", "", label));
      return card;
    }));
    if (metrics.completionPercent === null) {
      elements.progress.setAttribute("aria-valuetext", t("projectNoProgress"));
      elements.progress.removeAttribute("aria-valuenow");
      elements.progressFill.style.width = "0%";
      elements.progressText.textContent = t("projectNoProgress");
    } else {
      elements.progress.removeAttribute("aria-valuetext");
      elements.progress.setAttribute("aria-valuenow", String(metrics.completionPercent));
      elements.progressFill.style.width = `${metrics.completionPercent}%`;
      elements.progressText.textContent = `${metrics.completionPercent}%`;
    }
    elements.edit.classList.toggle("hidden", !project);
    elements.archive.classList.toggle("hidden", !project);
    elements.remove.classList.toggle("hidden", !project);
    elements.addTask.disabled = Boolean(project?.archived);
    elements.archive.textContent = project?.archived ? t("restoreProject") : t("archiveProject");
    renderTaskLists();
    renderDeadlines(metrics.tasks);
    renderActivity(metrics.tasks);
  }

  function openEditDialog(trigger) {
    const project = currentProject();
    if (!project) return;
    editReturnFocus = trigger || document.activeElement;
    elements.editEmoji.value = project.emoji;
    elements.editName.value = project.name;
    elements.editDescription.value = project.description;
    elements.editDialog.classList.remove("hidden");
    requestAnimationFrame(() => elements.editName.focus());
  }

  function closeEditDialog() {
    elements.editDialog.classList.add("hidden");
    if (editReturnFocus?.isConnected) editReturnFocus.focus();
    editReturnFocus = null;
  }

  [elements.create, elements.emptyCreate].forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    openCreateProject();
  }));
  elements.back.addEventListener("click", closeDetail);
  elements.archivedToggle.addEventListener("click", () => {
    archivedExpanded = !archivedExpanded;
    renderOverview();
  });
  elements.search.addEventListener("input", renderTaskLists);
  elements.statusFilter.addEventListener("change", renderTaskLists);
  elements.addTask.addEventListener("click", () => prepareTaskForProject(selectedProjectId));
  elements.viewTasks.addEventListener("click", () => viewProjectTasks(selectedProjectId));
  elements.viewCalendar.addEventListener("click", () => viewProjectCalendar(selectedProjectId));
  elements.edit.addEventListener("click", (event) => openEditDialog(event.currentTarget));
  elements.archive.addEventListener("click", () => {
    const project = currentProject();
    if (!project) return;
    const shouldArchive = !project.archived;
    archiveProject(project.id, shouldArchive);
    announce(shouldArchive ? "projectArchived" : "projectRestored");
  });
  elements.remove.addEventListener("click", () => {
    const project = currentProject();
    if (!project) return;
    if (!confirm(t("deleteProjectDetailConfirm").replace("{name}", project.name))) return;
    deleteProject(project.id);
    selectedProjectId = null;
    elements.detail.classList.add("hidden");
    elements.overview.classList.remove("hidden");
    announce("projectDeletedTasksUnassigned");
  });
  elements.editCancel.addEventListener("click", closeEditDialog);
  elements.editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const project = currentProject();
    const name = elements.editName.value.trim();
    if (!project || !name) {
      elements.editName.focus();
      return;
    }
    updateProject(project.id, {
      emoji: elements.editEmoji.value.trim() || "📁",
      name,
      description: elements.editDescription.value.trim()
    });
    closeEditDialog();
    announce("projectUpdated");
  });
  elements.editDialog.addEventListener("click", (event) => {
    if (event.target === elements.editDialog) closeEditDialog();
  });
  document.addEventListener("keydown", (event) => {
    if (elements.editDialog.classList.contains("hidden")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeEditDialog();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [elements.editEmoji, elements.editName, elements.editDescription, elements.editCancel, elements.editSave];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  function render(state) {
    latestState = state;
    if (selectedProjectId) renderDetail();
    else renderOverview();
  }

  return {
    openProject(projectId) {
      switchTab("projects");
      openDetail(projectId, document.getElementById("tab-projects"));
    },
    render
  };
}
