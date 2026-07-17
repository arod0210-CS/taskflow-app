import { CATEGORIES } from "./constants.js";
import { clearFieldValidation, focusInvalidField, runGuardedAction } from "./interaction-guard.js";

export function sanitizeProjects(rawProjects) {
  if (!Array.isArray(rawProjects)) return [];

  const seenIds = new Set();
  return rawProjects
    .map((project, index) => {
      const createdAt = project?.createdAt || new Date().toISOString();
      const updatedAt = typeof project?.updatedAt === "string" && Number.isFinite(Date.parse(project.updatedAt))
        ? project.updatedAt
        : createdAt;
      return {
        id: String(project?.id ?? `project-${Date.now()}-${index}`),
        name: String(project?.name ?? "").trim().slice(0, 100),
        emoji: String(project?.emoji ?? "📁").trim().slice(0, 8) || "📁",
        description: String(project?.description ?? "").trim().slice(0, 300),
        archived: project?.archived === true,
        createdAt,
        updatedAt
      };
    })
    .filter((project) => {
      if (!project.name || seenIds.has(project.id)) return false;
      seenIds.add(project.id);
      return true;
    });
}

export function sanitizeTaskProjectReferences(tasks, projects) {
  const validIds = new Set(projects.map((project) => project.id));
  return tasks.map((task) => ({
    ...task,
    projectId: task.projectId && validIds.has(task.projectId) ? task.projectId : null
  }));
}

function categoryTranslationKey(category) {
  return `category${category[0].toUpperCase()}${category.slice(1)}`;
}

function replaceSelectOptions(select, options, selectedValue) {
  select.replaceChildren(...options);
  select.value = selectedValue;
}

