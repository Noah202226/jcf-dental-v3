"use client";

import { useAuthStore } from "@/app/stores/authStore";
import { usePersonalizationStore } from "@/app/stores/usePersonalizationStore";
import React, { useState, useEffect } from "react";
import {
  FiLogOut,
  FiMenu,
  FiSun,
  FiMoon,
  FiMonitor,
  FiClock,
} from "react-icons/fi";
import { useTheme } from "next-themes";
import clsx from "clsx";

function TopBar() {
  const { current, logout } = useAuthStore();
  const { personalization } = usePersonalizationStore();
  const { theme, setTheme } = useTheme();
  const [now, setNow] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Shift Logic: Late Night (10 PM - 5 AM)
  const isLateNight = now.getHours() >= 22 || now.getHours() < 5;

  // Formatting parts for bigger display
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateString = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="w-full navbar bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 sticky top-0 z-30 transition-all duration-500 py-3">
      {/* Mobile drawer toggle */}
      <div className="flex-none lg:hidden">
        <label
          htmlFor="dashboard-drawer"
          className="btn btn-ghost text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <FiMenu size={22} />
        </label>
      </div>

      {/* Welcome Message */}
      <div className="flex-1">
        <h1 className="text-sm md:text-base font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          Welcome back,
          <span className="text-zinc-900 dark:text-zinc-100 font-black tracking-tight text-lg">
            {current?.email?.split("@")[0]}
          </span>
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex-none flex items-center gap-4 md:gap-8">
        {/* ENHANCED DATA CLOCK */}
        <div
          className={clsx(
            "hidden xl:flex items-center gap-4 px-5 py-2 rounded-2xl border transition-all duration-1000",
            isLateNight
              ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
              : "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50",
          )}
        >
          {/* Time Display */}
          <div className="flex items-center gap-2">
            <FiClock
              className={isLateNight ? "text-amber-500" : "text-emerald-500"}
              size={18}
            />
            <span
              className={clsx(
                "text-xl font-mono font-black tracking-tighter transition-colors duration-1000",
                isLateNight
                  ? "text-amber-500"
                  : "text-zinc-900 dark:text-zinc-100",
              )}
            >
              {timeString}
            </span>
          </div>

          <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700" />

          {/* Date Display */}
          <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">
            {dateString}
          </span>
        </div>

        {/* Theme Switcher */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
          {[
            { id: "light", icon: <FiSun size={16} /> },
            { id: "dark", icon: <FiMoon size={16} /> },
            { id: "system", icon: <FiMonitor size={16} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={clsx(
                "p-2 rounded-lg transition-all duration-300",
                theme === t.id
                  ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm scale-110"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200",
              )}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-3 group cursor-pointer transition-all"
          >
            <div className="flex flex-col items-end md:flex">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                Administrator
              </span>
              <span className="text-sm font-bold dark:text-white">
                Active Now
              </span>
            </div>
            <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black text-base shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform group-hover:rotate-3">
              {personalization?.initial || "A"}
            </div>
          </div>

          <ul
            tabIndex={0}
            className="dropdown-content mt-4 z-[1] p-2 shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-64 animate-in fade-in slide-in-from-top-2"
          >
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Session Active
              </p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {current?.email}
              </p>
            </div>

            <li>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <FiLogOut size={16} /> Logout Session
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
