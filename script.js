const taskInput       = document.getElementById("taskInput");
const dueDateInput    = document.getElementById("dueDateInput");
const priorityInput   = document.getElementById("priorityInput");
const addTaskBtn      = document.getElementById("addTaskBtn");
const resetBtn        = document.getElementById("resetBtn");
const todoList        = document.getElementById("todoList");
const completedList   = document.getElementById("completedList");
const tasksLeft       = document.getElementById("tasksLeft");
const tasksCompleted  = document.getElementById("tasksCompleted");
const progressPercent = document.getElementById("progressPercent");
const progressFill    = document.getElementById("progressFill");
const todayDate       = document.getElementById("todayDate");
const todoHeading     = document.getElementById("todoHeading");
const completedHeading = document.getElementById("completedHeading");
const viewButtons     = document.querySelectorAll(".view-btn");
 
// Modal elements
const editModal        = document.getElementById("editModal");
const editTextInput    = document.getElementById("editTextInput");
const editDateInput    = document.getElementById("editDateInput");
const editPriorityInput = document.getElementById("editPriorityInput");
const editSaveBtn      = document.getElementById("editSaveBtn");
const editCancelBtn    = document.getElementById("editCancelBtn");
 
const STORAGE_KEY = "taskflow-tasks-v3";
let currentView = "all";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingTaskId = null;
 
// ── Date helpers ──────────────────────────────────────────────────────────────
 
function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
 
function setDateInputMin() {
  const today = getTodayString();
  dueDateInput.min = today;
  if (editDateInput) editDateInput.min = today;
}
 
function formatTodayDate() {
  todayDate.textContent = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
 
function parseDateOnly(dateString) {
  return new Date(`${dateString}T00:00:00`);
}
 
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
 
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
 
// ── Storage ───────────────────────────────────────────────────────────────────
 
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
 
// ── Task factory ──────────────────────────────────────────────────────────────
 
function createTask(text, dueDate, priority) {
  return {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    dueDate: dueDate || null,
    priority: priority || "medium",
    createdAt: new Date().toISOString()
  };
}
 
// ── View filtering ────────────────────────────────────────────────────────────
 
function taskMatchesView(task) {
  if (currentView === "all") return true;
  if (!task.dueDate) return false;
 
  const due   = parseDateOnly(task.dueDate);
  const today = startOfToday();
 
  if (currentView === "today") return sameDay(due, today);
 
  if (currentView === "week") {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return due >= today && due <= weekEnd;
  }
 
  if (currentView === "month") {
    return (
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth()
    );
  }
 
  return true;
}
 
// ── Sorting ───────────────────────────────────────────────────────────────────
 
function priorityRank(priority) {
  if (priority === "high")   return 0;
  if (priority === "medium") return 1;
  return 2;
}
 
function sortTasks(taskList) {
  return [...taskList].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      const diff = parseDateOnly(a.dueDate).getTime() - parseDateOnly(b.dueDate).getTime();
      if (diff !== 0) return diff;
    } else if (a.dueDate)  return -1;
    else if (b.dueDate)    return  1;
 
    const pc = priorityRank(a.priority) - priorityRank(b.priority);
    if (pc !== 0) return pc;
 
    return b.id - a.id;
  });
}
 
// ── Add / delete / toggle ─────────────────────────────────────────────────────
 
function addTask() {
  const text     = taskInput.value.trim();
  const dueDate  = dueDateInput.value;
  const priority = priorityInput.value;
 
  if (text === "") {
    taskInput.classList.add("input-error");
    taskInput.focus();
    taskInput.addEventListener("input", () => taskInput.classList.remove("input-error"), { once: true });
    return;
  }
 
  tasks.unshift(createTask(text, dueDate, priority));
  saveTasks();
  renderTasks();
 
  taskInput.value      = "";
  dueDateInput.value   = "";
  priorityInput.value  = "medium";
  taskInput.focus();
}
 
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}
 
function toggleTask(id) {
  tasks = tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  renderTasks();
}
 
// ── Inline edit modal ─────────────────────────────────────────────────────────
 
function openEditModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
 
  editingTaskId            = id;
  editTextInput.value      = task.text;
  editDateInput.value      = task.dueDate || "";
  editPriorityInput.value  = task.priority || "medium";
 
  editModal.classList.remove("hidden");
  editTextInput.focus();
}
 