export function createProjectsUI({
  t,
  addProject,
  renameProject,
  deleteProject,
  setProjectFilter,
  setCategoryFilter
}) {
  const projectEmojiInput = document.getElementById("projectEmojiInput");
  const projectNameInput = document.getElementById("projectNameInput");
  const addProjectButton = document.getElementById("addProjectBtn");
  const projectsList = document.getElementById("projectsList");
  const taskProjectInput = document.getElementById("taskProjectInput");
  const editProjectInput = document.getElementById("editProjectInput");
  const projectFilterInput = document.getElementById("projectFilterInput");
  const taskCategoryInput = document.getElementById("taskCategoryInput");
  const editCategoryInput = document.getElementById("editCategoryInput");
  const categoryFilterInput = document.getElementById("categoryFilterInput");
  let editingProjectId = null;

  function makeOption(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
  }

  function tryAddProject() {
    const name = projectNameInput.value.trim();
    if (!name) {
      focusInvalidField(projectNameInput);
      return;
    }
    const result = runGuardedAction(addProjectButton, () => addProject({
      id: crypto.randomUUID(),
      name,
      emoji: projectEmojiInput.value.trim() || "📁",
      description: "",
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }), { savingLabel: t("saving") });
    if (!result.ok) return;
    projectEmojiInput.value = "";
    projectNameInput.value = "";
    projectNameInput.classList.remove("input-error");
    projectNameInput.focus();
  }

  addProjectButton.addEventListener("click", (event) => {
    event.stopPropagation();
    tryAddProject();
  });
  projectNameInput.addEventListener("input", () => clearFieldValidation(projectNameInput));
  projectNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      tryAddProject();
    }
  });
  projectFilterInput.addEventListener("change", () => setProjectFilter(projectFilterInput.value));
  categoryFilterInput.addEventListener("change", () => setCategoryFilter(categoryFilterInput.value));

  function renderProjectOptions(state) {
    const taskProjectValue = taskProjectInput.value;
    const editProjectValue = editProjectInput.value;
    const projectFilterValue = state.projectFilter;
    const activeProjects = state.projects.filter((project) => !project.archived);
    const archivedFilterProject = state.projects.find((project) => project.archived && project.id === projectFilterValue);
    const projectOptions = activeProjects.map((project) => makeOption(project.id, `${project.emoji} ${project.name}`));
    const editOptions = [
      ...projectOptions.map((option) => option.cloneNode(true)),
      ...state.projects.filter((project) => project.archived)
        .map((project) => makeOption(project.id, `${project.emoji} ${project.name} · ${t("archivedProjects")}`))
    ];
    const filterOptions = archivedFilterProject
      ? [...projectOptions.map((option) => option.cloneNode(true)), makeOption(archivedFilterProject.id, `${archivedFilterProject.emoji} ${archivedFilterProject.name} · ${t("archivedProjects")}`)]
      : projectOptions;

    replaceSelectOptions(taskProjectInput, [makeOption("", t("noProject")), ...projectOptions.map((option) => option.cloneNode(true))], taskProjectValue);
    replaceSelectOptions(editProjectInput, [makeOption("", t("noProject")), ...editOptions], editProjectValue);
    replaceSelectOptions(projectFilterInput, [
      makeOption("all", t("allProjects")),
      makeOption("unassigned", t("unassigned")),
      ...filterOptions
    ], projectFilterValue);
  }

  function renderCategoryOptions(state) {
    const categoryOptions = CATEGORIES.map((category) => makeOption(category, t(categoryTranslationKey(category))));
    replaceSelectOptions(taskCategoryInput, [makeOption("", t("noCategory")), ...categoryOptions.map((option) => option.cloneNode(true))], taskCategoryInput.value);
    replaceSelectOptions(editCategoryInput, [makeOption("", t("noCategory")), ...categoryOptions.map((option) => option.cloneNode(true))], editCategoryInput.value);
    replaceSelectOptions(categoryFilterInput, [makeOption("all", t("allCategories")), ...categoryOptions], state.categoryFilter);
  }

  function renderProjectList(state) {
    if (state.projects.length === 0) {
      const empty = document.createElement("p");
      empty.className = "projects-empty";
      empty.textContent = t("noProjects");
      projectsList.replaceChildren(empty);
      return;
    }

    const rows = state.projects.map((project) => {
      const row = document.createElement("div");
      row.className = "project-row";
      const count = state.tasks.filter((task) => task.projectId === project.id).length;

      if (editingProjectId === project.id) {
        const input = document.createElement("input");
        input.className = "project-rename-input";
        input.value = project.name;
        input.setAttribute("aria-label", t("projectName"));
        const save = document.createElement("button");
        save.type = "button";
        save.textContent = t("save");
        save.addEventListener("click", (event) => {
          event.stopPropagation();
          const nextName = input.value.trim();
          if (!nextName) {
            input.classList.add("input-error");
            input.focus();
            return;
          }
          editingProjectId = null;
          renameProject(project.id, nextName);
        });
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = t("cancel");
        cancel.addEventListener("click", (event) => {
          event.stopPropagation();
          editingProjectId = null;
          render(state);
        });
        row.append(input, save, cancel);
        requestAnimationFrame(() => input.focus());
        return row;
      }

      const identity = document.createElement("div");
      identity.className = "project-identity";
      const name = document.createElement("strong");
      name.textContent = `${project.emoji} ${project.name}`;
      const countLabel = document.createElement("span");
      countLabel.textContent = [
        t("projectTaskCount").replace("{count}", count),
        ...(project.archived ? [t("archivedProjects")] : [])
      ].join(" · ");
      identity.append(name, countLabel);

      const actions = document.createElement("div");
      actions.className = "project-actions";
      const rename = document.createElement("button");
      rename.type = "button";
      rename.textContent = t("renameProject");
      rename.setAttribute("aria-label", `${t("renameProject")}: ${project.name}`);
      rename.addEventListener("click", (event) => {
        event.stopPropagation();
        editingProjectId = project.id;
        render(state);
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "project-delete-btn";
      remove.textContent = t("deleteHabit");
      remove.setAttribute("aria-label", `${t("deleteProject")}: ${project.name}`);
      remove.addEventListener("click", (event) => {
        event.stopPropagation();
        if (confirm(t("deleteProjectConfirm").replace("{name}", project.name))) {
          deleteProject(project.id);
        }
      });
      actions.append(rename, remove);
      row.append(identity, actions);
      return row;
    });

    projectsList.replaceChildren(...rows);
  }

  function render(state) {
    renderProjectOptions(state);
    renderCategoryOptions(state);
    renderProjectList(state);
  }

  return { render };
}
