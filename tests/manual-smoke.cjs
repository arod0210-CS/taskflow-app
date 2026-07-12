const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");

function startServer() {
  const server = http.createServer((request, response) => {
    const urlPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
    const filePath = path.normalize(path.join(rootDir, urlPath));
    if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const contentTypes = {
      ".css": "text/css",
      ".html": "text/html",
      ".js": "text/javascript",
      ".json": "application/json",
      ".svg": "image/svg+xml"
    };
    response.writeHead(200, { "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(fs.readFileSync(filePath));
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function expectNoHorizontalScroll(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  if (overflow) throw new Error(`Horizontal scroll detected at ${page.viewportSize().width}px`);
}

async function openSettings(page) {
  const hidden = await page.locator("#settingsPanel").evaluate((panel) => panel.classList.contains("hidden"));
  if (hidden) await page.click("#settingsBtn");
}

async function run() {
  const server = await startServer();
  const appUrl = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  try {
    await page.goto(appUrl);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.waitForSelector("#taskInput");
    await page.fill("#taskInput", "Finish TaskFlow smoke test");
    await page.fill("#dueDateInput", "2026-07-12");
    await page.selectOption("#priorityInput", "high");
    await page.click("#addTaskBtn");
    await page.locator(".task-card").filter({ hasText: "Finish TaskFlow smoke test" }).waitFor();

    await openSettings(page);
    await page.click("#editModeToggle");
    await page.keyboard.press("Escape");
    await page.click(".edit-btn");
    await page.fill("#editTextInput", "Finish edited TaskFlow smoke test");
    await page.click("#editSaveBtn");
    await page.locator(".task-card").filter({ hasText: "Finish edited TaskFlow smoke test" }).waitFor();

    const xpBefore = await page.locator("#miniXpProgressText").textContent();
    await page.click(".toggle-btn");
    await page.locator("#completedList .task-card").waitFor();
    const coinsAfterComplete = await page.locator("#playerCoins").textContent();
    await page.click("#completedList .toggle-btn");
    await page.locator("#todoList .task-card").waitFor();
    const coinsAfterUncomplete = await page.locator("#playerCoins").textContent();
    if (Number(coinsAfterUncomplete) !== Number(coinsAfterComplete)) {
      throw new Error(
        `Uncomplete changed coins from ${coinsAfterComplete} to ${coinsAfterUncomplete}; XP before was ${xpBefore}`
      );
    }

    await page.fill("#searchInput", "missing");
    await page.locator("#todoList .empty-state").filter({ hasText: "No matching tasks" }).waitFor();
    await page.fill("#searchInput", "edited");
    await page.locator("#todoList .task-card").waitFor();

    for (const view of ["today", "week", "month", "all"]) {
      await page.click(`[data-view="${view}"]`);
      await page.waitForTimeout(100);
    }

    await openSettings(page);
    await page.click(".delete-btn");
    await page.locator(".toast").filter({ hasText: "Task deleted" }).waitFor();
    await page.click(".toast-action");
    await page.locator("#todoList .task-card").waitFor();

    await page.click("#tab-habits");
    await page.fill("#habitNameInput", "Read");
    await page.click("#addHabitBtn");
    await page.locator(".habit-card").filter({ hasText: "Read" }).waitFor();
    await page.locator(".habit-card", { hasText: "Read" }).locator(".habit-toggle").click();
    await page.locator(".habit-card.habit-done", { hasText: "Read" }).waitFor();
    if ((await page.locator(".habit-delete-btn").count()) === 0) {
      await openSettings(page);
      await page.click("#editModeToggle");
      await page.keyboard.press("Escape");
    }
    await page.locator(".habit-card", { hasText: "Read" }).locator(".habit-delete-btn").click();
    await page.click("#confirmActionBtn");

    await openSettings(page);
    await page.locator("#darkModeToggle").evaluate((input) => {
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.selectOption("#themeSelect", "ocean");
    await page.selectOption("#languageSelect", "es");
    const translatedAddTask = await page.locator("#addTaskBtn").textContent();
    if (translatedAddTask !== "Agregar tarea") throw new Error("Spanish translation did not update task button");
    await page.keyboard.press("Escape");

    const downloadPromise = page.waitForEvent("download");
    await openSettings(page);
    await page.click("#exportBtn");
    const download = await downloadPromise;
    if (!download.suggestedFilename().startsWith("taskflow-backup-")) throw new Error("Unexpected backup filename");

    const backupPath = path.join(os.tmpdir(), "taskflow-valid-backup.json");
    fs.writeFileSync(
      backupPath,
      JSON.stringify({
        schemaVersion: 1,
        tasks: [{ id: "imported", text: "Imported safe task", priority: "low" }],
        player: { xp: 12 },
        habits: [],
        language: "en",
        settings: { theme: "default", darkMode: false, editMode: false }
      })
    );
    await page.setInputFiles("#importFile", backupPath);
    await page.click("#confirmActionBtn");
    await page.click("#tab-tasks");
    await page.fill("#searchInput", "");
    await page.locator(".task-card", { hasText: "Imported safe task" }).waitFor();

    const invalidPath = path.join(os.tmpdir(), "taskflow-invalid-backup.json");
    fs.writeFileSync(invalidPath, "{broken");
    const beforeInvalidImport = await page.locator(".task-card").count();
    await openSettings(page);
    await page.setInputFiles("#importFile", invalidPath);
    await page.locator(".toast", { hasText: "could not be imported" }).waitFor();
    const afterInvalidImport = await page.locator(".task-card").count();
    if (beforeInvalidImport !== afterInvalidImport) throw new Error("Invalid import changed task state");

    await openSettings(page);
    await page.click("#resetBtn");
    await page.click("#confirmCancelBtn");
    if ((await page.locator(".task-card").count()) === 0) throw new Error("Reset cancel erased data");
    await openSettings(page);
    await page.click("#resetBtn");
    await page.click("#confirmActionBtn");
    await page.locator("#todoList .empty-state", { hasText: "No tasks yet" }).waitFor();

    await page.fill("#taskInput", "Persistence check");
    await page.click("#addTaskBtn");
    await page.reload();
    await page.locator(".task-card", { hasText: "Persistence check" }).waitFor();

    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(100);
      await expectNoHorizontalScroll(page);
    }

    if (consoleErrors.length > 0) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
    console.log("Manual smoke workflows passed.");
  } finally {
    await context.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
