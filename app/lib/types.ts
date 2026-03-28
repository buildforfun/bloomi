export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string; // hex color
  description?: string;
}

export type ViewMode = "day" | "week";

export const EVENT_COLORS = [
  "#F9A8D4", // pink
  "#FDE68A", // yellow
  "#A7F3D0", // mint
  "#93C5FD", // blue
  "#C4B5FD", // purple
  "#FCA5A5", // coral
  "#6EE7B7", // green
  "#FDBA74", // orange
  "#67E8F9", // cyan
  "#D8B4FE", // lavender
];
