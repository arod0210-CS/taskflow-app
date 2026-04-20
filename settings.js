document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const themeSelect = document.getElementById("themeSelect");
  const editModeToggle = document.getElementById("editModeToggle");

  settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
  });

  const savedDarkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
  if (savedDarkMode) {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
  }

  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
    localStorage.setItem("darkMode", JSON.stringify(darkModeToggle.checked));
  });

  const savedTheme = localStorage.getItem("theme") || "default";
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);

  themeSelect.addEventListener("change", () => {
    const selectedTheme = themeSelect.value;
    applyTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });

  function applyTheme(theme) {
    document.body.classList.remove(
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-fritolay"
    );

    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }
  }

  let editMode = JSON.parse(localStorage.getItem("editMode")) || false;

  function updateEditModeButton() {
    editModeToggle.textContent = editMode ? "Edit Mode: ON" : "Edit Mode: OFF";
  }

  editModeToggle.addEventListener("click", () => {
    editMode = !editMode;
    localStorage.setItem("editMode", JSON.stringify(editMode));
    updateEditModeButton();
  });

  updateEditModeButton();
});