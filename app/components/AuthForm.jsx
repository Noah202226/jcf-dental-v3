"use client";

import { useState } from "react";
import { Mail, Lock, Loader2, ArrowRight, User } from "lucide-react";

export default function AuthForm({ handleSubmit, submitType, onToggle }) {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await handleSubmit(e);
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSignUp = submitType === "Sign Up" || submitType === "Create Account";

  // Reusable Input Component to keep the code clean
  const FormInput = ({ icon: Icon, label, ...props }) => (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-[0.15em] ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
        </div>
        <input
          {...props}
          className="block w-full pl-11 pr-4 py-4 bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 text-sm rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-all outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 font-medium">
            {isSignUp
              ? "Join us for a better dental experience."
              : "Enter your credentials to continue."}
          </p>
        </div>

        {/* Full Name Field - Only shows on Sign Up */}
        {isSignUp && (
          <FormInput
            icon={User}
            label="Full Name"
            type="text"
            name="name"
            required={isSignUp}
            placeholder="John Doe"
          />
        )}

        {/* Email Field */}
        <FormInput
          icon={Mail}
          label="Email Address"
          type="email"
          name="email"
          required
          placeholder="name@example.com"
        />

        {/* Password Field */}
        <FormInput
          icon={Lock}
          label="Password"
          type="password"
          name="password"
          required
          placeholder="••••••••"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="relative w-full flex items-center justify-center gap-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-emerald-600/20 dark:shadow-emerald-500/10 transition-all active:scale-[0.97] group overflow-hidden mt-2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span className="relative z-10">{submitType}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
        </button>

        {/* Toggle Logic */}
        <div className="pt-2 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            {isSignUp ? "Already have an account?" : "New patient?"}{" "}
            <button
              type="button"
              onClick={onToggle}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline underline-offset-4 transition-colors"
              disabled={loading}
            >
              {isSignUp ? "Log In" : "Sign Up Now"}
            </button>
          </p>
        </div>
      </form>

      {/* CSS for the shimmer animation if not already in tailwind.config.js */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
