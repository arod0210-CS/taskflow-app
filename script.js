document.addEventListener("DOMContentLoaded", () => {
  
  // --- 1. STATE MANAGEMENT (Pub/Sub) ---
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
      document.getElementById("editModeToggle").textContent = this.editMode ? "Edit Mode: ON" : "Edit Mode: OFF";
      document.getElementById("editModeToggle").classList.toggle("edit-mode-active", this.editMode);
      this.notify(); 
    }
  };

  // --- 2. COMPONENT BUILDER ---
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

  // --- 3. SETTINGS & UI LOGIC ---
  const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  document.getElementById("todayDate").textContent = new Date().toLocaleDateString('en-US', dateOptions);

  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  settingsBtn.addEventListener("click", (e) => { e.stopPropagation(); settingsPanel.classList.toggle("hidden"); });
  document.addEventListener("click", (e) => { if (!settingsPanel.classList.contains("hidden") && !settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) { settingsPanel.classList.add("hidden"); } });

  const darkModeToggle = document.getElementById("darkModeToggle");
  darkModeToggle.checked = JSON.parse(localStorage.getItem("darkMode")) || false;
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
    localStorage.setItem("darkMode", JSON.stringify(darkModeToggle.checked));
  });

  const themeSelect = document.getElementById("themeSelect");
  themeSelect.value = localStorage.getItem("theme") || "default";
  document.body.classList.add(themeSelect.value !== "default" ? `theme-${themeSelect.value}` : "default");
  themeSelect.addEventListener("change", () => {
    document.body.className = document.body.className.replace(/theme-\w+/g, "");
    if(themeSelect.value !== "default") document.body.classList.add(`theme-${themeSelect.value}`);
    if(darkModeToggle.checked) document.body.classList.add("dark-mode");
    localStorage.setItem("theme", themeSelect.value);
  });

  document.getElementById("editModeToggle").textContent = State.editMode ? "Edit Mode: ON" : "Edit Mode: OFF";
  document.getElementById("editModeToggle").classList.toggle("edit-mode-active", State.editMode);
  document.getElementById("editModeToggle").addEventListener("click", () => State.toggleEditMode());

  // --- 4. VIEW & RENDER PIPELINE ---
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      State.setView(e.target.dataset.view);
    });
  });

  let timeout;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => State.setSearch(e.target.value), 300);
  });

  const todoList = document.getElementById("todoList");
  const completedList = document.getElementById("completedList");

  function render(state) {
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

    document.getElementById("tasksLeft").textContent = todoTasks.length;
    document.getElementById("tasksCompleted").textContent = doneTasks.length;
    const total = todoTasks.length + doneTasks.length;
    const percent = total === 0 ? 0 : Math.round((doneTasks.length / total) * 100);
    document.getElementById("progressPercent").textContent = `${percent}%`;
    document.getElementById("progressFill").style.width = `${percent}%`;
  }
  State.subscribe(render);

  // --- 5. DRAG AND DROP LOGIC ---
  let draggedElementId = null;
  document.addEventListener("dragstart", (e) => { if (e.target.classList.contains("task-card")) { draggedElementId = e.target.dataset.id; e.target.classList.add("dragging"); }});
  document.addEventListener("dragend", (e) => { if (e.target.classList.contains("task-card")) { e.target.classList.remove("dragging"); document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over')); }});
  document.addEventListener("dragover", (e) => { e.preventDefault(); const targetCard = e.target.closest(".task-card"); if (targetCard && targetCard.dataset.id !== draggedElementId) { document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over')); targetCard.classList.add("drag-over"); }});
  document.addEventListener("drop", (e) => { e.preventDefault(); const targetCard = e.target.closest(".task-card"); if (targetCard && draggedElementId) { State.reorderTasks(draggedElementId, targetCard.dataset.id); }});

  // --- 6. IMPORT / EXPORT DATA ---
  document.getElementById("exportBtn").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(State.tasks));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "taskflow_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target.result);
        if (Array.isArray(importedTasks)) {
          State.setTasks(importedTasks);
          alert("Data imported successfully!");
        }
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  });

  // --- 7. ADD TASK ---
  document.getElementById("addTaskBtn").addEventListener("click", () => {
    const text = document.getElementById("taskInput").value.trim();
    if (text) {
      State.addTask({ id: Date.now().toString(), text, completed: false, dueDate: document.getElementById("dueDateInput").value || null, priority: document.getElementById("priorityInput").value || "medium" });
      document.getElementById("taskInput").value = '';
      document.getElementById("dueDateInput").value = '';
    }
  });

  document.getElementById("resetBtn").addEventListener("click", () => { if(confirm("Clear all tasks?")) State.setTasks([]); });

  // --- 8. DAILY MOTIVATIONAL QUOTES ---
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Small daily improvements are key to staggering long-term results.", author: "Unknown" }
  ];

  const quoteContent = document.querySelector(".quote-content");
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");

  function updateQuote() {
    quoteContent.classList.add("quote-fade-out");
    setTimeout(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      quoteText.textContent = `"${randomQuote.text}"`;
      quoteAuthor.textContent = `- ${randomQuote.author}`;
      quoteContent.classList.remove("quote-fade-out");
    }, 500); 
  }

  updateQuote();
  setInterval(updateQuote, 15000);

  // Initial Render
  State.notify();
});