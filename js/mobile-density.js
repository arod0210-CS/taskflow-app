const PHONE_QUERY = "(max-width: 600px)";

export function createMobileDensity({ t }) {
  const media = window.matchMedia(PHONE_QUERY);
  const elements = {
    taskToggle: document.getElementById("mobileTaskFormToggle"),
    taskToggleLabel: document.getElementById("mobileTaskFormToggleLabel"),
    taskPanel: document.getElementById("taskEntryPanel"),
    taskInput: document.getElementById("taskInput"),
    taskFiltersToggle: document.getElementById("mobileTaskFiltersToggle"),
    taskFiltersToggleLabel: document.getElementById("mobileTaskFiltersToggleLabel"),
    taskFiltersPanel: document.getElementById("taskFiltersPanel"),
    projectFilter: document.getElementById("projectFilterInput"),
    categoryFilter: document.getElementById("categoryFilterInput"),
    savedFilter: document.getElementById("savedFilterSelect"),
    calendarToggle: document.getElementById("mobileCalendarFiltersToggle"),
    calendarToggleLabel: document.getElementById("mobileCalendarFiltersToggleLabel"),
    calendarPanel: document.getElementById("calendarProjectControls"),
    calendarProject: document.getElementById("calendarProjectFilter"),
    calendarArchived: document.getElementById("calendarIncludeArchived")
  };
  let wasPhone = false;

  function isExpanded(toggle) {
    return toggle?.getAttribute("aria-expanded") === "true";
  }

  function setExpanded(toggle, panel, expanded) {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", String(expanded));
    panel.classList.toggle("is-mobile-collapsed", !expanded && media.matches);
  }

  function taskFiltersActive() {
    return elements.projectFilter?.value !== "all" ||
      elements.categoryFilter?.value !== "all" ||
      Boolean(elements.savedFilter?.value);
  }

  function calendarFiltersActive() {
    return elements.calendarProject?.value !== "all" || Boolean(elements.calendarArchived?.checked);
  }

  function activeSuffix(active) {
    return active ? ` · ${t("mobileActiveFilter")}` : "";
  }

  function render() {
    const taskOpen = isExpanded(elements.taskToggle);
    const taskFiltersOpen = isExpanded(elements.taskFiltersToggle);
    const calendarOpen = isExpanded(elements.calendarToggle);

    if (elements.taskToggleLabel) {
      elements.taskToggleLabel.textContent = t(taskOpen ? "mobileCloseTaskForm" : "mobileAddTask");
      elements.taskToggle.setAttribute("aria-label", t(taskOpen ? "mobileCloseTaskForm" : "mobileShowTaskForm"));
    }
    if (elements.taskFiltersToggleLabel) {
      elements.taskFiltersToggleLabel.textContent = taskFiltersOpen
        ? t("mobileHideFilters")
        : `${t("mobileFilters")}${activeSuffix(taskFiltersActive())}`;
      elements.taskFiltersToggle.classList.toggle("has-active-filter", taskFiltersActive());
    }
    if (elements.calendarToggleLabel) {
      elements.calendarToggleLabel.textContent = calendarOpen
        ? t("mobileHideCalendarFilters")
        : `${t("mobileCalendarFilters")}${activeSuffix(calendarFiltersActive())}`;
      elements.calendarToggle.classList.toggle("has-active-filter", calendarFiltersActive());
    }
  }

  function syncViewport() {
    if (media.matches && !wasPhone) {
      setExpanded(elements.taskToggle, elements.taskPanel, false);
      setExpanded(elements.taskFiltersToggle, elements.taskFiltersPanel, false);
      setExpanded(elements.calendarToggle, elements.calendarPanel, false);
    } else if (!media.matches) {
      [elements.taskPanel, elements.taskFiltersPanel, elements.calendarPanel]
        .forEach((panel) => panel?.classList.remove("is-mobile-collapsed"));
    }
    wasPhone = media.matches;
    render();
  }

  function bindToggle(toggle, panel, { focusTarget = null } = {}) {
    toggle?.addEventListener("click", () => {
      const expanded = !isExpanded(toggle);
      setExpanded(toggle, panel, expanded);
      render();
      if (expanded && focusTarget) requestAnimationFrame(() => focusTarget.focus());
    });
  }

  bindToggle(elements.taskToggle, elements.taskPanel, { focusTarget: elements.taskInput });
  bindToggle(elements.taskFiltersToggle, elements.taskFiltersPanel);
  bindToggle(elements.calendarToggle, elements.calendarPanel);

  [elements.projectFilter, elements.categoryFilter, elements.savedFilter,
    elements.calendarProject, elements.calendarArchived]
    .forEach((control) => control?.addEventListener("change", render));

  media.addEventListener?.("change", syncViewport);
  syncViewport();

  return {
    render,
    isPhone: () => media.matches,
    openTaskForm({ focus = true } = {}) {
      if (!media.matches) return false;
      setExpanded(elements.taskToggle, elements.taskPanel, true);
      render();
      if (focus) requestAnimationFrame(() => elements.taskInput?.focus());
      return true;
    },
    collapseTaskFormAfterSubmit() {
      if (!media.matches) return false;
      setExpanded(elements.taskToggle, elements.taskPanel, false);
      render();
      requestAnimationFrame(() => elements.taskToggle?.focus());
      return true;
    }
  };
}

