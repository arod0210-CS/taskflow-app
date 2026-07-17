import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildAnalyticsExport } from "../js/analytics-export.js";
import { buildAnalyticsSummary, getAnalyticsRange } from "../js/analytics.js";
import { BACKUP_FORMAT, BACKUP_SCHEMA_VERSION, buildBackupEnvelope, parseBackupText, prepareBackupImport } from "../js/backup.js";
import { createTaskSelection } from "../js/bulk-actions.js";
import { createFilterPresetStore, MAX_FILTER_PRESETS } from "../js/filter-presets.js";
import { createMobileDensity } from "../js/mobile-density.js";
import { createPwaManager } from "../js/pwa.js";
import { matchesTaskQuery, parseTaskQuery } from "../js/search.js";
import { createSafeStorage } from "../js/storage.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const html = read("index.html");
const core = read("js/core.js");
let assertions = 0;

function check(value, message) {
  assertions += 1;
  assert(value, message);
}

function equal(actual, expected, message) {
  assertions += 1;
  assert.deepEqual(actual, expected, message);
}

function testSyntax() {
  const files = [
    ...fs.readdirSync(path.join(root, "js")).filter((name) => name.endsWith(".js")).map((name) => `js/${name}`),
    "service-worker.js",
    "scripts/generate-icons.js",
    "tests/run-tests.js"
  ];
  files.forEach((file) => {
    const result = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
    check(result.status === 0, `${file} syntax: ${result.stderr}`);
  });
}

function testHtmlAndCss() {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  equal(new Set(ids).size, ids.length, "HTML IDs must be unique");
  const idSet = new Set(ids);
  for (const file of fs.readdirSync(path.join(root, "js")).filter((name) => name.endsWith(".js"))) {
    const source = read(`js/${file}`);
    for (const match of source.matchAll(/getElementById\("([^"]+)"\)/g)) {
      check(idSet.has(match[1]), `${file} references missing HTML ID ${match[1]}`);
    }
  }
  for (const match of html.matchAll(/aria-(?:controls|describedby|labelledby)="([^"]+)"/g)) {
    match[1].split(/\s+/).forEach((id) => check(idSet.has(id), `missing ARIA reference ${id}`));
  }

  const cssFiles = fs.readdirSync(path.join(root, "styles")).filter((name) => name.endsWith(".css")).sort();
  const linkedStyles = [...html.matchAll(/<link rel="stylesheet" href="styles\/([^"]+)"/g)].map((match) => match[1]);
  equal(linkedStyles, cssFiles, "stylesheets must be linked once in ordered filename sequence");
  cssFiles.forEach((file) => {
    const css = read(`styles/${file}`);
    equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length, `${file} has unbalanced blocks`);
  });
}

function testTranslations() {
  const enStart = core.indexOf("    en: {");
  const esStart = core.indexOf("    es: {");
  const end = core.indexOf("\n  };", esStart);
  const keys = (source) => [...source.matchAll(/^      ([A-Za-z0-9_]+):/gm)].map((match) => match[1]).sort();
  equal(keys(core.slice(enStart, esStart)), keys(core.slice(esStart, end)), "core translation keys must match");
}

function testModuleGraph() {
  const directory = path.join(root, "js");
  const modules = fs.readdirSync(directory).filter((name) => name.endsWith(".js"));
  const graph = new Map(modules.map((name) => {
    const imports = [...read(`js/${name}`).matchAll(/from\s+["']\.\/([^"']+)["']/g)].map((match) => match[1]);
    imports.forEach((dependency) => check(modules.includes(dependency), `${name} imports missing ${dependency}`));
    return [name, imports];
  }));
  const visiting = new Set();
  const visited = new Set();
  function visit(module) {
    if (visiting.has(module)) assert.fail(`module cycle at ${module}`);
    if (visited.has(module)) return;
    visiting.add(module);
    graph.get(module).forEach(visit);
    visiting.delete(module);
    visited.add(module);
  }
  modules.forEach(visit);
  equal(visited.size, modules.length, "all modules should be reachable in graph validation");
}

