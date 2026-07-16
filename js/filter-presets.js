import { CATEGORIES, FILTER_PRESETS_KEY } from "./constants.js";
import { safeParse } from "./storage.js";

export const MAX_FILTER_PRESETS = 20;
const VALID_VIEWS = new Set(["all", "today", "week", "month"]);

function cleanText(value, maximum) {
  return String(value ?? "").trim().slice(0, maximum);
}

function validIso(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

export function sanitizeFilterPreset(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;
  const name = cleanText(raw.name, 60);
  if (!name) return null;
  return {
    id: cleanText(raw.id, 100) || `preset-${index}-${Date.now()}`,
    name,
    query: cleanText(raw.query, 500),
    dateView: VALID_VIEWS.has(raw.dateView) ? raw.dateView : "all",
    projectFilter: cleanText(raw.projectFilter, 100) || "all",
    categoryFilter: raw.categoryFilter === "all" || CATEGORIES.includes(raw.categoryFilter)
      ? raw.categoryFilter
      : "all",
    createdAt: validIso(raw.createdAt) || new Date().toISOString()
  };
}

export function sanitizeFilterPresets(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  return raw.map(sanitizeFilterPreset).filter((preset) => {
    if (!preset || seen.has(preset.id)) return false;
    seen.add(preset.id);
    return true;
  }).slice(0, MAX_FILTER_PRESETS);
}

export function createFilterPresetStore({
  storage = globalThis.localStorage,
  idFactory = () => globalThis.crypto.randomUUID(),
  now = () => new Date().toISOString()
} = {}) {
  let presets = sanitizeFilterPresets(safeParse(storage?.getItem(FILTER_PRESETS_KEY), []));

  function persist() {
    if (typeof storage?.setJson === "function") storage.setJson(FILTER_PRESETS_KEY, presets);
    else storage?.setItem(FILTER_PRESETS_KEY, JSON.stringify(presets));
  }

  return {
    getAll() {
      return presets.map((preset) => ({ ...preset }));
    },
    save(name, configuration) {
      if (presets.length >= MAX_FILTER_PRESETS) return { ok: false, reason: "limit" };
      const preset = sanitizeFilterPreset({
        id: idFactory(),
        name,
        ...configuration,
        createdAt: now()
      });
      if (!preset) return { ok: false, reason: "invalid" };
      presets = [...presets, preset];
      persist();
      return { ok: true, preset: { ...preset } };
    },
    rename(id, name) {
      const cleanName = cleanText(name, 60);
      const preset = presets.find((item) => item.id === id);
      if (!preset || !cleanName) return false;
      preset.name = cleanName;
      persist();
      return true;
    },
    delete(id) {
      const next = presets.filter((preset) => preset.id !== id);
      if (next.length === presets.length) return false;
      presets = next;
      persist();
      return true;
    },
    replace(raw) {
      presets = sanitizeFilterPresets(raw);
      persist();
    },
    reset() {
      presets = [];
      persist();
    }
  };
}
