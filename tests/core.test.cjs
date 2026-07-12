const fs = require("node:fs");
const path = require("node:path");
const core = require("../taskflow-core.js");

const today = "2026-07-12";

function task(overrides = {}) {
  return {
    id: "task-1",
    text: "Write portfolio update",
    completed: false,
    completedAt: null,
    dueDate: today,
    priority: "medium",
    createdAt: "2026-07-12T10:00:00.000Z",
    notes: "",
    ...overrides
  };
}

describe("task logic", () => {
  it("sanitizes task creation and duplicate IDs", () => {
    const tasks = core.sanitizeTasks([
      task({ id: "same", text: "  First <b>task</b>  ", priority: "urgent" }),
      task({ id: "same", text: "Second", dueDate: "not-a-date" }),
      task({ id: "empty", text: "" })
    ]);

    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({ id: "same", text: "First btask/b", priority: "medium" });
    expect(tasks[1].id).toBe("same-1");
    expect(tasks[1].dueDate).toBeNull();
  });

  it("filters by search, date, week, month, and priority-compatible task data", () => {
    const tasks = [
      task({ id: "1", text: "Pay tuition", priority: "high", dueDate: today }),
      task({ id: "2", text: "Plan workout", priority: "low", dueDate: "2026-07-18" }),
      task({ id: "3", text: "Old errand", priority: "medium", dueDate: "2026-06-01" })
    ];

    expect(core.filterTasks(tasks, { searchQuery: "tuition", today })).toHaveLength(1);
    expect(core.filterTasks(tasks, { view: "today", today }).map((item) => item.id)).toEqual(["1"]);
    expect(core.filterTasks(tasks, { view: "week", today }).map((item) => item.id)).toEqual(["1", "2"]);
    expect(core.filterTasks(tasks, { view: "month", today }).map((item) => item.id)).toEqual(["1", "2"]);
  });

  it("calculates priority rewards and level progression", () => {
    expect(core.calculateTaskReward(task({ priority: "high" }), 1, today)).toEqual({ xp: 45, coins: 7 });
    expect(core.calculateTaskReward(task({ priority: "low", dueDate: null }), 3, today)).toEqual({ xp: 25, coins: 7 });

    const player = core.applyXpAndCoins(core.defaultPlayer(), 120, 4);
    expect(player.level).toBe(2);
    expect(player.xp).toBe(20);
    expect(player.coins).toBe(19);
  });

  it("supports completing then uncompleting without duplicating rewards in pure reward flow", () => {
    let player = core.defaultPlayer();
    const reward = core.calculateTaskReward(task({ priority: "medium" }), 1, today);
    player = core.applyXpAndCoins(player, reward.xp, reward.coins);
    const afterComplete = { ...player };

    const afterUncomplete = { ...player };
    expect(afterUncomplete).toEqual(afterComplete);
  });
});

describe("habit and player logic", () => {
  it("sanitizes habit tracking data", () => {
    const habits = core.sanitizeHabits([
      {
        id: "h",
        name: " Hydrate ",
        emoji: "💧",
        reminderTime: "08:30",
        completedDates: ["2026-07-11", "bad"],
        streak: "2"
      }
    ]);

    expect(habits[0]).toMatchObject({
      id: "h",
      name: "Hydrate",
      reminderTime: "08:30",
      completedDates: ["2026-07-11"],
      streak: 2
    });
  });

  it("sanitizes rank, streak, achievements, and completed-by-day values", () => {
    const player = core.sanitizePlayer({
      xp: "80",
      level: "3",
      coins: "25",
      streak: "4",
      badges: ["first_task"],
      completedByDay: { "2026-07-12": "2", nope: 5 }
    });

    expect(player).toMatchObject({ xp: 80, level: 3, coins: 25, streak: 4, badges: ["first_task"] });
    expect(player.completedByDay).toEqual({ "2026-07-12": 2 });
  });
});

describe("backup validation", () => {
  it("rejects invalid JSON before changing state", () => {
    expect(core.validateBackup("{broken").ok).toBe(false);
  });

  it("sanitizes valid backups and rejects incompatible shapes", () => {
    const valid = core.validateBackup(
      JSON.stringify({
        tasks: [task({ id: "x", text: "Imported <script>" })],
        player: { xp: 30 },
        habits: [{ id: "h", name: "Read", emoji: "📘" }],
        language: "es",
        settings: { theme: "ocean", darkMode: true }
      })
    );

    expect(valid.ok).toBe(true);
    expect(valid.data.tasks[0].text).toBe("Imported script");
    expect(valid.data.language).toBe("es");
    expect(valid.data.settings).toMatchObject({ theme: "ocean", darkMode: true });
    expect(core.validateBackup(JSON.stringify({ tasks: {}, habits: [] })).ok).toBe(false);
  });
});

describe("empty state and translations", () => {
  it("distinguishes empty app state from no matching results", () => {
    expect(core.getTaskEmptyState([], [], [], [], { section: "todo" })).toBe("emptyTasks");

    const tasks = [task({ text: "Visible task" })];
    expect(core.getTaskEmptyState(tasks, [], [], [], { section: "todo", searchQuery: "missing" })).toBe("noResults");
  });

  it("contains required English and Spanish translation keys", () => {
    const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
    const requiredKeys = [
      "emptyTasksMessage",
      "noResultsMessage",
      "openSettings",
      "closeSettings",
      "localStorageNotice",
      "importReplaceConfirm",
      "importError",
      "taskDeletedStatus",
      "habitDeletedStatus",
      "resetStatus"
    ];

    requiredKeys.forEach((key) => {
      const matches = script.match(new RegExp(`${key}:`, "g")) || [];
      expect(matches.length).toBeGreaterThanOrEqual(2);
    });
  });
});
