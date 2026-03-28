"use client";

import { useState, useEffect } from "react";
import { CalendarEvent, EVENT_COLORS } from "../lib/types";
import { generateId, formatDate } from "../lib/storage";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  event?: CalendarEvent | null;
  defaultDate?: string;
  defaultTime?: string;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  defaultDate,
  defaultTime,
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(formatDate(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState(EVENT_COLORS[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(event.date);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setColor(event.color);
      setDescription(event.description || "");
    } else {
      setTitle("");
      setDate(defaultDate || formatDate(new Date()));
      setStartTime(defaultTime || "09:00");
      setEndTime(defaultTime ? `${String(parseInt(defaultTime) + 1).padStart(2, "0")}:00` : "10:00");
      setColor(EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]);
      setDescription("");
    }
    setError("");
    setShowDeleteConfirm(false);
  }, [event, isOpen, defaultDate, defaultTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }
    setError("");
    onSave({
      id: event?.id || generateId(),
      title: title.trim(),
      date,
      startTime,
      endTime,
      color,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {event ? "Edit Event" : "New Event"} ✨
        </h2>

        {error && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's happening?"
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800 placeholder-gray-400"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-purple-500 scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800 placeholder-gray-400 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 shadow-md transition-all"
            >
              {event ? "Save Changes" : "Create Event"}
            </button>
            {event && onDelete && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            )}
            {event && onDelete && showDeleteConfirm && (
              <button
                type="button"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors animate-pulse"
              >
                Confirm Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