function parsePng(relativePath) {
  const buffer = fs.readFileSync(path.join(root, relativePath));
  equal([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${relativePath} PNG signature`);
  const chunks = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += 12 + length;
  }
  const header = chunks.find((chunk) => chunk.type === "IHDR").data;
  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  const compressed = Buffer.concat(chunks.filter((chunk) => chunk.type === "IDAT").map((chunk) => chunk.data));
  const rows = zlib.inflateSync(compressed);
  return { width, height, rows };
}

function testManifestAndIcons() {
  const manifest = JSON.parse(read("manifest.json"));
  ["name", "short_name", "id", "start_url", "scope", "display", "icons"].forEach((key) => check(key in manifest, `manifest missing ${key}`));
  equal([manifest.id, manifest.start_url, manifest.scope, manifest.display], ["./", "./", "./", "standalone"], "scope-safe manifest fields");
  const expected = new Map([
    ["icons/icon-192.png", [192, "any"]],
    ["icons/icon-512.png", [512, "any"]],
    ["icons/icon-maskable-192.png", [192, "maskable"]],
    ["icons/icon-maskable-512.png", [512, "maskable"]]
  ]);
  equal(manifest.icons.length, expected.size, "manifest icon count");
  manifest.icons.forEach((icon) => {
    check(!icon.src.startsWith("/"), `${icon.src} must be relative`);
    check(fs.existsSync(path.join(root, icon.src)), `${icon.src} must exist`);
    const [size, purpose] = expected.get(icon.src) || [];
    equal([icon.sizes, icon.type, icon.purpose], [`${size}x${size}`, "image/png", purpose], `${icon.src} declaration`);
    const png = parsePng(icon.src);
    equal([png.width, png.height], [size, size], `${icon.src} dimensions`);
    if (purpose === "maskable") {
      const stride = size * 4 + 1;
      let foreground = 0;
      for (let y = 0; y < size; y += 1) {
        check(png.rows[y * stride] === 0, `${icon.src} uses deterministic filter 0`);
        for (let x = 0; x < size; x += 1) {
          const index = y * stride + 1 + x * 4;
          const alpha = png.rows[index + 3];
          check(alpha === 255, `${icon.src} maskable background must be opaque`);
          const isForeground = png.rows[index] > 220 && png.rows[index + 1] > 220 && png.rows[index + 2] > 220;
          if (isForeground) {
            foreground += 1;
            const distance = Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2);
            check(distance <= size * 0.4, `${icon.src} foreground exceeds maskable safe zone`);
          }
        }
      }
      check(foreground > 0, `${icon.src} should contain foreground artwork`);
    }
  });
  const apple = parsePng("icons/apple-touch-icon.png");
  equal([apple.width, apple.height], [180, 180], "Apple touch icon dimensions");
  check(html.includes('href="icons/apple-touch-icon.png"'), "Apple touch icon should be linked");
}

function testSearchPresetsAndSelection() {
  const task = { text: "Write report", notes: "Quarterly finance", priority: "high", category: "work", dueDate: "2026-07-16", projectId: "p1", completed: false };
  check(matchesTaskQuery(task, parseTaskQuery("report priority:high category:work"), { projectName: "Launch" }), "structured search should match");
  check(!matchesTaskQuery(task, parseTaskQuery("status:done"), { projectName: "Launch" }), "status search should exclude active task");
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
  const presets = createFilterPresetStore({ storage, idFactory: () => `p-${memory.size}`, now: () => "2026-07-16T00:00:00.000Z" });
  check(presets.save("Work", { query: "work", dateView: "all", projectFilter: "all", categoryFilter: "work" }).ok, "preset save");
  for (let index = 1; index < MAX_FILTER_PRESETS; index += 1) presets.save(`Preset ${index}`, { query: "", dateView: "all", projectFilter: "all", categoryFilter: "all" });
  equal(presets.save("Overflow", {}).reason, "limit", "preset limit");
  const selection = createTaskSelection();
  selection.enter();
  selection.selectVisible(["a", "b"]);
  selection.toggle("b");
  equal(selection.getIds(), ["a"], "selection fixtures");
}

function testAnalytics() {
  const now = new Date(2026, 6, 16, 12);
  const data = {
    tasks: [
      { id: "a", text: "A", completed: true, completedAt: "2026-07-15T12:00:00Z", createdAt: "2026-07-01T12:00:00Z", dueDate: "2026-07-15", priority: "high", category: "work", projectId: null, recurrence: null },
      { id: "b", text: "B", completed: false, completedAt: null, createdAt: "2026-07-01T12:00:00Z", dueDate: "2026-07-16", priority: "low", category: null, projectId: null, recurrence: null }
    ],
    player: { completedByDay: { "2026-07-15": 2, bad: 9 } },
    habits: [{ id: "h", name: "Walk", emoji: "🚶", completedDates: ["2026-07-15"], streak: 1 }],
    projects: [],
    focusHistory: [{ id: "f", mode: "focus", taskId: "missing", startedAt: "2026-07-15T10:00:00Z", endedAt: "2026-07-15T10:25:00Z", durationSeconds: 1500, completed: true }]
  };
  equal([getAnalyticsRange("last7", now, data).start, getAnalyticsRange("last7", now, data).end], ["2026-07-10", "2026-07-16"], "last-seven range");
  equal(getAnalyticsRange("all", now, data).start, "2026-07-01", "corrupt dates excluded from all range");
  const summary = buildAnalyticsSummary(data, "last7", now);
  equal([summary.taskTrends.total, summary.breakdowns.completionRate.rate, summary.focus.minutes], [2, 50, 25], "analytics aggregation");
  equal(summary.heatmap.days.length, 84, "heatmap length");
  equal(buildAnalyticsExport(summary, "6.1.0").schemaVersion, 1, "Analytics export remains separate schema");
}

function storageError(name, code) {
  const error = new Error(name);
  error.name = name;
  if (code) error.code = code;
  return error;
}

function testSafeStorage() {
  const events = [];
  let fail = null;
  const values = new Map();
  const target = {
    getItem(key) { if (fail) throw fail; return values.get(key) || null; },
    setItem(key, value) { if (fail) throw fail; values.set(key, value); },
    removeItem(key) { if (fail) throw fail; values.delete(key); }
  };
  const storage = createSafeStorage({ storage: target, onStatus: (event) => events.push(event) });
  check(storage.setJson("ok", { value: 1 }).ok, "normal storage write");
  equal(JSON.parse(values.get("ok")), { value: 1 }, "stored JSON shape");
  fail = storageError("QuotaExceededError", 22);
  equal(storage.setItem("quota", "x").reason, "quota", "quota classification");
  storage.setItem("quota", "x");
  equal(events.filter((event) => event.type === "failure").length, 1, "duplicate warning suppression");
  fail = null;
  check(storage.setItem("recovered", "yes").recovered, "successful write recovery");
  equal(events.at(-1).type, "recovered", "recovery event");
  fail = storageError("SecurityError");
  equal(storage.setItem("blocked", "x").reason, "security", "security classification");
  const unavailable = createSafeStorage({ storage: null });
  equal(unavailable.setItem("x", "y").reason, "unavailable", "unavailable storage");
  const circular = {}; circular.self = circular;
  equal(storage.setJson("circular", circular).reason, "serialization", "serialization failure");
  fail = null;
  const batched = storage.batch(() => {
    storage.setItem("one", "1");
    storage.setItem("two", "2");
  });
  check(batched.ok, "successful storage batch");
}

function baseBackupData() {
  return {
    tasks: [{ id: "t", text: "Task", completed: false, completedAt: null, dueDate: null, priority: "medium", createdAt: "2026-07-16T00:00:00.000Z", notes: "", rewardGranted: false, projectId: null, category: null }],
    player: { xp: 1 },
    habits: [],
    language: "en",
    projects: [],
    focus: { settings: {}, activeSession: null, history: [], completedFocusSessions: 0 },
    filterPresets: []
  };
}

function testBackups() {
  const current = baseBackupData();
  const snapshot = structuredClone(current);
  const envelope = buildBackupEnvelope(current, "6.1.0");
  equal([envelope.format, envelope.schemaVersion, envelope.appVersion], [BACKUP_FORMAT, BACKUP_SCHEMA_VERSION, "6.1.0"], "versioned backup envelope");
  check(prepareBackupImport(envelope, current).ok, "current versioned backup import");
  check(prepareBackupImport(current, current).ok, "legacy object backup import");
  check(prepareBackupImport(current.tasks, current).ok, "legacy array backup import");
  equal(parseBackupText("not json", current).reason, "invalidJson", "invalid JSON rejection");
  equal(prepareBackupImport({}, current).reason, "missingData", "missing data rejection");
  equal(prepareBackupImport({ format: "wrong", schemaVersion: 2, data: { tasks: [] } }, current).reason, "wrongFormat", "wrong format rejection");
  equal(prepareBackupImport({ format: BACKUP_FORMAT, schemaVersion: 99, data: { tasks: [] } }, current).reason, "unsupportedVersion", "future schema rejection");
  equal(prepareBackupImport({ ...current, habits: {} }, current).reason, "invalidCollection", "corrupt collection rejection");
  check(prepareBackupImport({ tasks: [] }, current).ok, "legacy optional fields may be missing");
  const empty = prepareBackupImport(buildBackupEnvelope({ ...current, tasks: [], habits: [], projects: [], filterPresets: [] }, "6.1.0"), current);
  check(empty.ok, "empty valid backup");
  equal([empty.data.tasks.length, empty.data.habits.length, empty.data.projects.length], [0, 0, 0], "empty collections preserved");
  equal(current, snapshot, "invalid and valid preparation must not mutate current state");
}

function testServiceWorker() {
  const source = read("service-worker.js");
  check(source.includes('const APP_VERSION = "6.1.0"'), "service-worker version");
  check(read("js/constants.js").includes('APP_VERSION = "6.1.0"'), "application version matches service worker");
  check(read("README.md").includes('"appVersion": "6.1.0"'), "documentation version matches application");
  check(source.includes("SKIP_WAITING"), "user-controlled update message");
  check(!source.includes("self.skipWaiting()\n") && source.includes("event.data?.type"), "skipWaiting must be message controlled");
  const match = source.match(/const PRECACHE_URLS = \[([\s\S]*?)\n\];/);
  check(Boolean(match), "precache list found");
  const assets = JSON.parse(`[${match[1]}]`);
  equal(new Set(assets).size, assets.length, "precache URLs unique");
  assets.forEach((asset) => {
    check(asset.startsWith("./"), `${asset} must be scope relative`);
    if (asset !== "./") check(fs.existsSync(path.join(root, asset.slice(2))), `${asset} must exist`);
  });
  check(source.includes('name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME'), "only obsolete TaskFlow caches are removed");
  check(source.includes('url.protocol === "blob:"'), "Blob requests bypass service worker");
}

function testMobileDensity() {
  const required = [
    ["mobileTaskFormToggle", "taskEntryPanel"],
    ["mobileTaskFiltersToggle", "taskFiltersPanel"],
    ["mobileCalendarFiltersToggle", "calendarProjectControls"]
  ];
  required.forEach(([toggleId, panelId]) => {
    const toggle = html.match(new RegExp(`<button[^>]*id="${toggleId}"[^>]*>`))?.[0] || "";
    check(toggle.includes('aria-expanded="false"'), `${toggleId} starts collapsed for phones`);
    check(toggle.includes(`aria-controls="${panelId}"`), `${toggleId} controls ${panelId}`);
    check(html.includes(`id="${panelId}"`), `${panelId} exists`);
  });

  const css = read("styles/23-mobile-density.css");
  const phoneRules = css.indexOf("@media (max-width: 600px)");
  check(phoneRules > 0, "phone density rules use the 600px breakpoint");
  [".task-entry-panel", ".habit-card", ".calendar-toolbar", ".dashboard-overview"]
    .forEach((selector) => check(css.indexOf(selector) > phoneRules, `${selector} override is phone-scoped`));

  class FakeElement extends EventTarget {
    constructor() {
      super();
      this.attributes = new Map();
      this.classes = new Set();
      this.value = "all";
      this.checked = false;
      this.focused = 0;
      this.classList = {
        add: (...names) => names.forEach((name) => this.classes.add(name)),
        remove: (...names) => names.forEach((name) => this.classes.delete(name)),
        contains: (name) => this.classes.has(name),
        toggle: (name, force) => {
          const active = force === undefined ? !this.classes.has(name) : Boolean(force);
          if (active) this.classes.add(name); else this.classes.delete(name);
          return active;
        }
      };
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    focus() { this.focused += 1; }
  }

  const ids = [
    "mobileTaskFormToggle", "mobileTaskFormToggleLabel", "taskEntryPanel", "taskInput",
    "mobileTaskFiltersToggle", "mobileTaskFiltersToggleLabel", "taskFiltersPanel",
    "projectFilterInput", "categoryFilterInput", "savedFilterSelect",
    "mobileCalendarFiltersToggle", "mobileCalendarFiltersToggleLabel", "calendarProjectControls",
    "calendarProjectFilter", "calendarIncludeArchived"
  ];
  const elements = new Map(ids.map((id) => [id, new FakeElement()]));
  const media = new EventTarget();
  media.matches = true;
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalAnimationFrame = Object.getOwnPropertyDescriptor(globalThis, "requestAnimationFrame");
  Object.defineProperty(globalThis, "document", { configurable: true, value: { getElementById: (id) => elements.get(id) || null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => media } });
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, value: (callback) => callback() });

  try {
    const controller = createMobileDensity({ t: (key) => key });
    const taskToggle = elements.get("mobileTaskFormToggle");
    const taskPanel = elements.get("taskEntryPanel");
    equal(taskToggle.getAttribute("aria-expanded"), "false", "mobile task form initializes collapsed");
    check(taskPanel.classList.contains("is-mobile-collapsed"), "mobile task panel initializes hidden");
    taskToggle.dispatchEvent(new Event("click"));
    equal(taskToggle.getAttribute("aria-expanded"), "true", "mobile task toggle expands panel");
    check(!taskPanel.classList.contains("is-mobile-collapsed"), "expanded task panel becomes visible");
    equal(elements.get("taskInput").focused, 1, "opening task form moves focus to title");

    const filtersToggle = elements.get("mobileTaskFiltersToggle");
    filtersToggle.dispatchEvent(new Event("click"));
    equal(filtersToggle.getAttribute("aria-expanded"), "true", "mobile task filters expand");
    elements.get("projectFilterInput").value = "project-1";
    elements.get("projectFilterInput").dispatchEvent(new Event("change"));
    check(filtersToggle.classList.contains("has-active-filter"), "active task filter is exposed without color alone");

    check(controller.collapseTaskFormAfterSubmit(), "successful mobile submit requests form collapse");
    equal(taskToggle.getAttribute("aria-expanded"), "false", "mobile task form collapses after submit");
    check(taskPanel.classList.contains("is-mobile-collapsed"), "submitted task panel is hidden");

    media.matches = false;
    media.dispatchEvent(new Event("change"));
    check(!taskPanel.classList.contains("is-mobile-collapsed"), "desktop viewport restores full task form");
  } finally {
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument); else delete globalThis.document;
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow); else delete globalThis.window;
    if (originalAnimationFrame) Object.defineProperty(globalThis, "requestAnimationFrame", originalAnimationFrame); else delete globalThis.requestAnimationFrame;
  }
}

async function testPwaUpdateFlow() {
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const registration = new EventTarget();
  const serviceWorker = new EventTarget();
  const connectivity = [];
  const updateStates = [];
  const messages = [];
  let registered = null;
  let reloads = 0;
  let updateHandler = null;

  registration.waiting = { postMessage: (message) => messages.push(message) };
  registration.installing = null;
  serviceWorker.controller = {};
  serviceWorker.register = async (url, options) => {
    registered = { url, options };
    return registration;
  };
  const windowMock = new EventTarget();
  windowMock.location = { protocol: "http:", reload: () => { reloads += 1; } };

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: true, serviceWorker }
  });
  Object.defineProperty(globalThis, "window", { configurable: true, value: windowMock });

  try {
    const manager = createPwaManager({
      status: {
        setConnectivity: (online, options) => connectivity.push({ online, options }),
        setUpdateAvailable: (available) => updateStates.push(available),
        setUpdateHandler: (handler) => { updateHandler = handler; }
      }
    });
    await manager.register();
    equal(registered, { url: "./service-worker.js", options: { scope: "./" } }, "scope-safe service-worker registration");
    equal(connectivity[0], { online: true, options: { initial: true } }, "initial connectivity status");
    check(updateStates.at(-1), "waiting worker should expose update notice");
    updateHandler();
    equal(messages, [{ type: "SKIP_WAITING" }], "update requires intentional user action");
    serviceWorker.dispatchEvent(new Event("controllerchange"));
    serviceWorker.dispatchEvent(new Event("controllerchange"));
    equal(reloads, 1, "controller change reloads once");
    windowMock.dispatchEvent(new Event("offline"));
    windowMock.dispatchEvent(new Event("online"));
    equal(connectivity.slice(-2).map((entry) => entry.online), [false, true], "offline and online status events");
  } finally {
    if (originalNavigator) Object.defineProperty(globalThis, "navigator", originalNavigator);
    else delete globalThis.navigator;
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else delete globalThis.window;
  }
}

testSyntax();
testHtmlAndCss();
testTranslations();
testModuleGraph();
testManifestAndIcons();
testSearchPresetsAndSelection();
testAnalytics();
testSafeStorage();
testBackups();
testServiceWorker();
testMobileDensity();
await testPwaUpdateFlow();

console.log(JSON.stringify({ status: "passed", assertions, modules: fs.readdirSync(path.join(root, "js")).filter((name) => name.endsWith(".js")).length }));
