const APP_VERSION = "6.4.0";
const CACHE_PREFIX = "taskflow-static-";
const CACHE_NAME = `${CACHE_PREFIX}v${APP_VERSION}`;
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./styles/01-tokens.css",
  "./styles/02-base.css",
  "./styles/03-components.css",
  "./styles/04-themes.css",
  "./styles/05-features.css",
  "./styles/06-responsive.css",
  "./styles/07-desktop.css",
  "./styles/08-tasks.css",
  "./styles/09-stats.css",
  "./styles/10-task-refinements.css",
  "./styles/11-habits.css",
  "./styles/12-polish.css",
  "./styles/13-dashboard.css",
  "./styles/14-projects.css",
  "./styles/15-calendar.css",
  "./styles/16-reminders.css",
  "./styles/17-recurrence.css",
  "./styles/18-focus.css",
  "./styles/19-search-bulk.css",
  "./styles/20-rich-projects.css",
  "./styles/21-analytics.css",
  "./styles/22-pwa.css",
  "./styles/23-mobile-density.css",
  "./js/app.js",
  "./js/analytics-export.js",
  "./js/analytics.js",
  "./js/app-status.js",
  "./js/backup.js",
  "./js/bulk-actions.js",
  "./js/calendar.js",
  "./js/constants.js",
  "./js/core.js",
  "./js/dashboard.js",
  "./js/data.js",
  "./js/dates.js",
  "./js/filter-presets.js",
  "./js/interaction-guard.js",
  "./js/focus.js",
  "./js/mobile-density.js",
  "./js/project-dashboard.js",
  "./js/projects.js",
  "./js/pwa.js",
  "./js/recurrence.js",
  "./js/reminders.js",
  "./js/search.js",
  "./js/storage.js"
];

function scopedUrl(relativeUrl) {
  return new URL(relativeUrl, self.registration.scope).href;
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.protocol === "blob:" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (
        await caches.match(scopedUrl("./index.html")) ||
        await caches.match(scopedUrl("./")) ||
        Response.error()
      ))
    );
    return;
  }

  const allowedAssets = new Set(PRECACHE_URLS.map(scopedUrl));
  if (!allowedAssets.has(url.href)) return;
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return Response.error();
      }
    })
  );
});
