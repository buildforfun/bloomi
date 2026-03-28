"use client";

import { useDroppable } from "@dnd-kit/core";
import { CalendarEvent } from "../lib/types";
import { getEventsForDate, formatDate, getWeekDates } from "../lib/storage";
import EventCard from "./EventCard";

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: string, hour: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeekView({
  date,
  events,
  onEventClick,
  onSlotClick,
}: WeekViewProps) {
  const weekDates = getWeekDates(date);
  const todayStr = formatDate(new Date());

  return (
    <div className="flex-1 overflow-auto">
      {/* Day headers */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-purple-100">
        <div className="flex">
          <div className="w-16 sm:w-20 flex-shrink-0" />
          {weekDates.map((d) => {
            const ds = formatDate(d);
            const isToday = ds === todayStr;
            return (
              <div
                key={ds}
                className={`flex-1 text-center py-2 border-l border-purple-50 min-w-[100px] ${
                  isToday ? "bg-purple-50/50" : ""
                }`}
              >
                <div className="text-xs text-gray-400 uppercase">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`text-lg font-bold ${
                    isToday
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                      : "text-gray-700"
                  }`}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="relative">
        {HOURS.map((hour) => {
          const hourStr = String(hour).padStart(2, "0");
          const label =
            hour === 0
              ? "12 AM"
              : hour < 12
              ? `${hour} AM`
              : hour === 12
              ? "12 PM"
              : `${hour - 12} PM`;

          return (
            <div key={hour} className="flex min-h-[60px] border-b border-purple-50">
              <div className="w-16 sm:w-20 flex-shrink-0 text-xs text-gray-400 pr-2 pt-1 text-right">
                {label}
              </div>
              {weekDates.map((d) => {
                const ds = formatDate(d);
                const isToday = ds === todayStr;

                return (
                  <TimeSlotCell
                    key={`${ds}-${hourStr}`}
                    id={`${ds}-${hourStr}`}
                    isToday={isToday}
                    onClick={() => onSlotClick(ds, `${hourStr}:00`)}
                  />
                );
              })}
            </div>
          );
        })}
        {/* Events rendered as positioned overlays spanning full duration */}
        {weekDates.map((d, dayIndex) => {
          const ds = formatDate(d);
          const dayEvents = getEventsForDate(events, ds);
          const totalDays = weekDates.length;
          const SLOT_HEIGHT = 60;

          // Calculate overlap columns
          const positioned = dayEvents.map((event) => {
            const [startH, startM] = event.startTime.split(":").map(Number);
            const [endH, endM] = event.endTime.split(":").map(Number);
            const startMin = startH * 60 + startM;
            const endMin = endH * 60 + endM;
            return { event, startMin, endMin, col: 0, totalCols: 1 };
          });
          for (let i = 0; i < positioned.length; i++) {
            const overlapping = positioned.filter(
              (p, j) => j < i && p.startMin < positioned[i].endMin && p.endMin > positioned[i].startMin
            );
            const usedCols = new Set(overlapping.map((p) => p.col));
            let col = 0;
            while (usedCols.has(col)) col++;
            positioned[i].col = col;
          }
          for (let i = 0; i < positioned.length; i++) {
            const group = positioned.filter(
              (p) => p.startMin < positioned[i].endMin && p.endMin > positioned[i].startMin
            );
            const maxCol = Math.max(...group.map((p) => p.col)) + 1;
            group.forEach((p) => (p.totalCols = Math.max(p.totalCols, maxCol)));
          }

          return positioned.map(({ event, startMin, endMin, col, totalCols }) => {
            const top = (startMin / 60) * SLOT_HEIGHT;
            const height = Math.max(20, ((endMin - startMin) / 60) * SLOT_HEIGHT);
            const colWidth = `calc((100% - 5rem) / ${totalDays} / ${totalCols} - 4px)`;
            const colLeft = `calc(5rem + ${dayIndex} * (100% - 5rem) / ${totalDays} + ${col} * (100% - 5rem) / ${totalDays} / ${totalCols} + 2px)`;

            return (
              <div
                key={event.id}
                className="absolute pointer-events-auto z-10"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: colLeft,
                  width: colWidth,
                }}
              >
                <EventCard event={event} onClick={onEventClick} compact />
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

function TimeSlotCell({
  id,
  isToday,
  children,
  onClick,
}: {
  id: string;
  isToday: boolean;
  children?: React.ReactNode;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`flex-1 border-l border-purple-50 py-0.5 px-0.5 space-y-0.5 cursor-pointer min-w-[100px] transition-colors ${
        isOver ? "bg-purple-50" : isToday ? "bg-purple-50/30" : "hover:bg-gray-50/50"
      }`}
    >
      {children}
    </div>
  );
}
