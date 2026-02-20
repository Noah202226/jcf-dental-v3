"use client";

import { useEffect } from "react";
import Features from "./components/landing/Features";
import Hero from "./components/landing/Hero";

import { useAuthStore } from "./stores/authStore";
import DashboardPage from "./components/Dashboard";

export default function HomePage() {
  const { getCurrentUser, current, loading } = useAuthStore((state) => state);

  // Fetch user on mount
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 z-50">
        <div className="relative flex items-center justify-center mb-4">
          {/* The Ping Animation Circle */}
          <span className="animate-ping absolute h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 opacity-75"></span>
          {/* Static Inner Circle */}
          <div className="relative rounded-full h-4 w-4 bg-zinc-900 dark:bg-white"></div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 animate-pulse">
            System Initialization
          </p>
          <p className="text-xs font-medium text-zinc-500">Please wait...</p>
        </div>
      </div>
    );
  }

  // If logged in → show dashboard
  if (current) {
    return <DashboardPage user={current} />;
  }

  // Else → show landing page
  return (
    <>
      <Hero />
    </>
  );
}
