const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");
let server;
let appUrl;

test.beforeAll(async () => {
  server = http.createServer((request, response) => {
    const urlPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
    const filePath = path.normalize(path.join(rootDir, urlPath));
    if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    const contentTypes = {
      ".css": "text/css",
      ".html": "text/html",
      ".js": "text/javascript",
      ".json": "application/json",
      ".svg": "image/svg+xml"
    };
    response.writeHead(200, { "content-type": contentTypes[ext] || "application/octet-stream" });
    response.end(fs.readFileSync(filePath));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  appUrl = `http://127.0.0.1:${address.port}/`;
});

test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test.describe("TaskFlow browser smoke and accessibility", () => {
  test("loads without console errors and has no obvious axe violations", async ({ page }) => {
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(appUrl);
    await expect(page.locator("#taskInput")).toBeVisible();
    await page.fill("#taskInput", "Accessibility smoke task");
    await page.click("#addTaskBtn");
    await expect(page.locator(".task-card")).toContainText("Accessibility smoke task");

    const results = await new AxeBuilder({ page }).exclude("#toastContainer").analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
});
