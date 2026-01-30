"use client";

import { useAuth } from "@/_wip/auth/auth.context";

export default function AuthStatus() {
  const { user, login, logout } = useAuth();

  if (!user) {
    return (
      <button
        onClick={login}
        className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black"
      >
        Login to review
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-neutral-300">
        Logged in as {user.name}
      </span>

      <button
        onClick={logout}
        className="text-red-400 underline"
      >
        Logout
      </button>
    </div>
  );
}
