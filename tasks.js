
Copy

document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn    = document.getElementById("settingsBtn");
  const settingsPanel  = document.getElementById("settingsPanel");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const themeSelect    = document.getElementById("themeSelect");
  const editModeToggle = document.getElementById("editModeToggle");
 
  const THEME_CLASSES = ["theme-blue", "theme-green", "theme-purple", "theme-fritolay"];
 
  // ── Settings panel open / close ─────────────────────────────────────────────
 
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle("hidden");
  });
 
  // Close when clicking outside the panel
  document.addEventListener("click", (e) => {
    if (
      !settingsPanel.classList.contains("hidden") &&
      !settingsPanel.contains(e.target) &&
      e.target !== settingsBtn
    ) {
      settingsPanel.classList.add("hidden");
    }
  });
 
  // Prevent clicks inside panel from bubbling to document
  settingsPanel.addEventListener("click", (e) => e.stopPropagation());
 
  // ── Dark mode ───────────────────────────────────────────────────────────────
 
  const savedDarkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
 
  if (darkModeToggle) darkModeToggle.checked = savedDarkMode;
  document.body.classList.toggle("dark-mode", savedDarkMode);
 
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      const isDark = darkModeToggle.checked;
      document.body.classList.toggle("dark-mode", isDark);
      localStorage.setItem("darkMode", JSON.stringify(isDark));
    });
  }
 
  // ── Theme color ─────────────────────────────────────────────────────────────
 
  const savedTheme = localStorage.getItem("theme") || "default";
 
  if (themeSelect) themeSelect.value = savedTheme;
  applyTheme(savedTheme);
 
  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      applyTheme(themeSelect.value);
      localStorage.setItem("theme", themeSelect.value);
    });
  }
 
  function applyTheme(theme) {
    document.body.classList.remove(...THEME_CLASSES);
    if (theme !== "default") document.body.classList.add(`theme-${theme}`);
  }
 
  // ── Edit mode ───────────────────────────────────────────────────────────────
 
  let editMode = JSON.parse(localStorage.getItem("editMode")) || false;
 
  // Shared getter — tasks.js and any other module reads this instead of localStorage
  window.getEditMode = () => editMode;
 
  function updateEditModeButton() {
    if (editModeToggle) {
      editModeToggle.textContent = editMode ? "Edit Mode: ON" : "Edit Mode: OFF";
      editModeToggle.classList.toggle("edit-mode-active", editMode);
    }
  }
 
  if (editModeToggle) {
    editModeToggle.addEventListener("click", () => {
      editMode = !editMode;
      localStorage.setItem("editMode", JSON.stringify(editMode));
      updateEditModeButton();
 
      // Re-render via the exported function so task cards show/hide action buttons
      if (typeof window.renderTasks === "function") {
        window.renderTasks();
      }
    });
  }
 
  updateEditModeButton();
});
 