# Taskflow

A small task manager built with React, JavaScript, Vite, and CSS.

## Run locally

Use Node.js 22.12+ or a newer supported version.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To build and preview production files:

```sh
npm run build
npm run preview
```

## Files

- `src/App.jsx`: task state, persistence, filters, and interface.
- `src/App.css`: component styles and responsive layout.
- `src/index.css`: shared styles and design tokens.
- `src/main.jsx`: React entry point with Strict Mode.
- `index.html`, `vite.config.js`, `package.json`: app entry and build configuration.
- `public/favicon.svg`: Taskflow icon.

## Persistence

`src/App.jsx` uses `useState(loadTasks)` to read `taskflow-tasks` from localStorage before the first render. Missing, malformed, or invalid task data falls back to the three sample tasks. A saved empty array stays empty.

A `useEffect` with `[tasks]` saves the complete list after each addition, completion change, or deletion. If browser storage cannot be written, the app displays a warning while keeping the current tasks usable. New tasks receive a cryptographically random ID using `crypto.randomUUID()` with a `crypto.getRandomValues()` fallback for local HTTP networks.

To restore the sample tasks, remove the `taskflow-tasks` key in browser developer tools and refresh. Data is stored separately for each browser and origin, including the port.

## Manual verification

1. Clear `taskflow-tasks` and refresh: the three sample tasks appear.
2. Add a task using the button and another using Enter. Empty or whitespace-only titles cannot be added.
3. Complete a task, then verify All, Active, and Completed filters and counts.
4. Delete a task and refresh: additions, completion changes, and deletions remain.
5. Delete every task and refresh: the empty state remains.
6. Replace the saved value with invalid JSON and refresh: the samples are restored.
7. Remove the storage key and refresh: the samples return.
8. Check desktop and narrow mobile layouts, including long task titles and keyboard controls.
