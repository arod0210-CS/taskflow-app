import { FOCUS_KEY } from "./constants.js";
import { safeParse } from "./storage.js";

export const FOCUS_MODES = ["focus", "shortBreak", "longBreak"];
export const MAX_FOCUS_HISTORY = 200;

export const DEFAULT_FOCUS_SETTINGS = Object.freeze({
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false
});

const SETTING_RANGES = {
  focusMinutes: [5, 90],
  shortBreakMinutes: [1, 30],
  longBreakMinutes: [5, 60],
  sessionsBeforeLongBreak: [2, 8]
};

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(Math.round(number), minimum), maximum);
}

function sanitizeTaskId(value) {
  if (value === null || value === undefined || value === "") return null;
  const id = String(value).trim();
  return id || null;
}

function sanitizeIso(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

export function sanitizeFocusSettings(rawSettings) {
  const settings = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
  const sanitized = {};
  Object.entries(SETTING_RANGES).forEach(([key, [minimum, maximum]]) => {
    sanitized[key] = clampInteger(
      settings[key],
      minimum,
      maximum,
      DEFAULT_FOCUS_SETTINGS[key]
    );
  });
  sanitized.autoStartBreaks = settings.autoStartBreaks === true;
  sanitized.autoStartFocus = settings.autoStartFocus === true;
  return sanitized;
}

function durationForMode(settings, mode) {
  const minuteKey = {
    focus: "focusMinutes",
    shortBreak: "shortBreakMinutes",
    longBreak: "longBreakMinutes"
  }[mode];
  return settings[minuteKey] * 60;
}

function sanitizeHistoryEntry(entry) {
  if (!entry || typeof entry !== "object" || !FOCUS_MODES.includes(entry.mode)) return null;
  const startedAt = sanitizeIso(entry.startedAt);
  const endedAt = sanitizeIso(entry.endedAt);
  const rawDuration = Number(entry.durationSeconds);
  if (!startedAt || !endedAt || endedAt < startedAt || !Number.isFinite(rawDuration) || rawDuration < 1) return null;
  const durationSeconds = clampInteger(rawDuration, 1, 24 * 60 * 60, 1);

  return {
    id: String(entry.id ?? "").trim() || `${startedAt}-${entry.mode}`,
    mode: entry.mode,
    taskId: sanitizeTaskId(entry.taskId),
    startedAt,
    endedAt,
    durationSeconds,
    completed: Boolean(entry.completed)
  };
}

function sanitizeActiveSession(activeSession, settings, now) {
  if (!activeSession || typeof activeSession !== "object" || !FOCUS_MODES.includes(activeSession.mode)) {
    return null;
  }

  const startedAt = sanitizeIso(activeSession.startedAt);
  const targetEndAt = sanitizeIso(activeSession.targetEndAt);
  const isPaused = Boolean(activeSession.isPaused);
  const pausedAt = isPaused ? sanitizeIso(activeSession.pausedAt) : null;
  const maximumDuration = durationForMode(settings, activeSession.mode);
  const durationSeconds = clampInteger(
    activeSession.durationSeconds,
    1,
    90 * 60,
    maximumDuration
  );
  const remainingSeconds = clampInteger(
    activeSession.remainingSeconds,
    0,
    durationSeconds,
    durationSeconds
  );

  const targetTimestamp = Date.parse(targetEndAt);
  if (
    !startedAt ||
    !targetEndAt ||
    (!isPaused && targetTimestamp > now + durationSeconds * 1000 + 1000) ||
    (isPaused && (!pausedAt || remainingSeconds < 1))
  ) return null;

  return {
    mode: activeSession.mode,
    taskId: sanitizeTaskId(activeSession.taskId),
    startedAt,
    targetEndAt,
    pausedAt,
    remainingSeconds,
    durationSeconds,
    isPaused
  };
}

export function defaultFocusData() {
  return {
    settings: { ...DEFAULT_FOCUS_SETTINGS },
    activeSession: null,
    history: [],
    completedFocusSessions: 0
  };
}

export function sanitizeFocusData(rawData, now = Date.now()) {
  const raw = rawData && typeof rawData === "object" ? rawData : {};
  const settings = sanitizeFocusSettings(raw.settings);
  const history = Array.isArray(raw.history)
    ? raw.history
      .map(sanitizeHistoryEntry)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.endedAt) - Date.parse(a.endedAt))
      .slice(0, MAX_FOCUS_HISTORY)
    : [];

  return {
    settings,
    activeSession: sanitizeActiveSession(raw.activeSession, settings, now),
    history,
    completedFocusSessions: clampInteger(
      raw.completedFocusSessions,
      0,
      Number.MAX_SAFE_INTEGER,
      history.filter((entry) => entry.completed && entry.mode === "focus").length
    )
  };
}

