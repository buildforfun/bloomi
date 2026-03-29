"use client";

import { User } from "firebase/auth";
import { useState } from "react";

interface AuthButtonProps {
  user: User | null;
  onSignIn: () => void | Promise<void>;
  onSignOut: () => void | Promise<void>;
}

export default function AuthButton({ user, onSignIn, onSignOut }: AuthButtonProps) {
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      await onSignIn();
    } finally {
      setSigningIn(false);
    }
  };

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={signingIn}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm transition-colors ${
          signingIn ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        {signingIn ? "Signing in..." : "Sign in"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.photoURL ? (
        <div
          className="w-7 h-7 rounded-full border border-purple-200 bg-cover bg-center flex-shrink-0 cursor-default"
          style={{ backgroundImage: `url(${user.photoURL})` }}
          title={`${user.displayName || "User"}\n${user.email || ""}`}
        />
      ) : (
        <div
          className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0 cursor-default"
          title={`${user.displayName || "User"}\n${user.email || ""}`}
        >
          {user.displayName?.charAt(0) || "?"}
        </div>
      )}
      <span className="text-sm font-medium text-gray-700 hidden sm:inline max-w-[100px] truncate">
        {user.displayName?.split(" ")[0] || "User"}
      </span>
      <button
        onClick={onSignOut}
        className="text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
