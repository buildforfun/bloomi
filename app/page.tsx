"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CalendarEvent, ViewMode } from "./lib/types";
import { getEvents, saveEvents, formatDate } from "./lib/storage";
import CalendarHeader from "./components/CalendarHeader";
import DayView from "./components/DayView";
import WeekView from "./components/WeekView";
import EventModal from "./components/EventModal";

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [defaultTime, setDefaultTime] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEvents(getEvents());
  }, []);

  const persistEvents = useCallback((updated: CalendarEvent[]) => {
    setEvents(updated);
    saveEvents(updated);
  }, []);

  const handleSaveEvent = useCallback(
    (event: CalendarEvent) => {
      const existing = events.findIndex((e) => e.id === event.id);
      let updated: CalendarEvent[];
      if (existing >= 0) {
        updated = [...events];
        updated[existing] = event;
      } else {
        updated = [...events, event];
      }
      persistEvents(updated);
    },
    [events, persistEvents]
  );

  const handleDeleteEvent = useCallback(
    (id: string) => {
      persistEvents(events.filter((e) => e.id !== id));
    },
    [events, persistEvents]
  );

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setDefaultDate(undefined);
    setDefaultTime(undefined);
    setModalOpen(true);
  }, []);

  const handleSlotClick = useCallback((date: string, time: string) => {
    setEditingEvent(null);
    setDefaultDate(date);
    setDefaultTime(time);
    setModalOpen(true);
  }, []);

  const handleAddEvent = useCallback(() => {
    setEditingEvent(null);
    setDefaultDate(formatDate(currentDate));
    setDefaultTime("09:00");
    setModalOpen(true);
  }, [currentDate]);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const draggedEvent = active.data.current?.event as CalendarEvent;
      if (!draggedEvent) return;

      // Parse drop target: "YYYY-MM-DD-HH"
      const overId = String(over.id);
      const parts = overId.split("-");
      if (parts.length < 4) return;

      const newDate = parts.slice(0, 3).join("-");
      const newHour = parts[3];

      // Calculate duration to preserve it
      const [oldStartH, oldStartM] = draggedEvent.startTime.split(":").map(Number);
      const [oldEndH, oldEndM] = draggedEvent.endTime.split(":").map(Number);
      const durationMin = (oldEndH * 60 + oldEndM) - (oldStartH * 60 + oldStartM);

      const newStartH = parseInt(newHour);
      const newStartTotalMin = newStartH * 60 + oldStartM;
      const newEndTotalMin = newStartTotalMin + durationMin;

      // If event would extend past midnight, cap end at 23:59 and shorten rather than corrupt
      if (newEndTotalMin > 24 * 60) {
        // Don't allow the drop — event doesn't fit in the day
        if (newStartTotalMin >= 23 * 60 + 30) return; // too late to fit anything meaningful
        const cappedEndH = 23;
        const cappedEndM = 59;
        const updated = events.map((e) =>
          e.id === draggedEvent.id
            ? {
                ...e,
                date: newDate,
                startTime: `${String(newStartH).padStart(2, "0")}:${String(oldStartM).padStart(2, "0")}`,
                endTime: `${String(cappedEndH).padStart(2, "0")}:${String(cappedEndM).padStart(2, "0")}`,
              }
            : e
        );
        persistEvents(updated);
        return;
      }

      const newEndH = Math.floor(newEndTotalMin / 60);
      const newEndM = newEndTotalMin % 60;

      const updated = events.map((e) =>
        e.id === draggedEvent.id
          ? {
              ...e,
              date: newDate,
              startTime: `${String(newStartH).padStart(2, "0")}:${String(oldStartM).padStart(2, "0")}`,
              endTime: `${String(newEndH).padStart(2, "0")}:${String(newEndM).padStart(2, "0")}`,
            }
          : e
      );
      persistEvents(updated);
    },
    [events, persistEvents]
  );

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          Loading Bloomi...
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onDateChange={setCurrentDate}
          onAddEvent={handleAddEvent}
        />

        {viewMode === "day" ? (
          <DayView
            date={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
          />
        ) : (
          <WeekView
            date={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
          />
        )}

        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={editingEvent}
          defaultDate={defaultDate}
          defaultTime={defaultTime}
        />
      </div>
    </DndContext>
  );
}
