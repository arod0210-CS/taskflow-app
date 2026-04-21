document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "taskflow-tasks-v3";
  const PLAYER_KEY = "taskflow-player-v1";
  const THEME_CLASSES = ["theme-blue", "theme-green", "theme-purple", "theme-fritolay"];

  const taskInput = document.getElementById("taskInput");
  const dueDateInput = document.getElementById("dueDateInput");
  const priorityInput = document.getElementById("priorityInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const resetBtn = document.getElementById("resetBtn");
  const searchInput = document.getElementById("searchInput");

  const todoList = document.getElementById("todoList");
  const completedList = document.getElementById("completedList");
  const tasksLeft = document.getElementById("tasksLeft");
  const tasksCompleted = document.getElementById("tasksCompleted");
  const progressPercent = document.getElementById("progressPercent");
  const progressFill = document.getElementById("progressFill");
  const todoHeading = document.getElementById("todoHeading");
  const completedHeading = document.getElementById("completedHeading");

  const todayDate = document.getElementById("todayDate");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const themeSelect = document.getElementById("themeSelect");
  const exportBtn = document.getElementById("exportBtn");
  const importFile = document.getElementById("importFile");
  const editModeToggle = document.getElementById("editModeToggle");

  const editModal = document.getElementById("editModal");
  const editTextInput = document.getElementById("editTextInput");
  const editDateInput = document.getElementById("editDateInput");
  const editPriorityInput = document.getElementById("editPriorityInput");
  const editSaveBtn = document.getElementById("editSaveBtn");
  const editCancelBtn = document.getElementById("editCancelBtn");

  const playerLevel = document.getElementById("playerLevel");
  const rankTitle = document.getElementById("rankTitle");
  const xpProgressText = document.getElementById("xpProgressText");
  const xpFill = document.getElementById("xpFill");
  const playerCoins = document.getElementById("playerCoins");
  const playerStreak = document.getElementById("playerStreak");
  const doneToday = document.getElementById("doneToday");
  const challengeList = document.getElementById("challengeList");
  const challengeCount = document.getElementById("challengeCount");

  const viewButtons = document.querySelectorAll(".view-btn");
  const quoteContent = document.querySelector(".quote-content");
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");

  const priorityMeta = {
    high: { label: "🔥 High", css: "high", xp: 35, coins: 7 },
    medium: { label: "👷 Medium", css: "medium", xp: 20, coins: 4 },
    low: { label: "🌱 Low", css: "low", xp: 10, coins: 2 }
  };

  const defaultPlayer = () => ({
    xp: 0,
    level: 1,
    coins: 0,
    streak: 0,
    lastCompletedDate: null,
    completedToday: 0,
    completedWeek: 0,
    totalCompleted: 0,
    challengeRewarded: [],
    badges: []
  });

  const State = {
    tasks: sanitizeTasks(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []),
    player: sanitizePlayer(JSON.parse(localStorage.getItem(PLAYER_KEY)) || defaultPlayer()),
    view: "all",
    searchQuery: "",
    editMode: JSON.parse(localStorage.getItem("editMode")) || false,
    editingTaskId: null,
    listeners: [],
    subscribe(listener) {
      this.listeners.push(listener);
    },
    notify() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
      localStorage.setItem(PLAYER_KEY, JSON.stringify(this.player));
      this.listeners.forEach((listener) => listener(this));
    },
    addTask(task) {
      this.tasks.unshift(task);
      this.notify();
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.notify();
    },
    toggleTask(id) {
      const task = this.tasks.find((item) => item.id === id);
      if (!task) return;

      if (!task.completed) {
        task.completed = true;
        task.completedAt = new Date().toISOString();
        rewardForCompletion(task);
      } else {
        task.completed = false;
        task.completedAt = null;
      }

      this.notify();
    },
    updateTask(id, updates) {
      this.tasks = this.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              priority: normalizePriority(updates.priority ?? task.priority)
            }
          : task
      );
      this.notify();
    },
    reorderTasks(draggedId, targetId) {
      const draggedIndex = this.tasks.findIndex((task) => task.id === draggedId);
      const targetIndex = this.tasks.findIndex((task) => task.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        return;
      }

      const [draggedItem] = this.tasks.splice(draggedIndex, 1);
      this.tasks.splice(targetIndex, 0, draggedItem);
      this.notify();
    },
    setTasks(newTasks) {
      this.tasks = sanitizeTasks(newTasks);
      this.notify();
    },
    setView(view) {
      this.view = view;
      this.notify();
    },
    setSearch(query) {
      this.searchQuery = query.trim().toLowerCase();
      this.notify();
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      localStorage.setItem("editMode", JSON.stringify(this.editMode));
      updateEditModeUI();
      this.notify();
    },
    resetAllData() {
      this.tasks = [];
      this.player = defaultPlayer();
      this.notify();
    }
  };

  window.getEditMode = () => State.editMode;

  function normalizePriority(priority) {
    return ["high", "medium", "low"].includes(priority) ? priority : "medium";
  }

  function sanitizeTasks(rawTasks) {
    if (!Array.isArray(rawTasks)) return [];
    return rawTasks
      .map((task, index) => ({
        id: String(task.id ?? `${Date.now()}-${index}`),
        text: String(task.text ?? "").trim(),
        completed: Boolean(task.completed),
        completedAt: task.completedAt || null,
        dueDate: task.dueDate || null,
        priority: normalizePriority(task.priority),
        createdAt: task.createdAt || new Date().toISOString()
      }))
      .filter((task) => task.text !== "");
  }

  function sanitizePlayer(player) {
    return {
      ...defaultPlayer(),
      ...player
    };
  }

  function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function parseDateOnly(dateString) {
    return new Date(`${dateString}T00:00:00`);
  }

  function isInCurrentWeek(dateString) {
    const today = startOfToday();
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const due = parseDateOnly(dateString);
    return due >= today && due <= weekEnd;
  }

  function isInCurrentMonth(dateString) {
    const today = startOfToday();
    const due = parseDateOnly(dateString);
    return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();
  }

  function setDateConstraints() {
    const today = getTodayString();
    dueDateInput.min = today;
    editDateInput.min = today;
  }

  function formatHeaderDate() {
    const dateOptions = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    todayDate.textContent = new Date().toLocaleDateString("en-US", dateOptions);
  }

  function updateEditModeUI() {
    editModeToggle.textContent = State.editMode ? "Edit Mode: ON" : "Edit Mode: OFF";
    editModeToggle.classList.toggle("edit-mode-active", State.editMode);
  }

  function applyTheme(theme) {
    document.body.classList.remove(...THEME_CLASSES);
    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }

    const isDark = JSON.parse(localStorage.getItem("darkMode")) || false;
    document.body.classList.toggle("dark-mode", isDark);
    darkModeToggle.checked = isDark;
  }

  function createEmptyState(message) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = message;
    return li;
  }

  function getRankTitle(level) {
    if (level >= 10) return "Task Legend";
    if (level >= 8) return "Elite Planner";
    if (level >= 6) return "Task Master";
    if (level >= 4) return "Productivity Pro";
    if (level >= 3) return "Consistent Worker";
    if (level >= 2) return "Task Rookie";
    return "Starter";
  }

  function xpNeededForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.2));
  }

  function addXpAndCoins(xp, coins) {
    State.player.xp += xp;
    State.player.coins += coins;

    while (State.player.xp >= xpNeededForLevel(State.player.level)) {
      State.player.xp -= xpNeededForLevel(State.player.level);
      State.player.level += 1;
      State.player.coins += 15;
    }
  }

  function updateStreak() {
    const today = getTodayString();
    const lastDate = State.player.lastCompletedDate;

    if (!lastDate) {
      State.player.streak = 1;
      State.player.lastCompletedDate = today;
      return;
    }

    if (lastDate === today) return;

    const last = parseDateOnly(lastDate);
    const current = parseDateOnly(today);
    const diffDays = Math.floor((current - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      State.player.streak += 1;
    } else {
      State.player.streak = 1;
    }

    State.player.lastCompletedDate = today;
  }

  function getDailyChallenges() {
    const completedToday = State.tasks.filter(
      (task) => task.completed && task.completedAt && task.completedAt.startsWith(getTodayString())
    ).length;

    const highToday = State.tasks.filter(
      (task) =>
        task.completed &&
        task.priority === "high" &&
        task.completedAt &&
        task.completedAt.startsWith(getTodayString())
    ).length;

    const mediumToday = State.tasks.filter(
      (task) =>
        task.completed &&
        task.priority === "medium" &&
        task.completedAt &&
        task.completedAt.startsWith(getTodayString())
    ).length;

    return [
      {
        id: "daily-3",
        title: "Complete 3 tasks today",
        progress: completedToday,
        goal: 3,
        rewardXp: 40,
        rewardCoins: 20
      },
      {
        id: "daily-high",
        title: "Complete 1 high-priority task",
        progress: highToday,
        goal: 1,
        rewardXp: 30,
        rewardCoins: 15
      },
      {
        id: "daily-medium-2",
        title: "Complete 2 medium tasks",
        progress: mediumToday,
        goal: 2,
        rewardXp: 25,
        rewardCoins: 12
      }
    ];
  }

  function checkChallengeRewards() {
    const challenges = getDailyChallenges();

    challenges.forEach((challenge) => {
      const alreadyRewarded = State.player.challengeRewarded.includes(challenge.id);
      const complete = challenge.progress >= challenge.goal;

      if (complete && !alreadyRewarded) {
        addXpAndCoins(challenge.rewardXp, challenge.rewardCoins);
        State.player.challengeRewarded.push(challenge.id);
      }
    });

    const today = getTodayString();
    const rewardDate = State.player.challengeRewardedDate || null;
    if (rewardDate !== today) {
      State.player.challengeRewarded = [];
      State.player.challengeRewardedDate = today;
    }
  }

  function rewardForCompletion(task) {
    const priority = priorityMeta[normalizePriority(task.priority)];
    let xp = priority.xp;
    let coins = priority.coins;

    if (task.dueDate) {
      const today = getTodayString();
      if (today <= task.dueDate) {
        xp += 10;
      }
    }

    State.player.totalCompleted += 1;
    State.player.completedToday += 1;
    State.player.completedWeek += 1;

    if (State.player.completedToday === 3) {
      xp += 15;
      coins += 5;
    }

    if (State.player.completedToday === 5) {
      xp += 30;
      coins += 10;
    }

    updateStreak();
    addXpAndCoins(xp, coins);
    checkChallengeRewards();
  }

  function normalizeDailyPlayerStats() {
    const today = getTodayString();
    const completedToday = State.tasks.filter(
      (task) => task.completed && task.completedAt && task.completedAt.startsWith(today)
    ).length;

    State.player.completedToday = completedToday;

    const rewardDate = State.player.challengeRewardedDate || null;
    if (rewardDate !== today) {
      State.player.challengeRewarded = [];
      State.player.challengeRewardedDate = today;
    }
  }

  function renderGamification() {
    normalizeDailyPlayerStats();
    checkChallengeRewards();

    playerLevel.textContent = State.player.level;
    rankTitle.textContent = getRankTitle(State.player.level);
    playerCoins.textContent = State.player.coins;
    playerStreak.textContent = `${State.player.streak} day${State.player.streak === 1 ? "" : "s"}`;
    doneToday.textContent = State.player.completedToday;

    const needed = xpNeededForLevel(State.player.level);
    xpProgressText.textContent = `${State.player.xp} / ${needed} XP`;
    xpFill.style.width = `${Math.min((State.player.xp / needed) * 100, 100)}%`;

    const challenges = getDailyChallenges();
    const completedChallengeCount = challenges.filter((challenge) => challenge.progress >= challenge.goal).length;
    challengeCount.textContent = `${completedChallengeCount}/${challenges.length}`;

    challengeList.innerHTML = "";

    challenges.forEach((challenge) => {
      const item = document.createElement("div");
      item.className = "challenge-item";

      const top = document.createElement("div");
      top.className = "challenge-item-top";

      const title = document.createElement("span");
      title.className = "challenge-title";
      title.textContent = challenge.title;

      const progress = document.createElement("span");
      progress.className = "challenge-progress";
      progress.textContent = `${Math.min(challenge.progress, challenge.goal)}/${challenge.goal}`;

      top.appendChild(title);
      top.appendChild(progress);

      const meta = document.createElement("div");
      meta.className = "challenge-meta";
      meta.textContent = `Reward: +${challenge.rewardXp} XP • +${challenge.rewardCoins} coins`;

      const bar = document.createElement("div");
      bar.className = "challenge-progress-bar";

      const fill = document.createElement("div");
      fill.className = "challenge-progress-fill";
      fill.style.width = `${Math.min((challenge.progress / challenge.goal) * 100, 100)}%`;

      if (challenge.progress >= challenge.goal) {
        item.classList.add("challenge-complete");
      }

      bar.appendChild(fill);
      item.appendChild(top);
      item.appendChild(meta);
      item.appendChild(bar);
      challengeList.appendChild(item);
    });
  }

  function openEditModal(taskId) {
    const task = State.tasks.find((item) => item.id === taskId);
    if (!task) return;

    State.editingTaskId = taskId;
    editTextInput.value = task.text;
    editDateInput.value = task.dueDate || "";
    editPriorityInput.value = normalizePriority(task.priority);

    editModal.classList.remove("hidden");
    editTextInput.focus();
  }

  function closeEditModal() {
    State.editingTaskId = null;
    editModal.classList.add("hidden");
  }

  function saveEdit() {
    if (!State.editingTaskId) return;

    const newText = editTextInput.value.trim();
    if (!newText) {
      editTextInput.classList.add("input-error");
      editTextInput.focus();
      editTextInput.addEventListener("input", () => editTextInput.classList.remove("input-error"), { once: true });
      return;
    }

    State.updateTask(State.editingTaskId, {
      text: newText,
      dueDate: editDateInput.value || null,
      priority: editPriorityInput.value
    });

    closeEditModal();
  }

  function buildTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-card";
    li.draggable = true;
    li.dataset.id = task.id;

    if (task.dueDate && !task.completed) {
      const today = getTodayString();
      if (task.dueDate < today) li.classList.add("overdue");
      if (task.dueDate === today) li.classList.add("due-today");
    }

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "task-main";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-btn";
    toggleBtn.type = "button";
    toggleBtn.setAttribute("aria-label", task.completed ? "Mark as incomplete" : "Mark as complete");
    if (task.completed) toggleBtn.classList.add("completed");
    toggleBtn.addEventListener("click", () => State.toggleTask(task.id));

    const content = document.createElement("div");
    content.className = "task-content";

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    if (task.completed) textSpan.classList.add("completed");
    textSpan.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    if (task.dueDate) {
      const dateSpan = document.createElement("span");
      dateSpan.className = "due-date";
      dateSpan.textContent = `Due: ${task.dueDate}`;
      meta.appendChild(dateSpan);
    }

    const priorityInfo = priorityMeta[normalizePriority(task.priority)];
    const prioritySpan = document.createElement("span");
    prioritySpan.className = `priority-badge priority-${priorityInfo.css}`;
    prioritySpan.textContent = priorityInfo.label;
    meta.appendChild(prioritySpan);

    content.appendChild(textSpan);
    content.appendChild(meta);

    mainWrapper.appendChild(toggleBtn);
    mainWrapper.appendChild(content);
    li.appendChild(mainWrapper);

    if (State.editMode) {
      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "task-action-btn edit-btn";
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openEditModal(task.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "task-action-btn delete-btn";
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => State.deleteTask(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(actions);
    }

    return li;
  }

  function filterTasks(state) {
    return state.tasks.filter((task) => {
      if (state.searchQuery && !task.text.toLowerCase().includes(state.searchQuery)) {
        return false;
      }

      if (state.view === "today") {
        return task.dueDate === getTodayString();
      }

      if (state.view === "week") {
        return task.dueDate ? isInCurrentWeek(task.dueDate) : false;
      }

      if (state.view === "month") {
        return task.dueDate ? isInCurrentMonth(task.dueDate) : false;
      }

      return true;
    });
  }

  function sortTasks(taskList) {
    return [...taskList].sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        const diff = parseDateOnly(a.dueDate).getTime() - parseDateOnly(b.dueDate).getTime();
        if (diff !== 0) return diff;
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }

      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[normalizePriority(a.priority)] - priorityOrder[normalizePriority(b.priority)];
      if (priorityDiff !== 0) return priorityDiff;

      return Number(b.id) - Number(a.id);
    });
  }

  function render(state) {
    todoList.innerHTML = "";
    completedList.innerHTML = "";

    const filteredTasks = filterTasks(state);
    const todoTasks = sortTasks(filteredTasks.filter((task) => !task.completed));
    const doneTasks = sortTasks(filteredTasks.filter((task) => task.completed));

    todoTasks.forEach((task) => todoList.appendChild(buildTaskElement(task)));
    doneTasks.forEach((task) => completedList.appendChild(buildTaskElement(task)));

    if (todoTasks.length === 0) {
      todoList.appendChild(createEmptyState("No tasks in this view."));
    }

    if (doneTasks.length === 0) {
      completedList.appendChild(createEmptyState("No completed tasks in this view."));
    }

    const labels = { all: "All", today: "Today", week: "This Week", month: "This Month" };
    const label = labels[state.view] || "All";

    todoHeading.textContent = `${label} To Do`;
    completedHeading.textContent = `${label} Completed`;

    const total = filteredTasks.length;
    const doneCount = doneTasks.length;
    const leftCount = todoTasks.length;
    const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    tasksLeft.textContent = leftCount;
    tasksCompleted.textContent = doneCount;
    progressPercent.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;

    renderGamification();
  }

  let searchTimeout;
  let draggedElementId = null;

  settingsBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    settingsPanel.classList.toggle("hidden");
  });

  document.addEventListener("click", (event) => {
    if (
      !settingsPanel.classList.contains("hidden") &&
      !settingsPanel.contains(event.target) &&
      !settingsBtn.contains(event.target)
    ) {
      settingsPanel.classList.add("hidden");
    }
  });

  themeSelect.addEventListener("change", () => {
    localStorage.setItem("theme", themeSelect.value);
    applyTheme(themeSelect.value);
  });

  darkModeToggle.addEventListener("change", () => {
    localStorage.setItem("darkMode", JSON.stringify(darkModeToggle.checked));
    applyTheme(themeSelect.value);
  });

  addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (!text) {
      taskInput.classList.add("input-error");
      taskInput.focus();
      taskInput.addEventListener("input", () => taskInput.classList.remove("input-error"), { once: true });
      return;
    }

    State.addTask({
      id: String(Date.now()),
      text,
      completed: false,
      completedAt: null,
      dueDate: dueDateInput.value || null,
      priority: priorityInput.value || "medium",
      createdAt: new Date().toISOString()
    });

    taskInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "medium";
    taskInput.focus();
  });

  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addTaskBtn.click();
    }
  });

  dueDateInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addTaskBtn.click();
    }
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Clear all tasks and reset game progress?")) {
      State.resetAllData();
    }
  });

  searchInput.addEventListener("input", (event) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => State.setSearch(event.target.value), 250);
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      viewButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      State.setView(button.dataset.view);
    });
  });

  document.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".task-card");
    if (!card) return;

    draggedElementId = card.dataset.id;
    card.classList.add("dragging");
  });

  document.addEventListener("dragend", (event) => {
    const card = event.target.closest(".task-card");
    if (!card) return;

    card.classList.remove("dragging");
    document.querySelectorAll(".drag-over").forEach((element) => element.classList.remove("drag-over"));
    draggedElementId = null;
  });

  document.addEventListener("dragover", (event) => {
    event.preventDefault();
    const targetCard = event.target.closest(".task-card");
    if (!targetCard || targetCard.dataset.id === draggedElementId) return;

    document.querySelectorAll(".drag-over").forEach((element) => element.classList.remove("drag-over"));
    targetCard.classList.add("drag-over");
  });

  document.addEventListener("drop", (event) => {
    event.preventDefault();
    const targetCard = event.target.closest(".task-card");
    if (!targetCard || !draggedElementId) return;

    State.reorderTasks(draggedElementId, targetCard.dataset.id);
  });

  exportBtn.addEventListener("click", () => {
    const exportData = {
      tasks: State.tasks,
      player: State.player
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "taskflow_data.json");
    downloadAnchor.click();
  });

  importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const imported = JSON.parse(loadEvent.target.result);

        if (Array.isArray(imported)) {
          State.tasks = sanitizeTasks(imported);
        } else {
          State.tasks = sanitizeTasks(imported.tasks || []);
          State.player = sanitizePlayer(imported.player || defaultPlayer());
        }

        State.notify();
        alert("Import successful!");
      } catch (error) {
        alert("Invalid file.");
      }

      importFile.value = "";
    };
    reader.readAsText(file);
  });

  editModeToggle.addEventListener("click", () => State.toggleEditMode());

  editSaveBtn.addEventListener("click", saveEdit);
  editCancelBtn.addEventListener("click", closeEditModal);

  editModal.addEventListener("click", (event) => {
    if (event.target === editModal) {
      closeEditModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !editModal.classList.contains("hidden")) {
      closeEditModal();
    }
  });

  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Small daily improvements are the key to long-term results.", author: "Unknown" }
  ];

  function updateQuote() {
    quoteContent.classList.add("quote-fade-out");
    setTimeout(() => {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      quoteText.textContent = `"${quote.text}"`;
      quoteAuthor.textContent = `- ${quote.author}`;
      quoteContent.classList.remove("quote-fade-out");
    }, 400);
  }

  themeSelect.value = localStorage.getItem("theme") || "default";
  applyTheme(themeSelect.value);
  updateEditModeUI();
  setDateConstraints();
  formatHeaderDate();

  State.subscribe(render);
  updateQuote();
  setInterval(updateQuote, 15000);
  State.notify();
});