function closeEditModal() {
  editModal.classList.add("hidden");
  editingTaskId = null;
}
 
function saveEdit() {
  if (editingTaskId === null) return;
 
  const newText = editTextInput.value.trim();
  if (newText === "") {
    editTextInput.classList.add("input-error");
    editTextInput.focus();
    editTextInput.addEventListener("input", () => editTextInput.classList.remove("input-error"), { once: true });
    return;
  }
 
  tasks = tasks.map((t) => {
    if (t.id !== editingTaskId) return t;
    return {
      ...t,
      text:     newText,
      dueDate:  editDateInput.value || null,
      priority: editPriorityInput.value
    };
  });
 
  saveTasks();
  renderTasks();
  closeEditModal();
}
 
editSaveBtn.addEventListener("click", saveEdit);
editCancelBtn.addEventListener("click", closeEditModal);
 
// Close modal on backdrop click
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});
 
// Close modal on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !editModal.classList.contains("hidden")) {
    closeEditModal();
  }
});
 
// ── Stats & headings ──────────────────────────────────────────────────────────
 
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const left      = total - completed;
  const percent   = total === 0 ? 0 : Math.round((completed / total) * 100);
 
  tasksLeft.textContent        = left;
  tasksCompleted.textContent   = completed;
  progressPercent.textContent  = `${percent}%`;
  progressFill.style.width     = `${percent}%`;
}
 
function updateHeadings(todoCount, doneCount) {
  const labels = { all: "All Tasks", today: "Today", week: "This Week", month: "This Month" };
  const label  = labels[currentView] || "Tasks";
  todoHeading.textContent      = `${label} To Do (${todoCount})`;
  completedHeading.textContent = `${label} Completed (${doneCount})`;
}
 
// ── View switching ────────────────────────────────────────────────────────────
 
function setActiveView(view) {
  currentView = view;
  viewButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === view));
  renderTasks();
}
 
// ── Render ────────────────────────────────────────────────────────────────────
 
function renderTasks() {
  todoList.innerHTML      = "";
  completedList.innerHTML = "";
 
  const filtered   = tasks.filter(taskMatchesView);
  const todoTasks  = sortTasks(filtered.filter((t) => !t.completed));
  const doneTasks  = sortTasks(filtered.filter((t) =>  t.completed));
 
  todoTasks.forEach((task) => {
    todoList.appendChild(
      window.createTaskElement(task, { onToggle: toggleTask, onDelete: deleteTask, onEdit: openEditModal })
    );
  });
 
  doneTasks.forEach((task) => {
    completedList.appendChild(
      window.createTaskElement(task, { onToggle: toggleTask, onDelete: deleteTask, onEdit: openEditModal })
    );
  });
 
  function emptyState(msg) {
    const li = document.createElement("li");
    li.className   = "empty-state";
    li.textContent = msg;
    return li;
  }
 
  if (todoTasks.length === 0) todoList.appendChild(emptyState("No tasks in this view."));
  if (doneTasks.length === 0) completedList.appendChild(emptyState("No completed tasks in this view."));
 
  updateHeadings(todoTasks.length, doneTasks.length);
  updateStats();
}
 
// ── Reset ─────────────────────────────────────────────────────────────────────
 
function resetAllTasks() {
  if (!confirm("Are you sure you want to remove all tasks?")) return;
  tasks = [];
  saveTasks();
  renderTasks();
}
 
// ── Keyboard shortcuts ────────────────────────────────────────────────────────
 
function handleEnterToAdd(e) {
  if (e.key === "Enter") addTask();
}
 
// ── Wire up ───────────────────────────────────────────────────────────────────
 
addTaskBtn.addEventListener("click", addTask);
resetBtn.addEventListener("click", resetAllTasks);
taskInput.addEventListener("keydown", handleEnterToAdd);
dueDateInput.addEventListener("keydown", handleEnterToAdd);
 
viewButtons.forEach((btn) => btn.addEventListener("click", () => setActiveView(btn.dataset.view)));
 
// ── Init ──────────────────────────────────────────────────────────────────────
 
setDateInputMin();
formatTodayDate();
renderTasks();
 
// Expose renderTasks for settings.js
window.renderTasks = renderTasks;