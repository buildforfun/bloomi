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
import { User } from "firebase/auth";
import { CalendarEvent, ViewMode } from "./lib/types";
import { formatDate, generateId } from "./lib/storage";
import { signInWithGoogle, signOutUser, onAuthChange } from "./lib/auth";
import {
  subscribeToEvents,
  saveEventToFirestore,
  deleteEventFromFirestore,
  updateEventInFirestore,
} from "./lib/firestore";
import CalendarHeader from "./components/CalendarHeader";
import DayView from "./components/DayView";
import WeekView from "./components/WeekView";
import EventModal from "./components/EventModal";
import ShareModal from "./components/ShareModal";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [defaultTime, setDefaultTime] = useState<string | undefined>();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Ensure client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for auth state changes — only after mount
  useEffect(() => {
    if (!mounted) return;
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [mounted]);

  // Real-time listener for events from Firestore
  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }
    setEventsLoading(true);
    const unsubscribe = subscribeToEvents(user.uid, (loaded) => {
      setEvents(loaded);
      setEventsLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Bloomi: sign-in failed:", err);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error("Bloomi: sign-out failed:", err);
    }
  }, []);

  const handleSaveEvent = useCallback(
    async (event: CalendarEvent) => {
      if (!user) return;
      const existing = events.findIndex((e) => e.id === event.id);
      let updated: CalendarEvent[];
      if (existing >= 0) {
        updated = [...events];
        updated[existing] = event;
        setEvents(updated);
        await updateEventInFirestore(user.uid, event).catch(console.error);
      } else {
        updated = [...events, event];
        setEvents(updated);
        await saveEventToFirestore(user.uid, event).catch(console.error);
      }
    },
    [events, user]
  );

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      if (!user) return;
      setEvents(events.filter((e) => e.id !== id));
      await deleteEventFromFirestore(user.uid, id).catch(console.error);
    },
    [events, user]
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
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || !user) return;

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

      let updatedEvent: CalendarEvent;

      // If event would extend past midnight, cap end at 23:59
      if (newEndTotalMin > 24 * 60) {
        if (newStartTotalMin >= 23 * 60 + 30) return;
        updatedEvent = {
          ...draggedEvent,
          date: newDate,
          startTime: `${String(newStartH).padStart(2, "0")}:${String(oldStartM).padStart(2, "0")}`,
          endTime: "23:59",
        };
      } else {
        const newEndH = Math.floor(newEndTotalMin / 60);
        const newEndM = newEndTotalMin % 60;
        updatedEvent = {
          ...draggedEvent,
          date: newDate,
          startTime: `${String(newStartH).padStart(2, "0")}:${String(oldStartM).padStart(2, "0")}`,
          endTime: `${String(newEndH).padStart(2, "0")}:${String(newEndM).padStart(2, "0")}`,
        };
      }

      const updated = events.map((e) =>
        e.id === draggedEvent.id ? updatedEvent : e
      );
      setEvents(updated);
      await updateEventInFirestore(user.uid, updatedEvent).catch(console.error);
    },
    [events, user]
  );

  // Loading auth state
  if (!mounted || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          Loading Bloomi...
        </div>
      </div>
    );
  }

  // Not signed in — landing page
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-6">
        <div className="text-center max-w-md">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Bloomi
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-1">📅</p>
          <p className="text-lg text-gray-500 mb-8">
            Your colorful calendar, everywhere.
          </p>

          <button
            onClick={handleSignIn}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-6 text-sm text-gray-400">
            Sync your events across all your devices.
          </p>
        </div>
      </div>
    );
  }

  // Signed in — calendar UI
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onDateChange={setCurrentDate}
          onAddEvent={handleAddEvent}
          onShare={() => setShareModalOpen(true)}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />

        {eventsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Loading events...
            </div>
          </div>
        ) : viewMode === "day" ? (
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

        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          events={events}
        />
      </div>
    </DndContext>
  );
}
