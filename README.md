# MyStudyMate

# StudyMate – Student Study Planner

A lightweight, browser-based study planner for students to organise study tasks,
track deadlines, and monitor progress — no account or installation needed.

## Who it's for
StudyMate is for students (e.g., university or high-school learners) who want a
simple way to plan study sessions and see their progress at a glance.

## How to run / view
1. Clone or download this repository.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
   - No server, build step, or installation required.
3. Tasks are saved automatically in your browser's `localStorage`, so they
   persist between visits in the same browser.

Optional: view it online by enabling GitHub Pages
(Settings → Pages → Deploy from branch → `main` → `/root`).

## Features
- Dashboard with total / completed / pending counts and a progress bar
- Add, edit, complete/undo, and delete study tasks
- Search by subject or description; filter by pending/completed
- Deadline validation (past dates blocked) and overdue indicators
- Responsive layout for desktop and mobile
- Data persisted with `localStorage`

## Tech stack
HTML5, CSS3, and vanilla JavaScript — no frameworks, no database.

## Project structure
- `index.html` — page structure and the three views
- `style.css` — styling and responsive layout
- `script.js` — app logic, storage, and rendering
