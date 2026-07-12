# TaskFlow

TaskFlow is a responsive, gamified productivity web application built with vanilla HTML, CSS, and JavaScript. It helps users manage tasks and daily habits while tracking XP, coins, ranks, streaks, achievements, themes, dark mode, and English/Spanish language preferences.

## Live Demo

[TaskFlow on GitHub Pages](https://arod0210-cs.github.io/taskflow-app/)

## Screenshots

Screenshots are not currently committed to the repository.

- Desktop screenshot: placeholder
- Mobile screenshot: placeholder
- Dark mode screenshot: placeholder

## Main Features

- Create, edit, complete, delete, search, filter, and reorder tasks
- Assign priorities, due dates, and optional notes
- Track daily habits, reminders, and habit streaks
- Earn XP and coins from completed tasks and habits
- View ranks, streaks, daily challenges, achievements, and weekly progress
- Switch between English and Spanish
- Toggle dark mode and choose from multiple color themes
- Persist data in browser local storage
- Export and import JSON backups
- Confirm major destructive actions before data is removed
- Use accessible empty states, dialogs, status messages, and keyboard navigation

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Browser Local Storage API
- Vitest
- ESLint
- Prettier
- html-validate
- Playwright with axe-core
- GitHub Pages

## Run Locally

```bash
git clone https://github.com/arod0210-CS/taskflow-app.git
cd taskflow-app
npm install
```

Open `index.html` directly in a browser, or serve the folder with any static file server.

## Local Storage

TaskFlow currently stores information locally in the browser. It does not yet provide user accounts, cloud synchronization, server backups, or cross-device syncing.

Export your data before clearing browser storage, using private browsing modes, resetting the app, or switching devices.

Stored data includes:

- Tasks, notes, due dates, priorities, and completion state
- Player XP, coins, level, rank progress, streaks, and achievement state
- Daily habits, reminder times, completion dates, and habit streaks
- Language, theme, dark mode, active tab, and edit-mode preferences

## Import and Export

Use the settings menu to export a JSON backup. Exported files use this filename pattern:

```text
taskflow-backup-YYYY-MM-DD.json
```

Use Import Data to restore a backup. TaskFlow validates the file before replacing current data. Invalid JSON, incompatible shapes, duplicate IDs, unsafe text, and unexpected data types are rejected or sanitized before the app state changes. The app asks for confirmation before replacing existing local data.

## Backup Data Schema

Current backups use `schemaVersion: 1`.

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-07-12T12:00:00.000Z",
  "tasks": [
    {
      "id": "string",
      "text": "string",
      "completed": false,
      "completedAt": null,
      "dueDate": "YYYY-MM-DD or null",
      "priority": "high | medium | low",
      "createdAt": "ISO date string",
      "notes": "string"
    }
  ],
  "player": {
    "xp": 0,
    "level": 1,
    "coins": 0,
    "streak": 0,
    "lastCompletedDate": "YYYY-MM-DD or null",
    "completedToday": 0,
    "completedWeek": 0,
    "totalCompleted": 0,
    "challengeRewarded": [],
    "challengeRewardedDate": "YYYY-MM-DD or null",
    "badges": [],
    "usedBothLanguages": false,
    "usedDarkMode": false,
    "completedByDay": {}
  },
  "habits": [
    {
      "id": "string",
      "name": "string",
      "emoji": "string",
      "reminderTime": "HH:MM or null",
      "completedDates": ["YYYY-MM-DD"],
      "streak": 0,
      "lastCompletedDate": "YYYY-MM-DD or null"
    }
  ],
  "language": "en | es",
  "settings": {
    "theme": "default | sunset | mint | galaxy | rose | ocean",
    "darkMode": false,
    "editMode": false
  }
}
```

## Project Structure

```text
.
├── index.html
├── style.css
├── script.js
├── taskflow-core.js
├── tests/
│   ├── core.test.cjs
│   └── a11y.spec.cjs
├── manifest.json
├── favicon.svg
├── package.json
└── README.md
```

## Accessibility Improvements

- Icon-only and compact controls include clearer accessible labels
- The settings button announces open and close state
- Focus states are visible for keyboard users
- Escape closes open settings panels and dialogs
- Custom confirmation dialogs trap focus and return focus when closed
- Status messages announce task, habit, import, export, reset, and delete actions
- Empty and no-results states are distinct and translated
- Form inputs have associated labels
- Priority is communicated through text badges as well as color

## Challenges and Lessons Learned

- Keeping a single-file JavaScript app maintainable benefits from extracting pure logic slowly instead of rewriting everything at once.
- Local-first apps need clear export/import guidance because browser storage can be cleared outside the app.
- Destructive actions should match the risk: quick task deletion can use Undo, while reset and import replacement need explicit confirmation.
- Accessibility is easier to preserve when dialogs, status messages, labels, and focus behavior are treated as core app behavior.

## Known Limitations

- Data is stored only in the current browser.
- There are no user accounts or cloud sync yet.
- Habit reminders only work while the page is open.
- Backups must be manually exported and imported.
- GitHub Pages serves the app as static files; there is no backend API.

## Planned Future Improvements

- Optional account-based sync
- More advanced analytics
- Recurring tasks
- More flexible reminder options
- Screenshot assets for the README
- Broader cross-browser manual testing

## Testing

```bash
npm test
npm run test:coverage
npm run lint
npm run format:check
npm run validate:html
npm run test:a11y
```

Manual testing should include task creation, editing, completion, deletion with Undo, search, filters, habit tracking, imports, exports, reset confirmation, theme changes, dark mode, English/Spanish switching, refresh persistence, and responsive layouts.

## License

This project is licensed under the terms in [LICENSE](LICENSE).

## Author

Alberto Rodriguez  
Computer Science Student | Aspiring Software Developer
