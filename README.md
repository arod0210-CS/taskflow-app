# TaskFlow

TaskFlow is a private, browser-based productivity application for tasks, projects, habits, focus sessions, and personal analytics. It is built with native HTML, CSS, and JavaScript ES modules and stores user data locally in the browser.

Current application version: **6.4.0**.

[Live GitHub Pages demo](https://arod0210-cs.github.io/taskflow-app/)

## Features

### Tasks and organization

- Create, edit, complete, reopen, delete, search, filter, and reorder tasks.
- Add priorities, categories, due dates, notes, recurrence, and project assignments.
- Use saved filters and bulk task actions.
- Generate recurring occurrences without changing the existing task storage format.
- Keep archived projects available for history while preventing accidental new assignments.

### Projects, calendar, and dashboard

- Group tasks into active or archived projects and inspect project progress, deadlines, focus time, and recent activity.
- View scheduled tasks in the responsive calendar and agenda.
- Use the dashboard for current priorities, habits, projects, and focus status.

### Habits and reminders

- Create daily habits with emoji and optional reminder times.
- Complete or reopen habits and review retained streak and consistency data.
- Reminder indicators work while TaskFlow is open. TaskFlow does not provide background reminders or cloud notifications.

### Focus and gamification

- Run focus, short-break, and long-break timers with optional task links.
- Review completed and stopped session history, focus statistics, and project focus time.
- Earn XP, coins, streaks, achievements, and daily challenge progress.

### Stats and Analytics 2.0

- Review task progress, focus statistics, achievements, and the existing weekly chart.
- Select last 7 days, last 30 days, this month, previous month, or all retained data.
- Inspect task trends, completion breakdowns, habit consistency, focus trends, project performance, deterministic insights, and a 12-week task heatmap.
- Export a dedicated Analytics JSON report without mixing it with the full-data backup.

### Personalization and accessibility

- English and Spanish localization.
- Default, Sunset, Mint, Galaxy, Rose, and Ocean themes, each compatible with dark mode.
- Keyboard-accessible tabs, dialogs, controls, status messages, and visible focus states.
- Screen-reader labels, live status regions, reduced-motion support, and responsive desktop/mobile layouts.
- Phone-density controls collapse the task form and secondary filters by default, compact habit rows and calendar controls, and preserve the full desktop experience above 600px.

## PWA installation and offline behavior

TaskFlow includes a web app manifest, standard and maskable application icons, an Apple touch icon, and a service worker. Supporting browsers can install it using their native installation UI.

After one successful online visit, the application shell is cached. A later refresh can load offline, and existing tasks, habits, projects, settings, focus history, and analytics remain available from browser storage. Local changes and JSON exports also work offline.

Offline changes are not synchronized to a server. They remain only in the current browser profile. Clearing site data, private-browsing cleanup, browser eviction, or an unavailable storage API can remove or prevent persistence.

When a new service worker is ready, TaskFlow shows an update notice. It does not reload automatically. Selecting **Update now** activates the waiting worker and reloads once after control transfers.

## Data persistence and backups

TaskFlow uses versioned localStorage keys for its existing data structures. Phase 6 does not rename those keys or change their stored object shapes.

Storage writes are guarded against quota, security, availability, and serialization failures. If a write fails, TaskFlow remains usable and shows a localized warning. A later successful write clears or updates that warning.

The full backup button exports a versioned envelope:

```json
{
  "format": "taskflow-backup",
  "schemaVersion": 2,
  "appVersion": "6.4.0",
  "generatedAt": "2026-07-16T00:00:00.000Z",
  "data": {}
}
```

Imports are validated before application state changes. Current versioned backups, legacy object backups, and legacy task-array backups remain supported. Unsupported future schemas and malformed collections are rejected without partial import.

The Analytics export and full backup export remain separate formats, buttons, and workflows.

## Browser expectations

- Use a current Chromium, Safari, or Firefox release for the standard web application.
- Installation and offline capabilities vary by browser and operating system.
- Service workers require HTTPS, `localhost`, or another secure loopback development origin.
- Opening `index.html` directly with `file://` is not the recommended development workflow because TaskFlow uses ES modules and service-worker features.

## Local development

No package installation or build step is required.

```bash
cd /Users/alberto/Documents/Codex/2026-07-15/taskflow-app
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

When testing a new service-worker version, reload the page online first, accept the in-app update notice if shown, and then test an offline refresh.

## Validation

Run the permanent native-Node test suite:

```bash
node tests/run-tests.js
```

The suite checks JavaScript syntax, manifest fields, PNG signatures and dimensions, maskable safe-zone bounds, HTML IDs, ARIA references, CSS structure and order, module imports and cycles, translation parity, task search/filter helpers, presets, selections, Analytics fixtures, storage failures and recovery, backup compatibility and atomic validation, and service-worker cache assets.

Also run Git whitespace validation before publishing:

```bash
git diff --check
```

## Architecture

- `index.html` contains the single-page application structure.
- `styles/` contains ordered, feature-focused stylesheets.
- `js/app.js` owns the single `DOMContentLoaded` entry point.
- `js/core.js` coordinates application state and feature modules.
- Focused modules handle calendar, dashboard, projects, focus, reminders, search, bulk actions, Analytics, guarded storage, backups, application status, mobile-density interactions, and PWA registration.
- `service-worker.js` precaches a deterministic same-origin application shell and never caches localStorage data or generated exports.
- `tests/run-tests.js` is the dependency-free validation entry point.

## GitHub Pages deployment

TaskFlow uses relative manifest, icon, module, stylesheet, and service-worker URLs so it works from the `/taskflow-app/` GitHub Pages project subdirectory. The repository includes `.nojekyll`; publishing the repository root through GitHub Pages requires no build output.

Before deployment, run the validation command, confirm every precache asset exists, and test both an online load and an offline reload from the deployed project URL.
