"use client";

import { User } from "firebase/auth";
import { ViewMode } from "../lib/types";
import { formatDate } from "../lib/storage";
import AuthButton from "./AuthButton";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onDateChange: (date: Date) => void;
  onAddEvent: () => void;
  onShare: () => void;
  user?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export default function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onDateChange,
  onAddEvent,
  onShare,
  user,
  onSignIn,
  onSignOut,
}: CalendarHeaderProps) {
  const goToday = () => onDateChange(new Date());

  const goPrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - (viewMode === "week" ? 7 : 1));
    onDateChange(d);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (viewMode === "week" ? 7 : 1));
    onDateChange(d);
  };

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const dayLabel = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="flex flex-col gap-2 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-30">
      {/* Row 1: Logo + nav + date label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Bloomi
          </h1>
          <span className="text-lg sm:text-xl">📅</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={goPrev}
            className="p-2.5 rounded-xl hover:bg-purple-50 text-purple-600 transition-colors"
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm font-medium rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
          >
            Today
          </button>

          <button
            onClick={goNext}
            className="p-2.5 rounded-xl hover:bg-purple-50 text-purple-600 transition-colors"
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="ml-1 sm:ml-2 text-sm font-medium text-gray-700">
            {viewMode === "day" ? dayLabel : monthYear}
          </div>
        </div>

        {/* Auth on larger screens inline with row 1 */}
        <div className="hidden sm:block">
          {onSignIn && onSignOut && (
            <AuthButton user={user ?? null} onSignIn={onSignIn} onSignOut={onSignOut} />
          )}
        </div>
        {/* Spacer on mobile so row 1 stays balanced */}
        <div className="sm:hidden w-8" />
      </div>

      {/* Row 2: View toggle + actions + auth (mobile) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-purple-50 rounded-xl p-1">
          <button
            onClick={() => onViewModeChange("day")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              viewMode === "day"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-purple-500 hover:text-purple-700"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => onViewModeChange("week")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              viewMode === "week"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-purple-500 hover:text-purple-700"
            }`}
          >
            Week
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddEvent}
            className="px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all"
          >
            + New
          </button>

          <button
            onClick={onShare}
            className="px-3 py-2 text-sm font-medium rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
          >
            Share
          </button>

          {/* Date picker — hidden on mobile */}
          <input
            type="date"
            value={formatDate(currentDate)}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split("-").map(Number);
                onDateChange(new Date(y, m - 1, d));
              }
            }}
            className="hidden sm:block px-2 py-1.5 text-sm rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
          />

          {/* Auth on mobile */}
          <div className="sm:hidden">
            {onSignIn && onSignOut && (
              <AuthButton user={user ?? null} onSignIn={onSignIn} onSignOut={onSignOut} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
