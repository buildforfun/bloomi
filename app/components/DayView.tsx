"use client";

import { CalendarEvent } from "../lib/types";
import { getEventsForDate, formatDate } from "../lib/storage";
import EventCard from "./EventCard";
import TimeSlot from "./TimeSlot";

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: string, hour: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function DayView({
  date,
  events,
  onEventClick,
  onSlotClick,
}: DayViewProps) {
  const dateStr = formatDate(date);
  const dayEvents = getEventsForDate(events, dateStr);

  const isToday = formatDate(new Date()) === dateStr;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-purple-100 px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-3xl font-bold ${
              isToday
                ? "bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                : "text-gray-800"
            }`}
          >
            {date.getDate()}
          </span>
          <div className="text-sm text-gray-500">
            <div className="font-medium">
              {date.toLocaleDateString("en-US", { weekday: "long" })}
            </div>
            <div>
              {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
            </div>
          </div>
          {isToday && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
              Today
            </span>
          )}
        </div>
      </div>

      <div className="px-2 sm:px-4 relative">
        {HOURS.map((hour) => {
          const hourStr = String(hour).padStart(2, "0");

          return (
            <TimeSlot
              key={hour}
              id={`${dateStr}-${hourStr}`}
              hour={hour}
              onClick={() => onSlotClick(dateStr, `${hourStr}:00`)}
            />
          );
        })}
        {/* Render events as absolutely positioned blocks spanning their full duration */}
        <div className="absolute inset-0 pointer-events-none" style={{ marginLeft: "5rem" }}>
          {(() => {
            const SLOT_HEIGHT = 60;
            // Calculate overlap columns for each event
            const positioned = dayEvents.map((event) => {
              const [startH, startM] = event.startTime.split(":").map(Number);
              const [endH, endM] = event.endTime.split(":").map(Number);
              const startMin = startH * 60 + startM;
              const endMin = endH * 60 + endM;
              return { event, startMin, endMin, col: 0, totalCols: 1 };
            });
            // Assign columns to overlapping events
            for (let i = 0; i < positioned.length; i++) {
              const overlapping = positioned.filter(
                (p, j) => j < i && p.startMin < positioned[i].endMin && p.endMin > positioned[i].startMin
              );
              const usedCols = new Set(overlapping.map((p) => p.col));
              let col = 0;
              while (usedCols.has(col)) col++;
              positioned[i].col = col;
            }
            // Calculate total columns per overlap group
            for (let i = 0; i < positioned.length; i++) {
              const group = positioned.filter(
                (p) => p.startMin < positioned[i].endMin && p.endMin > positioned[i].startMin
              );
              const maxCol = Math.max(...group.map((p) => p.col)) + 1;
              group.forEach((p) => (p.totalCols = Math.max(p.totalCols, maxCol)));
            }

            return positioned.map(({ event, startMin, endMin, col, totalCols }) => {
              const top = (startMin / 60) * SLOT_HEIGHT;
              const height = Math.max(30, ((endMin - startMin) / 60) * SLOT_HEIGHT);
              const width = `calc((100% - 8px) / ${totalCols})`;
              const left = `calc(4px + ${col} * (100% - 8px) / ${totalCols})`;

              return (
                <div
                  key={event.id}
                  className="absolute pointer-events-auto"
                  style={{ top: `${top}px`, height: `${height}px`, width, left }}
                >
                  <EventCard event={event} onClick={onEventClick} />
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
