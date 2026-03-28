export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string; // hex color
  description?: string;
  tags?: string[];
}

// Palette for tag badge colors — derived from tag name via hash
export const TAG_COLORS = [
  { bg: "#EDE9FE", text: "#6D28D9" }, // violet
  { bg: "#FCE7F3", text: "#BE185D" }, // pink
  { bg: "#DBEAFE", text: "#1D4ED8" }, // blue
  { bg: "#D1FAE5", text: "#047857" }, // green
  { bg: "#FEF3C7", text: "#B45309" }, // amber
  { bg: "#FFE4E6", text: "#BE123C" }, // rose
  { bg: "#E0E7FF", text: "#4338CA" }, // indigo
  { bg: "#CCFBF1", text: "#0F766E" }, // teal
  { bg: "#FED7AA", text: "#C2410C" }, // orange
  { bg: "#E9D5FF", text: "#7C3AED" }, // purple
];

export function getTagColor(tag: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
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
