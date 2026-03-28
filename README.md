# Bloomi

**Live:** [bloomi-pi.vercel.app](https://bloomi-pi.vercel.app/)

A colorful, friendly calendar app that keeps things simple. No clutter, no feature overload — just a clean way to manage your day.

## Features

- **Day & Week views** — toggle between a single-day timeline and a full week grid
- **Drag and drop** — reschedule events by dragging them to a new time slot or day
- **Overlapping events** — multiple events at the same time render side-by-side, not stacked
- **10 pastel colors** — every event gets a color, picked from a curated palette
- **Add, edit, delete** — simple modal form with time validation and delete confirmation
- **Local storage** — your events stay in your browser, no account needed
- **Mobile responsive** — works on desktop and mobile with touch-friendly drag support

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [dnd-kit](https://dndkit.com/) for drag-and-drop
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Bloomi is ready to deploy on [Vercel](https://vercel.com):

```bash
npm run build
```

Or connect your GitHub repo to Vercel for automatic deployments.

## What Bloomi Doesn't Do (intentionally)

- No user accounts or auth
- No recurring events
- No notifications or reminders
- No sync across devices
- No all-day events

These are deliberate constraints to keep the app minimal and focused. They may come in future versions.

## License

MIT
