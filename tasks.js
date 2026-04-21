window.createTaskElement = function(task, handlers) {
  // 1. Create the main card container
  const li = document.createElement("li");
  li.className = "task-card";

  // Check if overdue or due today (optional styling based on your CSS)
  if (task.dueDate && !task.completed) {
    const today = new Date().toISOString().split("T")[0];
    if (task.dueDate < today) li.classList.add("overdue");
    if (task.dueDate === today) li.classList.add("due-today");
  }

  // 2. Create the main layout wrapper
  const mainWrapper = document.createElement("div");
  mainWrapper.className = "task-main";

  // 3. Create the toggle (complete) button
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "toggle-btn";
  if (task.completed) toggleBtn.classList.add("completed");
  toggleBtn.addEventListener("click", () => handlers.onToggle(task.id));

  // 4. Create the content wrapper
  const content = document.createElement("div");
  content.className = "task-content";

  // 5. Create the task text
  const textSpan = document.createElement("span");
  textSpan.className = "task-text";
  if (task.completed) textSpan.classList.add("completed");
  textSpan.textContent = task.text;

  // 6. Create the metadata row (Date & Priority)
  const meta = document.createElement("div");
  meta.className = "task-meta";

  if (task.dueDate) {
    const dateSpan = document.createElement("span");
    dateSpan.className = "due-date";
    // Format date nicely (e.g., "Due: 2024-05-12")
    dateSpan.textContent = `Due: ${task.dueDate}`;
    meta.appendChild(dateSpan);
  }

  const prioritySpan = document.createElement("span");
  prioritySpan.className = `priority-badge priority-${task.priority}`;
  // Capitalize the first letter (e.g., "High", "Medium")
  prioritySpan.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  meta.appendChild(prioritySpan);

  // Assemble the left side
  content.appendChild(textSpan);
  content.appendChild(meta);
  mainWrapper.appendChild(toggleBtn);
  mainWrapper.appendChild(content);
  li.appendChild(mainWrapper);

  // 7. Create the Action Buttons (Edit/Delete) - Only show if Edit Mode is ON
  const isEditMode = typeof window.getEditMode === "function" ? window.getEditMode() : false;

  if (isEditMode) {
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "task-action-btn edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => handlers.onEdit(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-action-btn delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => handlers.onDelete(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);
  }

  return li;
};