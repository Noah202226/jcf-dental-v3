"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import AuthForm from "../AuthForm";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/authStore";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Facebook,
  Stethoscope,
  Layers,
  Rocket,
  Moon,
  Sun,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";

export default function Hero() {
  const { login, register, getCurrentUser } = useAuthStore((state) => state);
  const [isSignUp, setIsSignUp] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const user = await login(form.get("email"), form.get("password"));
    // if (user) router.push("/dashboard");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const user = await register(form.get("email"), form.get("password"));
    // if (user) router.push("/dashboard");
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center bg-slate-50 dark:bg-[#09090b] transition-colors duration-500 overflow-hidden">
      {/* 1. Dental Services x ArcTech Tech Bar */}
      <div className="w-full bg-emerald-900 dark:bg-emerald-950/40 backdrop-blur-md text-emerald-50/70 py-3 px-6 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] flex flex-wrap justify-center gap-x-8 gap-y-2 z-20 border-b border-white/5">
        {[
          "Restorative Care",
          "Oral Surgery",
          "Orthodontics",
          "Endodontics",
          "Digital Diagnostics",
        ].map((service) => (
          <span
            key={service}
            className="flex items-center gap-2 hover:text-emerald-400 transition-colors cursor-default"
          >
            <Zap size={12} className="text-emerald-400" />
            {service}
          </span>
        ))}
      </div>

      {/* Theme Switcher */}
      <div className="absolute top-20 right-6 z-50">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 hover:scale-110 transition-all active:scale-95"
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-emerald-500" />
          )}
        </button>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center w-full max-w-7xl px-6 md:px-12 py-12 lg:py-20 z-10 gap-16">
        {/* Left: Branding */}
        <div className="lg:col-span-7 flex flex-col text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center self-center lg:self-start gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold ring-1 ring-emerald-500/20"
          >
            <Activity size={14} className="animate-pulse" />
            Clinic OS Powered by ArcTech Solutions
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-8xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-[0.95] mb-6">
              Precision <br />
              <span className="text-emerald-600 dark:text-emerald-500 italic">
                Dental Systems.
              </span>
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-xl mx-auto lg:mx-0">
              ArcTech-v3 delivers a high-performance patient management
              experience, built with enterprise-grade security for the modern
              dental clinic.
            </p>
          </motion.div>

          {/* Action Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <a
              href="https://appointment-jcf-dental-clinic-v3.vercel.app/"
              target="_blank"
              className="group flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-5 rounded-full text-lg font-bold shadow-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all hover:-translate-y-1"
            >
              <Rocket size={24} />
              Open Portal
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
            <a
              href="https://www.facebook.com/ArcTechSolutions25"
              target="_blank"
              className="flex items-center gap-2 text-zinc-500 hover:text-emerald-500 font-bold transition-colors"
            >
              <Facebook size={20} />
              Developed by ArcTech
            </a>
          </motion.div>

          {/* Feature Grid: Blending Health and Tech */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Stethoscope />,
                label: "Clinic Focus",
                val: "Patient-First UX",
              },
              {
                icon: <ShieldCheck />,
                label: "Data Integrity",
                val: "HIPAA Ready Tech",
              },
            ].map((info, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  {info.icon}
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                    {info.label}
                  </p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {info.val}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          <div className="absolute -inset-20 bg-emerald-500/20 dark:bg-emerald-600/10 blur-[100px] rounded-full" />

          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup" : "login"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/40 dark:border-zinc-800 shadow-2xl"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-emerald-500 rounded-b-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
              <AuthForm
                handleSubmit={isSignUp ? handleRegister : handleLogin}
                submitType={isSignUp ? "Sign Up" : "Log In"}
                onToggle={() => setIsSignUp(!isSignUp)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
