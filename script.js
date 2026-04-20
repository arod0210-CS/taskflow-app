// ===== DOM =====
const addTaskBtn = document.getElementById("addTaskBtn");
const resetBtn = document.getElementById("resetBtn");
const taskInput = document.getElementById("taskInput");

const todoList = document.getElementById("todoList");
const completedList = document.getElementById("completedList");

const tasksLeft = document.getElementById("tasksLeft");
const tasksCompleted = document.getElementById("tasksCompleted");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const todayDate = document.getElementById("todayDate");

// ===== DATE =====
function setTodayDate() {
  const now = new Date();
  todayDate.textContent = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// ===== STORAGE =====
function saveTasks() {
  const tasks = [];

  todoList.querySelectorAll(".task-item").forEach((item) => {
    const taskText = item.querySelector(".task-text").textContent;
    tasks.push({
      text: taskText,
      completed: false
    });
  });

  completedList.querySelectorAll(".task-item").forEach((item) => {
    const taskText = item.querySelector(".task-text").textContent;
    tasks.push({
      text: taskText,
      completed: true
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  savedTasks.forEach((task) => {
    createTask(task.text, task.completed);
  });

  updateStats();
}

// ===== EMPTY STATES =====
function renderEmptyState() {
  const oldTodoEmpty = todoList.querySelector(".empty-state");
  const oldCompletedEmpty = completedList.querySelector(".empty-state");

  if (oldTodoEmpty) oldTodoEmpty.remove();
  if (oldCompletedEmpty) oldCompletedEmpty.remove();

  const todoHasItems = todoList.querySelectorAll(".task-item").length > 0;
  const completedHasItems = completedList.querySelectorAll(".task-item").length > 0;

  if (!todoHasItems) {
    const emptyTodo = document.createElement("p");
    emptyTodo.classList.add("empty-state");
    emptyTodo.textContent = "No tasks yet. Add one above.";
    todoList.appendChild(emptyTodo);
  }

  if (!completedHasItems) {
    const emptyCompleted = document.createElement("p");
    emptyCompleted.classList.add("empty-state");
    emptyCompleted.textContent = "Completed tasks will show here.";
    completedList.appendChild(emptyCompleted);
  }
}

// ===== STATS =====
function updateStats() {
  const todoCount = todoList.querySelectorAll(".task-item").length;
  const completedCount = completedList.querySelectorAll(".task-item").length;
  const total = todoCount + completedCount;

  tasksLeft.textContent = todoCount;
  tasksCompleted.textContent = completedCount;

  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  progressFill.style.width = percent + "%";
  progressPercent.textContent = percent + "%";

  renderEmptyState();
}

// ===== TASK ADD =====
function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Please enter a task.");
    return;
  }

  createTask(taskText, false);
  saveTasks();
  updateStats();

  taskInput.value = "";
  taskInput.focus();
}

// ===== RESET =====
function resetTasks() {
  const confirmReset = confirm("Clear all tasks?");

  if (!confirmReset) return;

  todoList.style.opacity = "0";
  completedList.style.opacity = "0";

  setTimeout(() => {
    localStorage.removeItem("tasks");
    todoList.innerHTML = "";
    completedList.innerHTML = "";
    updateStats();
    todoList.style.opacity = "1";
    completedList.style.opacity = "1";
  }, 200);
}

// ===== EVENTS =====
addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

resetBtn.addEventListener("click", resetTasks);

// ===== START =====
setTodayDate();
loadTasks();