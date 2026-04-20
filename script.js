const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const resetBtn = document.getElementById("resetBtn");
const todoList = document.getElementById("todoList");
const completedList = document.getElementById("completedList");
const tasksLeft = document.getElementById("tasksLeft");
const tasksCompleted = document.getElementById("tasksCompleted");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const todayDate = document.getElementById("todayDate");

const STORAGE_KEY = "taskflow-tasks";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatTodayDate() {
  const today = new Date();
  todayDate.textContent = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function createTask(text) {
  return {
    id: Date.now(),
    text: text.trim(),
    completed: false
  };
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    return;
  }

  tasks.unshift(createTask(text));
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function editTask(id) {
  const editMode = JSON.parse(localStorage.getItem("editMode")) || false;

  if (!editMode) {
    alert("Turn on Edit Mode in Settings first.");
    return;
  }

  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return;
  }

  const updatedText = prompt("Edit your task:", task.text);

  if (updatedText === null) {
    return;
  }

  const trimmedText = updatedText.trim();

  if (trimmedText === "") {
    return;
  }

  task.text = trimmedText;
  saveTasks();
  renderTasks();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const left = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  tasksLeft.textContent = left;
  tasksCompleted.textContent = completed;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
}

function renderTasks() {
  todoList.innerHTML = "";
  completedList.innerHTML = "";

  const todoTasks = tasks.filter((task) => !task.completed);
  const doneTasks = tasks.filter((task) => task.completed);

  todoTasks.forEach((task) => {
    todoList.appendChild(window.createTaskElement(task, {
      onToggle: toggleTask,
      onDelete: deleteTask,
      onEdit: editTask
    }));
  });

  doneTasks.forEach((task) => {
    completedList.appendChild(window.createTaskElement(task, {
      onToggle: toggleTask,
      onDelete: deleteTask,
      onEdit: editTask
    }));
  });

  updateStats();
}

function resetAllTasks() {
  const confirmed = confirm("Are you sure you want to remove all tasks?");

  if (!confirmed) {
    return;
  }

  tasks = [];
  saveTasks();
  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

resetBtn.addEventListener("click", resetAllTasks);

formatTodayDate();
renderTasks();