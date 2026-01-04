# LoL Pick/Ban Anticipation (Frontend)

A small **League of Legends pick/ban simulator** designed to add *anticipation* to champion select.
Instead of instantly revealing the final state, the UI focuses on the moment-to-moment tension of **hovering, locking, and banning** champs.

This repo is the **frontend** built with React + Vite.

## What it does

- Simulates a pick/ban flow where the fun is in the *reveal*.
- Uses a local champion splash set under [`public/champions/`](public/champions/:1) to render champion images quickly.
- Runs entirely in the browser (no server required for basic usage).

## Tech stack

- React 19 ([`src/main.jsx`](src/main.jsx:1), [`src/App.jsx`](src/App.jsx:1))
- Vite ([`vite.config.js`](vite.config.js:1))
- Tailwind CSS v4 via Vite plugin ([`package.json`](package.json:1))
- ESLint ([`eslint.config.js`](eslint.config.js:1))

## Getting started

### 1) Install

```bash
npm install
```

### 2) Run the dev server

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`).

### 3) Build / preview

```bash
npm run build
npm run preview
```

## Project layout

- App entry: [`index.html`](index.html:1)
- React bootstrap: [`src/main.jsx`](src/main.jsx:1)
- Main UI: [`src/App.jsx`](src/App.jsx:1)
- Styles: [`src/App.css`](src/App.css:1), [`src/index.css`](src/index.css:1)
- Champion data: [`src/data.js`](src/data.js:1)
- Champion images: [`public/champions/`](public/champions/:1)

## Assets

Champion images are stored in [`public/champions/`](public/champions/:1) (mostly `.avif` with a few `.jpg`).
If you add new champs, keep filenames consistent with whatever key/name is used in [`src/data.js`](src/data.js:1).

## Notes

This project is community-made and is **not affiliated with Riot Games**.

## License

See repository licensing (if present). If no license file exists yet, treat this project as “all rights reserved” by default.
