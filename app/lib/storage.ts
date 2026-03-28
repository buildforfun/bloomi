import { CalendarEvent } from "./types";

const STORAGE_KEY = "calendar-app-events";

export function getEvents(): CalendarEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn("Bloomi: corrupted data in localStorage, resetting.");
      return [];
    }
    return parsed;
  } catch (err) {
    console.warn("Bloomi: failed to load events from localStorage:", err);
    return [];
  }
}

export function saveEvents(events: CalendarEvent[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (err) {
    console.error("Bloomi: failed to save events:", err);
    alert("Could not save — your browser storage may be full. Please free up space or clear old data.");
    return false;
  }
}

export function generateId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getEventsForDate(
  events: CalendarEvent[],
  date: string
): CalendarEvent[] {
  return events
    .filter((e) => e.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
