"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarEvent, getTagColor } from "../lib/types";

function SharedEventsContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  let events: CalendarEvent[] = [];
  let error = "";

  if (data) {
    try {
      events = JSON.parse(decodeURIComponent(atob(data)));
    } catch {
      error = "Could not decode the shared events. The link may be invalid or corrupted.";
    }
  } else {
    error = "No event data found in this link.";
  }

  // Group events by date
  const grouped: Record<string, CalendarEvent[]> = {};
  for (const event of events) {
    if (!grouped[event.date]) grouped[event.date] = [];
    grouped[event.date].push(event);
  }
  // Sort dates
  const sortedDates = Object.keys(grouped).sort();
  // Sort events within each date by start time
  for (const date of sortedDates) {
    grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  const formatDateLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Shared Events from Bloomi
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {events.length} event{events.length !== 1 ? "s" : ""} shared
            </p>
          </div>
          <a
            href="/"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md transition-all"
          >
            Open Bloomi
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">
                  {formatDateLabel(date)}
                </h2>
                <div className="space-y-3">
                  {grouped[date].map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl shadow-sm border border-purple-50 p-4 flex gap-4"
                    >
                      <div
                        className="w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800">{event.title}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {event.startTime} - {event.endTime}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {event.tags.map((tag) => {
                              const tagColor = getTagColor(tag);
                              return (
                                <span
                                  key={tag}
                                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                                  style={{ backgroundColor: tagColor.bg, color: tagColor.text }}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SharedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            Loading shared events...
          </div>
        </div>
      }
    >
      <SharedEventsContent />
    </Suspense>
  );
}
