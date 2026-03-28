"use client";

import { CalendarEvent, getTagColor } from "../lib/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  compact?: boolean;
}

function textColor(bg: string): string {
  const hex = bg.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#374151" : "#ffffff";
}

export default function EventCard({ event, onClick, compact }: EventCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: { event },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const fg = textColor(event.color);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: event.color,
        color: fg,
      }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      className={`rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow border border-white/30 h-full overflow-hidden ${
        compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
      } ${isDragging ? "z-50 shadow-lg ring-2 ring-purple-400" : ""}`}
    >
      <div className="font-semibold truncate">{event.title}</div>
      <div className="opacity-80 text-xs">
        {event.startTime} - {event.endTime}
      </div>
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-0.5">
          {(compact ? event.tags.slice(0, 2) : event.tags).map((tag) => {
            const tagColor = getTagColor(tag);
            return (
              <span
                key={tag}
                className="inline-block px-1.5 py-0 rounded-full font-medium"
                style={{
                  backgroundColor: tagColor.bg,
                  color: tagColor.text,
                  fontSize: compact ? "0.6rem" : "0.65rem",
                  lineHeight: compact ? "1rem" : "1.1rem",
                }}
              >
                {tag}
              </span>
            );
          })}
          {compact && event.tags.length > 2 && (
            <span className="text-xs opacity-60">+{event.tags.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
}
