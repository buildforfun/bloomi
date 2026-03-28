"use client";

import { useDroppable } from "@dnd-kit/core";

interface TimeSlotProps {
  id: string;
  hour: number;
  children?: React.ReactNode;
  onClick?: () => void;
  showLabel?: boolean;
}

export default function TimeSlot({
  id,
  hour,
  children,
  onClick,
  showLabel = true,
}: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const label =
    hour === 0
      ? "12 AM"
      : hour < 12
      ? `${hour} AM`
      : hour === 12
      ? "12 PM"
      : `${hour - 12} PM`;

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`min-h-[60px] border-b border-purple-50 flex transition-colors ${
        isOver ? "bg-purple-50" : "hover:bg-gray-50/50"
      }`}
    >
      {showLabel && (
        <div className="w-16 sm:w-20 flex-shrink-0 text-xs text-gray-400 pr-2 pt-1 text-right">
          {label}
        </div>
      )}
      <div className="flex-1 relative py-0.5 space-y-1 cursor-pointer min-w-0">
        {children}
      </div>
    </div>
  );
}