export function getRemainingSeconds(activeSession, now = Date.now()) {
  if (!activeSession) return 0;
  if (activeSession.isPaused) return Math.max(0, activeSession.remainingSeconds);
  const remaining = Math.ceil((Date.parse(activeSession.targetEndAt) - now) / 1000);
  return Math.min(Math.max(remaining, 0), activeSession.durationSeconds);
}

function localDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

export function getFocusStats(history, now = new Date()) {
  const today = localDateKey(now);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekStartTimestamp = startOfWeek.getTime();
  const completedFocus = history.filter((entry) => entry.completed && entry.mode === "focus");
  const todayEntries = completedFocus.filter((entry) => localDateKey(new Date(entry.endedAt)) === today);
  const weekEntries = completedFocus.filter((entry) => Date.parse(entry.endedAt) >= weekStartTimestamp);
  const days = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = localDateKey(date);
    days.push({
      date,
      key,
      count: completedFocus.filter((entry) => localDateKey(new Date(entry.endedAt)) === key).length
    });
  }

  return {
    todayCount: todayEntries.length,
    weekCount: weekEntries.length,
    weekMinutes: Math.round(weekEntries.reduce((total, entry) => total + entry.durationSeconds, 0) / 60),
    recent: history.slice(0, 5),
    days
  };
}

