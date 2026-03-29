"use client";

import { useState } from "react";
import { CalendarEvent, getTagColor } from "../lib/types";
import { getAllTags, getEventsByTag } from "../lib/storage";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
}

export default function ShareModal({ isOpen, onClose, events }: ShareModalProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tags = getAllTags(events);

  const generateShareUrl = (tag: string): string => {
    const tagEvents = getEventsByTag(events, tag);
    const encoded = btoa(encodeURIComponent(JSON.stringify(tagEvents)));
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/shared?data=${encoded}`;
  };

  const shareUrl = selectedTag ? generateShareUrl(selectedTag) : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Share Events by Tag
        </h2>

        {tags.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No tags found. Add tags to your events first, then you can share them here.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">
              Select a tag to generate a shareable link with all its events.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => {
                const tagColor = getTagColor(tag);
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setCopied(false);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isSelected ? "ring-2 ring-offset-2 ring-purple-500 scale-105" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: tagColor.bg, color: tagColor.text }}
                  >
                    {tag} ({getEventsByTag(events, tag).length})
                  </button>
                );
              })}
            </div>

            {selectedTag && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Share URL</p>
                  <p className="text-xs text-gray-600 break-all font-mono leading-relaxed max-h-24 overflow-y-auto">
                    {shareUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md"
                  }`}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
