function addDragEvents(taskItem) {
  taskItem.setAttribute("draggable", true);

  taskItem.addEventListener("dragstart", function () {
    taskItem.classList.add("dragging");
  });

  taskItem.addEventListener("dragend", function () {
    taskItem.classList.remove("dragging");

    document.querySelectorAll(".drag-over").forEach((item) => {
      item.classList.remove("drag-over");
    });

    saveTasks();
    updateStats();
  });

  taskItem.addEventListener("dragover", function (event) {
    event.preventDefault();

    if (!taskItem.classList.contains("dragging")) {
      taskItem.classList.add("drag-over");
    }
  });

  taskItem.addEventListener("dragleave", function () {
    taskItem.classList.remove("drag-over");
  });

  taskItem.addEventListener("drop", function (event) {
    event.preventDefault();

    const draggingItem = document.querySelector(".dragging");
    if (!draggingItem || draggingItem === taskItem) return;

    taskItem.classList.remove("drag-over");

    const currentList = taskItem.parentElement;
    const allItems = [...currentList.querySelectorAll(".task-item")];
    const droppedIndex = allItems.indexOf(taskItem);
    const draggingIndex = allItems.indexOf(draggingItem);

    if (draggingItem.parentElement !== currentList) {
      currentList.appendChild(draggingItem);
    }

    if (draggingIndex < droppedIndex) {
      taskItem.after(draggingItem);
    } else {
      taskItem.before(draggingItem);
    }

    saveTasks();
    updateStats();
  });
}

function editTask(taskTextEl) {
  const currentText = taskTextEl.textContent;
  const newText = prompt("Edit task:", currentText);

  if (newText === null) return;

  const trimmedText = newText.trim();

  if (trimmedText === "") {
    alert("Task cannot be empty.");
    return;
  }

  taskTextEl.textContent = trimmedText;
  saveTasks();
}

function deleteTask(taskItem) {
  const taskText = taskItem.querySelector(".task-text").textContent;
  const confirmDelete = confirm(`Delete "${taskText}"?`);

  if (!confirmDelete) return;

  const taskCard = taskItem.querySelector(".task-card");
  taskCard.classList.add("fade-out");

  setTimeout(() => {
    taskItem.remove();
    saveTasks();
    updateStats();
  }, 200);
}

function toggleTask(taskItem, toggleBtn) {
  const currentlyCompleted = taskItem.classList.contains("completed-task");
  const taskCard = taskItem.querySelector(".task-card");

  taskCard.classList.add("fade-out");

  setTimeout(() => {
    taskCard.classList.remove("fade-out");

    if (currentlyCompleted) {
      taskItem.classList.remove("completed-task");
      toggleBtn.classList.remove("active");
      todoList.prepend(taskItem);
    } else {
      taskItem.classList.add("completed-task");
      toggleBtn.classList.add("active");
      completedList.prepend(taskItem);
    }

    taskCard.classList.add("fade-in");

    setTimeout(() => {
      taskCard.classList.remove("fade-in");
    }, 250);

    saveTasks();
    updateStats();
  }, 220);
}

function createTask(taskText, isCompleted = false) {
  const taskItem = document.createElement("li");
  taskItem.classList.add("task-item");

  if (isCompleted) {
    taskItem.classList.add("completed-task");
  }

  const taskCard = document.createElement("div");
  taskCard.classList.add("task-card");

  const taskMain = document.createElement("div");
  taskMain.classList.add("task-main");

  const taskAccent = document.createElement("div");
  taskAccent.classList.add("task-accent");

  const taskTextEl = document.createElement("span");
  taskTextEl.classList.add("task-text");
  taskTextEl.textContent = taskText;

  taskTextEl.addEventListener("dblclick", function () {
    editTask(taskTextEl);
  });

  const taskRight = document.createElement("div");
  taskRight.classList.add("task-right");

  const deleteBtn = document.createElement("button");
  deleteBtn.setAttribute("type", "button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.style.background = "transparent";
  deleteBtn.style.border = "none";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.fontSize = "18px";
  deleteBtn.style.padding = "0 4px";

  deleteBtn.addEventListener("click", function () {
    deleteTask(taskItem);
  });

  const toggleBtn = document.createElement("button");
  toggleBtn.classList.add("toggle-btn");
  toggleBtn.setAttribute("type", "button");
  toggleBtn.setAttribute("aria-label", "Toggle complete");

  if (isCompleted) {
    toggleBtn.classList.add("active");
  }

  toggleBtn.addEventListener("click", function () {
    toggleTask(taskItem, toggleBtn);
  });

  taskMain.appendChild(taskAccent);
  taskMain.appendChild(taskTextEl);

  taskRight.appendChild(deleteBtn);
  taskRight.appendChild(toggleBtn);

  taskCard.appendChild(taskMain);
  taskCard.appendChild(taskRight);

  taskItem.appendChild(taskCard);

  addDragEvents(taskItem);

  if (isCompleted) {
    completedList.appendChild(taskItem);
  } else {
    todoList.appendChild(taskItem);
  }
}