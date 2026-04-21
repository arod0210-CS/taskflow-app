document.addEventListener("DOMContentLoaded", () => {
  
  // --- 1. STATE MANAGEMENT (Pub/Sub Pattern) ---
  const State = {
    tasks: JSON.parse(localStorage.getItem("taskflow-tasks-v3")) || [],
    view: "all",
    searchQuery: "",
    editMode: JSON.parse(localStorage.getItem("editMode")) || false,
    
    listeners: [],
    subscribe(listener) { this.listeners.push(listener); },
    notify() {
      localStorage.setItem("taskflow-tasks-v3", JSON.stringify(this.tasks));
      this.listeners.forEach(listener => listener(this));
    },
    
    // Core Actions
    addTask(task) { this.tasks.unshift(task); this.notify(); },
    deleteTask(id) { this.tasks = this.tasks.filter(t => t.id !== id); this.notify(); },
    toggleTask(id) { 
      const task = this.tasks.find(t => t.id === id);
      if (task) task.completed = !task.completed;
      this.notify();
    },
    reorderTasks(draggedId, targetId) {
      const draggedIndex = this.tasks.findIndex(t => t.id === draggedId);
      const targetIndex = this.tasks.findIndex(t => t.id === targetId);
      if (draggedIndex > -1 && targetIndex > -1) {
        const [draggedItem] = this.tasks.splice(draggedIndex, 1);
        this.tasks.splice(targetIndex, 0, draggedItem);
        this.notify();
      }
    },
    setTasks(newTasks) { this.tasks = newTasks; this.notify(); },
    setView(view) { this.view = view; this.notify(); },
    setSearch(query) { this.searchQuery = query.toLowerCase(); this.notify(); },
    toggleEditMode() { 
      this.editMode = !this.editMode; 
      localStorage.setItem("editMode", JSON.stringify(this.editMode));
      this.updateEditModeUI();
      this.notify(); 
    },
    updateEditModeUI() {
      const btn = document.getElementById("editModeToggle");
      if (btn) {
        btn.textContent = this.editMode ? "Edit Mode: ON" : "Edit Mode: OFF";
        btn.classList.toggle("edit-mode-active", this.editMode);
      }
    }
  };

  // --- 2. THEME & UI LOGIC ---
  const darkModeToggle = document.getElementById("darkModeToggle");
  const themeSelect = document.getElementById("themeSelect");

  function applyTheme(theme) {
    // 1. Remove any existing class starting with "theme-" to avoid clashing
    document.body.className = Array.from(document.body.classList)
      .filter(c => !c.startsWith("theme-"))
      .join(" ");

    // 2. Add the selected theme class
    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }

    // 3. Apply Dark Mode override if active
    const isDark = JSON.parse(localStorage.getItem("darkMode")) || false;
    document.body.classList.toggle("dark-mode", isDark);
    if (darkModeToggle) darkModeToggle.checked = isDark;
  }

  // Event Listeners for UI
  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      applyTheme(themeSelect.value);
      localStorage.setItem("theme", themeSelect.value);
    });
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      localStorage.setItem("darkMode", JSON.stringify(darkModeToggle.checked));
      applyTheme(themeSelect ? themeSelect.value : "default");
    });
  }

  // Date Display
  const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateBox = document.getElementById("todayDate");
  if (dateBox) dateBox.textContent = new Date().toLocaleDateString('en-US', dateOptions);

  // Settings Panel Toggle
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsPanel.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!settingsPanel.classList.contains("hidden") && !settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
        settingsPanel.classList.add("hidden");
      }
    });
  }

  // --- 3. TASK COMPONENT BUILDER ---
  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-card";
    li.draggable = true; 
    li.dataset.id = task.id; 

    if (task.dueDate && !task.completed) {
      const today = new Date().toISOString().split("T")[0];
      if (task.dueDate < today) li.classList.add("overdue");
      if (task.dueDate === today) li.classList.add("due-today");
    }

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "task-main";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-btn";
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

    const prioritySpan = document.createElement("span");
    prioritySpan.className = `priority-badge priority-${task.priority}`;
    prioritySpan.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    meta.appendChild(prioritySpan);

    content.appendChild(textSpan);
    content.appendChild(meta);
    mainWrapper.appendChild(toggleBtn);
    mainWrapper.appendChild(content);
    li.appendChild(mainWrapper);

    if (State.editMode) {
      const actions = document.createElement("div");
      actions.className = "task-actions";
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "task-action-btn delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => State.deleteTask(task.id));
      actions.appendChild(deleteBtn);
      li.appendChild(actions);
    }
    return li;
  }

  // --- 4. RENDER PIPELINE ---
  const todoList = document.getElementById("todoList");
  const completedList = document.getElementById("completedList");

  function render(state) {
    if (!todoList || !completedList) return;
    todoList.innerHTML = "";
    completedList.innerHTML = "";

    let filteredTasks = state.tasks.filter(task => {
      if (state.searchQuery && !task.text.toLowerCase().includes(state.searchQuery)) return false;
      if (state.view === "today" && task.dueDate !== new Date().toISOString().split("T")[0]) return false;
      return true; 
    });

    const todoTasks = filteredTasks.filter(t => !t.completed);
    const doneTasks = filteredTasks.filter(t => t.completed);

    const todoFragment = document.createDocumentFragment();
    const doneFragment = document.createDocumentFragment();

    todoTasks.forEach(task => todoFragment.appendChild(createTaskElement(task)));
    doneTasks.forEach(task => doneFragment.appendChild(createTaskElement(task)));

    todoList.appendChild(todoFragment);
    completedList.appendChild(doneFragment);

    // Update Stats & Progress
    const leftEl = document.getElementById("tasksLeft");
    const compEl = document.getElementById("tasksCompleted");
    const percEl = document.getElementById("progressPercent");
    const fillEl = document.getElementById("progressFill");

    if (leftEl) leftEl.textContent = todoTasks.length;
    if (compEl) compEl.textContent = doneTasks.length;
    
    const total = todoTasks.length + doneTasks.length;
    const percent = total === 0 ? 0 : Math.round((doneTasks.length / total) * 100);
    
    if (percEl) percEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;
  }
  State.subscribe(render);

  // --- 5. SEARCH & FILTERS ---
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => State.setSearch(e.target.value), 300);
    });
  }

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      State.setView(e.target.dataset.view);
    });
  });

  // --- 6. DRAG AND DROP ---
  let draggedElementId = null;
  document.addEventListener("dragstart", (e) => {
    if (e.target.classList && e.target.classList.contains("task-card")) {
      draggedElementId = e.target.dataset.id;
      e.target.classList.add("dragging");
    }
  });
  document.addEventListener("dragend", (e) => {
    if (e.target.classList && e.target.classList.contains("task-card")) {
      e.target.classList.remove("dragging");
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    }
  });
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    const targetCard = e.target.closest(".task-card");
    if (targetCard && targetCard.dataset.id !== draggedElementId) {
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      targetCard.classList.add("drag-over");
    }
  });
  document.addEventListener("drop", (e) => {
    e.preventDefault();
    const targetCard = e.target.closest(".task-card");
    if (targetCard && draggedElementId) {
      State.reorderTasks(draggedElementId, targetCard.dataset.id);
    }
  });

  // --- 7. DATA OPERATIONS ---
  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      const textInput = document.getElementById("taskInput");
      const dateInput = document.getElementById("dueDateInput");
      const priorityInput = document.getElementById("priorityInput");
      
      if (textInput && textInput.value.trim()) {
        State.addTask({
          id: Date.now().toString(),
          text: textInput.value.trim(),
          completed: false,
          dueDate: dateInput ? dateInput.value : null,
          priority: priorityInput ? priorityInput.value : "medium"
        });
        textInput.value = '';
        if (dateInput) dateInput.value = '';
      }
    });
  }

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if(confirm("Clear all tasks?")) State.setTasks([]);
    });
  }

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(State.tasks));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", "taskflow_data.json");
      dlAnchor.click();
    });
  }

  const importFile = document.getElementById("importFile");
  if (importFile) {
    importFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) { State.setTasks(imported); alert("Import successful!"); }
        } catch (err) { alert("Invalid file."); }
      };
      reader.readAsText(file);
    });
  }

  const editModeToggle = document.getElementById("editModeToggle");
  if (editModeToggle) {
    editModeToggle.addEventListener("click", () => State.toggleEditMode());
  }

  // --- 8. MOTIVATIONAL QUOTES ---
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Small daily improvements are the key to long-term results.", author: "Unknown" }
  ];

  const quoteContent = document.querySelector(".quote-content");
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");

  function updateQuote() {
    if (!quoteContent || !quoteText || !quoteAuthor) return;
    quoteContent.classList.add("quote-fade-out");
    setTimeout(() => {
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      quoteText.textContent = `"${q.text}"`;
      quoteAuthor.textContent = `- ${q.author}`;
      quoteContent.classList.remove("quote-fade-out");
    }, 500); 
  }

  updateQuote();
  setInterval(updateQuote, 15000);

  // --- INITIAL LOAD ---
  const savedTheme = localStorage.getItem("theme") || "default";
  if (themeSelect) themeSelect.value = savedTheme;
  applyTheme(savedTheme);
  State.updateEditModeUI();
  State.notify();
});