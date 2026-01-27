"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  Monitor,
  LogOut,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useAuthStore } from "@/app/stores/authStore";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import clsx from "clsx";

export default function Header() {
  const { current, logout } = useAuthStore((state) => state);
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Real-time Clock Logic
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
    };
  }, []);

  // Shift Logic: Late Night (10 PM - 5 AM)
  const isLateNight = time.getHours() >= 22 || time.getHours() < 5;

  const pathname = usePathname();
  useEffect(() => setLoading(false), [pathname]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500",
        scrolled
          ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800 py-3"
          : "bg-transparent py-6",
      )}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8">
        {/* Left: Logo Section */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-600/20 group-hover:rotate-12 transition-transform">
              D
            </div>
            <div className="hidden lg:block">
              <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white block leading-none">
                DentServe
              </span>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-[0.3em]">
                PRO SYSTEM
              </span>
            </div>
          </Link>

          {/* Center-Left: High-Visibility Data Badge */}
          <div
            className={clsx(
              "hidden md:flex items-center gap-6 px-6 py-3 rounded-[2rem] border transition-all duration-1000",
              isLateNight
                ? "bg-orange-500/10 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                : "bg-zinc-100/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 shadow-sm",
            )}
          >
            {/* BIG CLOCK */}
            <div className="flex items-center gap-3">
              <ClockIcon
                size={20}
                className={isLateNight ? "text-orange-500" : "text-emerald-500"}
              />
              <span
                className={clsx(
                  "font-mono font-black text-2xl tracking-tighter transition-colors duration-1000",
                  isLateNight
                    ? "text-orange-500"
                    : "text-zinc-900 dark:text-zinc-100",
                )}
              >
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>

            <div className="h-6 w-[2px] bg-zinc-300 dark:bg-zinc-700 opacity-50" />

            {/* BIG DATE */}
            <div className="flex items-center gap-3">
              <CalendarIcon size={18} className="text-zinc-400" />
              <span className="text-lg font-bold text-zinc-600 dark:text-zinc-400 tracking-tight">
                {time.toLocaleDateString([], {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* Theme Toggle */}
          <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            {["light", "dark", "system"].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={clsx(
                  "p-2.5 rounded-xl transition-all",
                  theme === t
                    ? "bg-white dark:bg-zinc-800 text-emerald-500 shadow-md shadow-black/5 scale-110"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200",
                )}
              >
                {t === "light" && <Sun size={18} />}
                {t === "dark" && <Moon size={18} />}
                {t === "system" && <Monitor size={18} />}
              </button>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800">
            {current ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-500 leading-none mb-1.5">
                    Authorized
                  </span>
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-none">
                    {current.name || current.email.split("@")[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="group relative w-12 h-12 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-90"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <LogOut
                      size={22}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  )}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
