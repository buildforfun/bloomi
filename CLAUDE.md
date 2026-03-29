# Bloomi — Colorful Calendar App

## Tech Stack
- Next.js (App Router) + React + TypeScript + Tailwind CSS
- Firebase Auth (Google sign-in) + Firestore (events per user)
- dnd-kit for drag-and-drop
- Deployed on Vercel: https://bloomi-pi.vercel.app
- Repo: github.com/buildforfun/bloomi

## Project Structure
- `app/lib/firebase.ts` — Firebase init
- `app/lib/auth.ts` — Google sign-in/out
- `app/lib/firestore.ts` — Firestore CRUD for events
- `app/lib/storage.ts` — Utility functions (formatDate, getWeekDates, etc.)
- `app/lib/types.ts` — CalendarEvent interface, color palettes
- `app/components/` — All UI components
- `app/shared/page.tsx` — Read-only shared events page (no auth required)

## Firestore Structure
- `users/{userId}/events/{eventId}` — one doc per event

## MANDATORY: Test After Every Change
Before committing or deploying, verify ALL of the following:

1. **Auth flow:** Sign in with Google, sign out, sign back in
2. **CRUD:** Create event, edit it, delete it — verify in Firestore console
3. **Tags:** Add tags, remove tags, verify they persist after refresh
4. **Drag and drop:** Drag event to new time slot, verify it updates in Firestore
5. **Views:** Toggle day/week view, navigate prev/next, click Today
6. **Sharing:** Create tagged events, generate share link, open in incognito
7. **Mobile:** Test on 375px viewport — header, modals, week view, touch drag
8. **Firestore data:** No `undefined` values in Firestore docs (check console)
9. **Build:** `npm run build` must pass clean

## Known Constraints
- No recurring events, no all-day events, no notifications
- Share links are URL-encoded snapshots, not live
- Firestore test mode — security rules need hardening before public launch

## Code Rules
- All components are "use client"
- Never pass `undefined` to Firestore — use `null` or omit the field
- Use `next/image` for any images, not `<img>` tags
- Mobile-first: test at 375px width before shipping
