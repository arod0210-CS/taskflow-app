document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const themeSelect = document.getElementById("themeSelect");
  const editModeToggle = document.getElementById("editModeToggle");

  const THEME_CLASSES = [
    "theme-blue",
    "theme-green",
    "theme-purple",
    "theme-fritolay"
  ];

  if (!settingsBtn || !settingsPanel) return;

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

  settingsPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

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

  const savedTheme = localStorage.getItem("theme") || "default";
  if (themeSelect) themeSelect.value = savedTheme;
  applyTheme(savedTheme);

  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      const selectedTheme = themeSelect.value;
      applyTheme(selectedTheme);
      localStorage.setItem("theme", selectedTheme);
    });
  }

  function applyTheme(theme) {
    document.body.classList.remove(...THEME_CLASSES);
    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }
  }

  let editMode = JSON.parse(localStorage.getItem("editMode")) || false;
  window.getEditMode = () => editMode;

  function updateEditModeButton() {
    if (!editModeToggle) return;
    editModeToggle.textContent = editMode ? "Edit Mode: ON" : "Edit Mode: OFF";
    editModeToggle.classList.toggle("edit-mode-active", editMode);
  }

  if (editModeToggle) {
    editModeToggle.addEventListener("click", () => {
      editMode = !editMode;
      localStorage.setItem("editMode", JSON.stringify(editMode));
      updateEditModeButton();

      if (typeof window.renderTasks === "function") {
        window.renderTasks();
      }
    });
  }

  updateEditModeButton();
});