export function createFocusTimer({
  storage = globalThis.localStorage,
  now = () => Date.now(),
  setIntervalFn = globalThis.setInterval.bind(globalThis),
  clearIntervalFn = globalThis.clearInterval.bind(globalThis),
  idFactory = () => globalThis.crypto.randomUUID()
} = {}) {
  let data = sanitizeFocusData(safeParse(storage?.getItem(FOCUS_KEY), defaultFocusData()), now());
  let intervalId = null;
  const listeners = new Set();

  function snapshot() {
    return {
      data,
      remainingSeconds: getRemainingSeconds(data.activeSession, now()),
      tickerActive: intervalId !== null
    };
  }

  function emit(event = { type: "update" }) {
    const current = snapshot();
    listeners.forEach((listener) => listener(current, event));
  }

  function save() {
    if (typeof storage?.setJson === "function") storage.setJson(FOCUS_KEY, data);
    else storage?.setItem(FOCUS_KEY, JSON.stringify(data));
  }

  function stopTicker() {
    if (intervalId === null) return;
    clearIntervalFn(intervalId);
    intervalId = null;
  }

  function nextBreakMode() {
    return data.completedFocusSessions % data.settings.sessionsBeforeLongBreak === 0
      ? "longBreak"
      : "shortBreak";
  }

  function start(mode = "focus", taskId = null) {
    if (data.activeSession || !FOCUS_MODES.includes(mode)) return false;
    const startedAtMs = now();
    const durationSeconds = durationForMode(data.settings, mode);
    data.activeSession = {
      mode,
      taskId: sanitizeTaskId(taskId),
      startedAt: new Date(startedAtMs).toISOString(),
      targetEndAt: new Date(startedAtMs + durationSeconds * 1000).toISOString(),
      pausedAt: null,
      remainingSeconds: durationSeconds,
      durationSeconds,
      isPaused: false
    };
    save();
    ensureTicker();
    emit({ type: "start", mode });
    return true;
  }

  function completeActiveSession() {
    const active = data.activeSession;
    if (!active) return false;
    stopTicker();
    const endedAtMs = now();
    const entry = {
      id: idFactory(),
      mode: active.mode,
      taskId: active.taskId,
      startedAt: active.startedAt,
      endedAt: new Date(endedAtMs).toISOString(),
      durationSeconds: active.durationSeconds,
      completed: true
    };
    data.history = [entry, ...data.history].slice(0, MAX_FOCUS_HISTORY);
    if (entry.mode === "focus") data.completedFocusSessions += 1;
    data.activeSession = null;
    const recommendedMode = entry.mode === "focus" ? nextBreakMode() : "focus";
    save();
    emit({ type: "complete", entry, recommendedMode });

    const shouldAutoStart = entry.mode === "focus"
      ? data.settings.autoStartBreaks
      : data.settings.autoStartFocus;
    if (shouldAutoStart) start(recommendedMode, null);
    return true;
  }

  function tick() {
    if (!data.activeSession) {
      stopTicker();
      return;
    }
    if (data.activeSession.isPaused) {
      stopTicker();
      return;
    }
    if (getRemainingSeconds(data.activeSession, now()) <= 0) {
      completeActiveSession();
      return;
    }
    emit({ type: "tick" });
  }

  function ensureTicker() {
    if (!data.activeSession || data.activeSession.isPaused) {
      stopTicker();
      return;
    }
    if (intervalId === null) intervalId = setIntervalFn(tick, 1000);
  }

  function pause() {
    const active = data.activeSession;
    if (!active || active.isPaused) return false;
    const remainingSeconds = getRemainingSeconds(active, now());
    if (remainingSeconds <= 0) return completeActiveSession();
    active.isPaused = true;
    active.pausedAt = new Date(now()).toISOString();
    active.remainingSeconds = remainingSeconds;
    stopTicker();
    save();
    emit({ type: "pause" });
    return true;
  }

  function resume() {
    const active = data.activeSession;
    if (!active || !active.isPaused || active.remainingSeconds <= 0) return false;
    const resumedAt = now();
    active.isPaused = false;
    active.pausedAt = null;
    active.targetEndAt = new Date(resumedAt + active.remainingSeconds * 1000).toISOString();
    save();
    ensureTicker();
    emit({ type: "resume" });
    return true;
  }

  function reset() {
    const active = data.activeSession;
    if (!active) return false;
    const endedAtMs = now();
    const remainingSeconds = getRemainingSeconds(active, endedAtMs);
    const elapsedSeconds = Math.max(0, active.durationSeconds - remainingSeconds);
    stopTicker();
    if (elapsedSeconds > 0) {
      data.history = [{
        id: idFactory(),
        mode: active.mode,
        taskId: active.taskId,
        startedAt: active.startedAt,
        endedAt: new Date(endedAtMs).toISOString(),
        durationSeconds: elapsedSeconds,
        completed: false
      }, ...data.history].slice(0, MAX_FOCUS_HISTORY);
    }
    data.activeSession = null;
    save();
    emit({ type: "reset" });
    return true;
  }

  function updateSettings(updates) {
    data.settings = sanitizeFocusSettings({ ...data.settings, ...updates });
    save();
    emit({ type: "settings" });
  }

  function resetSettings() {
    data.settings = { ...DEFAULT_FOCUS_SETTINGS };
    save();
    emit({ type: "settings" });
  }

  function replaceImportedData(importedData) {
    stopTicker();
    const sanitized = sanitizeFocusData(importedData, now());
    data = { ...sanitized, activeSession: null };
    save();
    emit({ type: "import" });
  }

  function resetAll() {
    stopTicker();
    data = defaultFocusData();
    save();
    emit({ type: "resetAll" });
  }

  function activate() {
    if (data.activeSession && !data.activeSession.isPaused && getRemainingSeconds(data.activeSession, now()) <= 0) {
      completeActiveSession();
      return;
    }
    ensureTicker();
    emit({ type: "restore" });
  }

  function getExportData() {
    return {
      settings: { ...data.settings },
      history: data.history.map((entry) => ({ ...entry })),
      completedFocusSessions: data.completedFocusSessions
    };
  }

  return {
    activate,
    getExportData,
    getSnapshot: snapshot,
    pause,
    replaceImportedData,
    reset,
    resetAll,
    resetSettings,
    resume,
    start,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    updateSettings,
    destroy() {
      stopTicker();
      listeners.clear();
    }
  };
}

