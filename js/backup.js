import { defaultPlayer, sanitizeHabits, sanitizePlayer, sanitizeTasks } from "./data.js";
import { sanitizeFilterPresets } from "./filter-presets.js";
import { defaultFocusData, sanitizeFocusData } from "./focus.js";
import { sanitizeProjects, sanitizeTaskProjectReferences } from "./projects.js";

export const BACKUP_FORMAT = "taskflow-backup";
export const BACKUP_SCHEMA_VERSION = 2;

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function invalid(reason) {
  return { ok: false, reason };
}

function sanitizeCompleteArray(raw, sanitizer) {
  if (!Array.isArray(raw)) return invalid("invalidCollection");
  const value = sanitizer(raw);
  return value.length === raw.length ? { ok: true, value } : invalid("invalidCollection");
}

export function buildBackupEnvelope(data, appVersion) {
  return {
    format: BACKUP_FORMAT,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion,
    generatedAt: new Date().toISOString(),
    data: {
      tasks: data.tasks,
      player: data.player,
      habits: data.habits,
      language: data.language,
      projects: data.projects,
      focus: data.focus,
      filterPresets: data.filterPresets
    }
  };
}

export function downloadBackupJson(envelope) {
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `taskflow-backup-${envelope.generatedAt.slice(0, 10)}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function unwrapBackup(input) {
  if (Array.isArray(input)) return { ok: true, source: "legacy-array", data: { tasks: input } };
  if (!isObject(input)) return invalid("missingData");

  const appearsVersioned = "format" in input || "schemaVersion" in input || "data" in input;
  if (!appearsVersioned) {
    if (!Array.isArray(input.tasks)) return invalid("missingData");
    return { ok: true, source: "legacy-object", data: input };
  }

  if (input.format !== BACKUP_FORMAT) return invalid("wrongFormat");
  if (!Number.isInteger(input.schemaVersion)) return invalid("unsupportedVersion");
  if (input.schemaVersion > BACKUP_SCHEMA_VERSION) return invalid("unsupportedVersion");
  if (input.schemaVersion !== BACKUP_SCHEMA_VERSION) return invalid("unsupportedVersion");
  if (!isObject(input.data) || !Array.isArray(input.data.tasks)) return invalid("missingData");
  return { ok: true, source: "versioned", data: input.data };
}

export function prepareBackupImport(input, current = {}) {
  const unwrapped = unwrapBackup(input);
  if (!unwrapped.ok) return unwrapped;
  const raw = unwrapped.data;

  const projectsRaw = "projects" in raw ? raw.projects : (current.projects || []);
  const projectsResult = sanitizeCompleteArray(projectsRaw, sanitizeProjects);
  if (!projectsResult.ok) return projectsResult;

  const tasksResult = sanitizeCompleteArray(raw.tasks, sanitizeTasks);
  if (!tasksResult.ok) return tasksResult;

  let habits = current.habits || [];
  if ("habits" in raw) {
    const habitsResult = sanitizeCompleteArray(raw.habits, sanitizeHabits);
    if (!habitsResult.ok) return habitsResult;
    habits = habitsResult.value;
  }

  let filterPresets = current.filterPresets || [];
  if ("filterPresets" in raw) {
    const presetResult = sanitizeCompleteArray(raw.filterPresets, sanitizeFilterPresets);
    if (!presetResult.ok) return presetResult;
    filterPresets = presetResult.value;
  }

  let player = current.player || defaultPlayer();
  if ("player" in raw) {
    if (!isObject(raw.player)) return invalid("invalidCollection");
    player = sanitizePlayer(raw.player);
  }

  let focus = current.focus || defaultFocusData();
  if ("focus" in raw) {
    if (!isObject(raw.focus)) return invalid("invalidCollection");
    if ("history" in raw.focus && !Array.isArray(raw.focus.history)) return invalid("invalidCollection");
    focus = sanitizeFocusData(raw.focus);
    if (Array.isArray(raw.focus.history) && focus.history.length !== raw.focus.history.length) {
      return invalid("invalidCollection");
    }
  }

  let language = current.language || "en";
  if ("language" in raw) {
    if (!['en', 'es'].includes(raw.language)) return invalid("invalidLanguage");
    language = raw.language;
  }

  const projects = projectsResult.value;
  const tasks = sanitizeTaskProjectReferences(tasksResult.value, projects);
  return {
    ok: true,
    source: unwrapped.source,
    data: { tasks, projects, player, habits, language, focus, filterPresets },
    provided: {
      projects: "projects" in raw,
      player: "player" in raw,
      habits: "habits" in raw,
      language: "language" in raw,
      focus: "focus" in raw,
      filterPresets: "filterPresets" in raw
    }
  };
}

export function parseBackupText(text, current = {}) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return invalid("invalidJson");
  }
  return prepareBackupImport(parsed, current);
}
