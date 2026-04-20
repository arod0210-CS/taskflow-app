function formatDueDate(dateString) {
  if (!dateString) {
    return "No due date";
  }

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function createPriorityBadge(priority) {
  const badge = document.createElement("span");
  badge.className = `priority-badge priority-${priority}`;

  const icons = {
    high: "🔥",
    medium: "🏃",
    low: "🌱"
  };

  const label = `${priority.charAt(0).toUpperCase()}${priority.slice(1)}`;
  badge.textContent = `${icons[priority] || "•"} ${label}`;

  return badge;
}

function createTaskElement(task, handlers) {
  const li = document.createElement("li");
  li.className = "task-card";

  if (task.dueDate && !task.completed) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate + "T00:00:00");

  if (due.getTime() < today.getTime()) {
    li.classList.add("overdue");
  } else if (due.getTime() === today.getTime()) {
    li.classList.add("due-today");
  }
}
  const main = document.createElement("div");
  main.className = "task-main";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = task.completed ? "toggle-btn completed" : "toggle-btn";
  toggleBtn.type = "button";
  toggleBtn.setAttribute("aria-label", "Toggle task complete");
  toggleBtn.addEventListener("click", () => handlers.onToggle(task.id));

  const content = document.createElement("div");
  content.className = "task-content";

  const taskText = document.createElement("span");
  taskText.className = task.completed ? "task-text completed" : "task-text";
  taskText.textContent = task.text;
  taskText.addEventListener("dblclick", () => handlers.onEdit(task.id));

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const due = document.createElement("span");
  due.className = "due-date";
  due.textContent = `Due: ${formatDueDate(task.dueDate)}`;

  meta.appendChild(due);
  meta.appendChild(createPriorityBadge(task.priority || "medium"));

  content.appendChild(taskText);
  content.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "task-action-btn edit-btn";
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => handlers.onEdit(task.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "task-action-btn delete-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => handlers.onDelete(task.id));

  main.appendChild(toggleBtn);
  main.appendChild(content);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(main);
  li.appendChild(actions);

  return li;
}

window.createTaskElement = createTaskElement;