function formatClock(seconds) {
  const safeSeconds = Math.max(0, seconds);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function createOption(value, text, disabled = false) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  option.disabled = disabled;
  return option;
}

export function createFocusUI({ timer, t, switchTab, toggleTask, onSessionComplete }) {
  const elements = {
    modeButtons: Array.from(document.querySelectorAll(".focus-mode-btn")),
    countdown: document.getElementById("focusCountdown"),
    modeLabel: document.getElementById("focusCurrentMode"),
    timerHuman: document.getElementById("focusTimerAnnouncement"),
    progress: document.getElementById("focusProgress"),
    progressFill: document.getElementById("focusProgressFill"),
    taskSelect: document.getElementById("focusTaskSelect"),
    taskMeta: document.getElementById("focusTaskMeta"),
    mainAction: document.getElementById("focusMainAction"),
    reset: document.getElementById("focusResetAction"),
    enterMode: document.getElementById("focusEnterMode"),
    sessionCount: document.getElementById("focusSessionCount"),
    settingsToggle: document.getElementById("focusSettingsToggle"),
    settingsPanel: document.getElementById("focusSettingsPanel"),
    settingsForm: document.getElementById("focusSettingsForm"),
    focusMinutes: document.getElementById("focusMinutesInput"),
    shortMinutes: document.getElementById("focusShortBreakInput"),
    longMinutes: document.getElementById("focusLongBreakInput"),
    sessionsBeforeLong: document.getElementById("focusSessionsBeforeLongInput"),
    autoBreaks: document.getElementById("focusAutoBreaksInput"),
    autoFocus: document.getElementById("focusAutoFocusInput"),
    resetSettings: document.getElementById("focusResetSettings"),
    settingsStatus: document.getElementById("focusSettingsStatus"),
    recentList: document.getElementById("focusRecentList"),
    completion: document.getElementById("focusCompletionCard"),
    completionTitle: document.getElementById("focusCompletionTitle"),
    completionText: document.getElementById("focusCompletionText"),
    startShort: document.getElementById("focusStartShortBreak"),
    startLong: document.getElementById("focusStartLongBreak"),
    startAnother: document.getElementById("focusStartAnother"),
    completeTask: document.getElementById("focusCompleteTask"),
    topIndicator: document.getElementById("focusTopIndicator"),
    topMode: document.getElementById("focusTopMode"),
    topTime: document.getElementById("focusTopTime"),
    dashboardMode: document.getElementById("dashboardTimerMode"),
    dashboardTime: document.getElementById("dashboardTimerTime"),
    dashboardTask: document.getElementById("dashboardTimerTask"),
    dashboardToday: document.getElementById("dashboardFocusToday"),
    dashboardAction: document.getElementById("dashboardFocusAction"),
    statsToday: document.getElementById("focusStatsToday"),
    statsWeek: document.getElementById("focusStatsWeek"),
    statsMinutes: document.getElementById("focusStatsMinutes"),
    statsChart: document.getElementById("focusStatsChart"),
    statsRecent: document.getElementById("focusStatsRecent"),
    overlay: document.getElementById("focusModeOverlay"),
    overlayMode: document.getElementById("focusModeLabel"),
    overlayCountdown: document.getElementById("focusModeCountdown"),
    overlayTask: document.getElementById("focusModeTask"),
    overlayMeta: document.getElementById("focusModeTaskMeta"),
    overlayAction: document.getElementById("focusModeAction"),
    overlayReset: document.getElementById("focusModeReset"),
    overlayExit: document.getElementById("focusModeExit")
  };

  let latestState = null;
  let selectedMode = "focus";
  let selectedTaskId = null;
  let lastCompletion = null;
  let overlayReturnFocus = null;
  let lastAnnouncedMinute = null;

  function modeText(mode) {
    return t({ focus: "focusSession", shortBreak: "focusShortBreak", longBreak: "focusLongBreak" }[mode]);
  }

  function taskMetadata(task, state) {
    if (!task) return "";
    const labels = [];
    const project = state.projects.find((item) => item.id === task.projectId);
    if (project) labels.push(`${project.emoji} ${project.name}${project.archived ? ` · ${t("archived")}` : ""}`);
    if (task.category) labels.push(t(`category${task.category[0].toUpperCase()}${task.category.slice(1)}`));
    return labels.join(" · ");
  }

  function linkedTask(state, active) {
    const taskId = active?.taskId || selectedTaskId;
    return state.tasks.find((task) => task.id === taskId) || null;
  }

  function humanRemaining(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return t("focusRemainingTime")
      .replace("{minutes}", minutes)
      .replace("{seconds}", remainder);
  }

  function renderTimerSurfaces(state, event = { type: "app" }) {
    const { data, remainingSeconds } = timer.getSnapshot();
    const active = data.activeSession;
    const mode = active?.mode || selectedMode;
    const clock = formatClock(active ? remainingSeconds : durationForMode(data.settings, selectedMode));
    const task = linkedTask(state, active);
    const metadata = taskMetadata(task, state);
    const paused = Boolean(active?.isPaused);

    elements.countdown.textContent = clock;
    elements.modeLabel.textContent = modeText(mode);
    elements.progress.setAttribute("aria-valuenow", active
      ? String(Math.round(((active.durationSeconds - remainingSeconds) / active.durationSeconds) * 100))
      : "0");
    elements.progress.setAttribute("aria-label", `${modeText(mode)}: ${humanRemaining(active ? remainingSeconds : durationForMode(data.settings, mode))}`);
    elements.progressFill.style.width = active
      ? `${Math.min(100, ((active.durationSeconds - remainingSeconds) / active.durationSeconds) * 100)}%`
      : "0%";

    const minute = Math.ceil(remainingSeconds / 60);
    if (event.type !== "tick" || minute !== lastAnnouncedMinute) {
      elements.timerHuman.textContent = `${modeText(mode)}. ${humanRemaining(active ? remainingSeconds : durationForMode(data.settings, mode))}`;
      lastAnnouncedMinute = minute;
    }

    elements.mainAction.textContent = !active ? t("focusStart") : paused ? t("focusResume") : t("focusPause");
    elements.reset.disabled = !active;
    elements.enterMode.disabled = !active;
    elements.taskSelect.disabled = Boolean(active) || mode !== "focus";
    elements.modeButtons.forEach((button) => {
      const selected = button.dataset.focusMode === mode;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("active", selected);
      button.disabled = Boolean(active);
    });

    elements.topIndicator.classList.toggle("hidden", !active);
    if (active) {
      elements.topMode.textContent = modeText(active.mode);
      elements.topTime.textContent = clock;
      elements.topIndicator.setAttribute("aria-label", `${modeText(active.mode)}. ${humanRemaining(remainingSeconds)}. ${t("focusOpen")}`);
    }

    const stats = getFocusStats(data.history);
    elements.dashboardMode.textContent = active ? modeText(active.mode) : t("focusReady");
    elements.dashboardTime.textContent = active ? clock : formatClock(data.settings.focusMinutes * 60);
    elements.dashboardTask.textContent = active
      ? task?.text || t("focusNoLinkedTask")
      : t("focusDashboardIdle");
    elements.dashboardToday.textContent = t("focusCompletedTodayValue").replace("{count}", stats.todayCount);
    elements.dashboardAction.textContent = active ? t("focusOpen") : t("focusStart");

    const overlayOpen = !elements.overlay.classList.contains("hidden");
    if (overlayOpen) {
      elements.overlayMode.textContent = active ? modeText(active.mode) : t("focusSessionComplete");
      elements.overlayCountdown.textContent = active ? clock : "00:00";
      elements.overlayTask.textContent = task?.text || t("focusNoLinkedTask");
      elements.overlayMeta.textContent = metadata;
      elements.overlayAction.disabled = !active;
      elements.overlayAction.textContent = paused ? t("focusResume") : t("focusPause");
      elements.overlayReset.disabled = !active;
    }
  }

  function renderTaskSelector(state, active) {
    const currentValue = active?.taskId || selectedTaskId || "";
    const incomplete = state.tasks.filter((task) => !task.completed);
    const options = [createOption("", t("focusNoLinkedTask"))];
    incomplete.forEach((task) => options.push(createOption(task.id, task.text)));
    const currentTask = state.tasks.find((task) => task.id === currentValue);
    if (!active && currentValue && !currentTask) selectedTaskId = null;
    if (currentValue && currentTask && !incomplete.some((task) => task.id === currentValue)) {
      options.push(createOption(currentTask.id, `${currentTask.text} · ${t("completed")}`));
    }
    elements.taskSelect.replaceChildren(...options);
    elements.taskSelect.value = options.some((option) => option.value === currentValue) ? currentValue : "";
    const selectedTask = state.tasks.find((task) => task.id === elements.taskSelect.value);
    elements.taskMeta.textContent = taskMetadata(selectedTask, state);
  }

  function renderSettings(settings, force = false) {
    if (force || !elements.settingsPanel.contains(document.activeElement)) {
      elements.focusMinutes.value = String(settings.focusMinutes);
      elements.shortMinutes.value = String(settings.shortBreakMinutes);
      elements.longMinutes.value = String(settings.longBreakMinutes);
      elements.sessionsBeforeLong.value = String(settings.sessionsBeforeLongBreak);
      elements.autoBreaks.checked = settings.autoStartBreaks;
      elements.autoFocus.checked = settings.autoStartFocus;
    }
  }

  function buildHistoryItem(entry, state, compact = false) {
    const item = document.createElement("li");
    item.className = `focus-history-item${entry.completed ? "" : " focus-history-incomplete"}`;
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = modeText(entry.mode);
    const task = state.tasks.find((candidate) => candidate.id === entry.taskId);
    const meta = document.createElement("span");
    const date = new Date(entry.endedAt).toLocaleString(state.language === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
    meta.textContent = [
      `${Math.round(entry.durationSeconds / 60)} ${t("focusMinutesShort")}`,
      date,
      task?.text || ""
    ].filter(Boolean).join(" · ");
    copy.append(title, meta);
    if (!compact) {
      const status = document.createElement("span");
      status.className = "focus-history-status";
      status.textContent = entry.completed ? t("focusCompletedStatus") : t("focusStoppedStatus");
      item.append(copy, status);
    } else {
      item.appendChild(copy);
    }
    return item;
  }

  function renderHistory(state, history) {
    const empty = () => {
      const item = document.createElement("li");
      item.className = "focus-history-empty";
      item.textContent = t("focusNoSessions");
      return item;
    };
    const recent = history.slice(0, 5);
    elements.recentList.replaceChildren(...(recent.length ? recent.map((entry) => buildHistoryItem(entry, state)) : [empty()]));
    elements.statsRecent.replaceChildren(...(recent.length ? recent.map((entry) => buildHistoryItem(entry, state, true)) : [empty()]));
  }

  function renderStats(state, history) {
    const stats = getFocusStats(history);
    elements.statsToday.textContent = String(stats.todayCount);
    elements.statsWeek.textContent = String(stats.weekCount);
    elements.statsMinutes.textContent = String(stats.weekMinutes);
    const max = Math.max(...stats.days.map((day) => day.count), 1);
    const locale = state.language === "es" ? "es-ES" : "en-US";
    const bars = stats.days.map((day) => {
      const group = document.createElement("div");
      group.className = `focus-stat-day${day.count === 0 ? " is-zero" : ""}`;
      group.tabIndex = 0;
      const label = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day.date).replace(".", "");
      group.setAttribute("role", "img");
      group.setAttribute("aria-label", `${label}: ${day.count} ${t("focusSessionsLabel")}`);
      const count = document.createElement("span");
      count.textContent = String(day.count);
      const track = document.createElement("span");
      track.className = "focus-stat-track";
      const fill = document.createElement("span");
      fill.style.height = `${(day.count / max) * 100}%`;
      track.appendChild(fill);
      const dayLabel = document.createElement("span");
      dayLabel.textContent = label;
      group.append(count, track, dayLabel);
      return group;
    });
    elements.statsChart.replaceChildren(...bars);
  }

  function renderCompletion(state) {
    const active = timer.getSnapshot().data.activeSession;
    elements.completion.classList.toggle("hidden", !lastCompletion);
    if (!lastCompletion) return;
    const isFocus = lastCompletion.entry.mode === "focus";
    elements.completionTitle.textContent = isFocus ? t("focusSessionComplete") : t("focusBreakComplete");
    elements.completionText.textContent = t("focusCompletionSummary")
      .replace("{mode}", modeText(lastCompletion.entry.mode))
      .replace("{minutes}", Math.round(lastCompletion.entry.durationSeconds / 60));
    elements.startShort.classList.toggle("hidden", !isFocus || Boolean(active));
    elements.startLong.classList.toggle("hidden", !isFocus || Boolean(active) || lastCompletion.recommendedMode !== "longBreak");
    elements.startAnother.classList.toggle("hidden", Boolean(active));
    const task = state.tasks.find((candidate) => candidate.id === lastCompletion.entry.taskId);
    elements.completeTask.classList.toggle("hidden", !isFocus || !task || task.completed);
  }

  function render(state, event = { type: "app" }) {
    latestState = state;
    if (event.type === "complete") lastCompletion = event;
    renderTimerSurfaces(state, event);
    if (event.type === "tick") return;
    const { data } = timer.getSnapshot();
    if (data.activeSession) {
      selectedMode = data.activeSession.mode;
      selectedTaskId = data.activeSession.taskId;
    }
    renderTaskSelector(state, data.activeSession);
    renderSettings(data.settings, event.type === "settings");
    renderHistory(state, data.history);
    renderStats(state, data.history);
    elements.sessionCount.textContent = t("focusSessionCountValue").replace("{count}", data.completedFocusSessions);
    renderCompletion(state);
  }

  function openFocusMode(trigger) {
    if (!timer.getSnapshot().data.activeSession) return;
    overlayReturnFocus = trigger || document.activeElement;
    document.body.classList.add("focus-mode-open");
    elements.overlay.classList.remove("hidden");
    renderTimerSurfaces(latestState || { tasks: [], projects: [] }, { type: "overlay" });
    elements.overlayExit.focus();
  }

  function closeFocusMode() {
    if (elements.overlay.classList.contains("hidden")) return;
    elements.overlay.classList.add("hidden");
    document.body.classList.remove("focus-mode-open");
    if (overlayReturnFocus?.isConnected) overlayReturnFocus.focus();
    overlayReturnFocus = null;
  }

  elements.modeButtons.forEach((button) => button.addEventListener("click", () => {
    if (timer.getSnapshot().data.activeSession) return;
    selectedMode = button.dataset.focusMode;
    render(latestState);
  }));
  elements.taskSelect.addEventListener("change", () => {
    selectedTaskId = elements.taskSelect.value || null;
    render(latestState);
  });
  elements.mainAction.addEventListener("click", () => {
    const active = timer.getSnapshot().data.activeSession;
    lastCompletion = null;
    if (!active) timer.start(selectedMode, selectedMode === "focus" ? selectedTaskId : null);
    else if (active.isPaused) timer.resume();
    else timer.pause();
  });
  elements.reset.addEventListener("click", () => timer.reset());
  elements.enterMode.addEventListener("click", (event) => openFocusMode(event.currentTarget));
  elements.topIndicator.addEventListener("click", () => switchTab("focus"));
  elements.dashboardAction.addEventListener("click", () => {
    const active = timer.getSnapshot().data.activeSession;
    switchTab("focus");
    if (!active) {
      selectedMode = "focus";
      selectedTaskId = null;
      lastCompletion = null;
      timer.start("focus", null);
    }
  });
  elements.settingsToggle.addEventListener("click", () => {
    const expanded = elements.settingsToggle.getAttribute("aria-expanded") === "true";
    elements.settingsToggle.setAttribute("aria-expanded", String(!expanded));
    elements.settingsPanel.classList.toggle("hidden", expanded);
  });
  elements.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    timer.updateSettings({
      focusMinutes: elements.focusMinutes.value,
      shortBreakMinutes: elements.shortMinutes.value,
      longBreakMinutes: elements.longMinutes.value,
      sessionsBeforeLongBreak: elements.sessionsBeforeLong.value,
      autoStartBreaks: elements.autoBreaks.checked,
      autoStartFocus: elements.autoFocus.checked
    });
  });
  elements.resetSettings.addEventListener("click", () => timer.resetSettings());
  elements.startShort.addEventListener("click", () => {
    lastCompletion = null;
    timer.start("shortBreak", null);
  });
  elements.startLong.addEventListener("click", () => {
    lastCompletion = null;
    timer.start("longBreak", null);
  });
  elements.startAnother.addEventListener("click", () => {
    const candidateTask = latestState?.tasks.find((task) => task.id === lastCompletion?.entry.taskId);
    const taskId = candidateTask && !candidateTask.completed ? candidateTask.id : null;
    lastCompletion = null;
    timer.start("focus", taskId);
  });
  elements.completeTask.addEventListener("click", () => {
    const taskId = lastCompletion?.entry.taskId;
    const task = latestState?.tasks.find((candidate) => candidate.id === taskId);
    if (task && !task.completed) toggleTask(task.id);
  });
  elements.overlayAction.addEventListener("click", () => {
    const active = timer.getSnapshot().data.activeSession;
    if (!active) return;
    if (active.isPaused) timer.resume();
    else timer.pause();
  });
  elements.overlayReset.addEventListener("click", () => {
    timer.reset();
    closeFocusMode();
  });
  elements.overlayExit.addEventListener("click", closeFocusMode);
  elements.overlay.addEventListener("click", (event) => {
    if (event.target === elements.overlay) closeFocusMode();
  });
  document.addEventListener("keydown", (event) => {
    if (elements.overlay.classList.contains("hidden")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeFocusMode();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [elements.overlayAction, elements.overlayReset, elements.overlayExit]
      .filter((element) => !element.disabled && !element.classList.contains("hidden"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return {
    closeFocusMode,
    prepareTask(taskId) {
      selectedMode = "focus";
      selectedTaskId = taskId;
      switchTab("focus");
      if (latestState) render(latestState, { type: "prepare" });
      requestAnimationFrame(() => elements.mainAction.focus());
    },
    render,
    handleTimerEvent(snapshot, event) {
      if (event.type === "complete") onSessionComplete(event);
      if (event.type === "settings") elements.settingsStatus.textContent = t("focusSettingsSaved");
      if (latestState) render(latestState, event);
    }
  };
}
