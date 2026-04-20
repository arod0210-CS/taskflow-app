function createTaskElement(task, handlers) {
  const li = document.createElement("li");
  li.className = "task-card";

  const main = document.createElement("div");
  main.className = "task-main";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = task.completed ? "toggle-btn completed" : "toggle-btn";
  toggleBtn.type = "button";
  toggleBtn.addEventListener("click", () => handlers.onToggle(task.id));

  const content = document.createElement("div");
  content.style.display = "flex";
  content.style.flexDirection = "column";
  content.style.gap = "4px";

  const taskText = document.createElement("span");
  taskText.className = task.completed ? "task-text completed" : "task-text";
  taskText.textContent = task.text;
  taskText.addEventListener("dblclick", () => handlers.onEdit(task.id));

  content.appendChild(taskText);

  if (task.dueDate) {
    const due = document.createElement("small");
    due.textContent = "Due: " + new Date(task.dueDate).toLocaleDateString();
    due.style.opacity = "0.75";
    content.appendChild(due);
  }

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