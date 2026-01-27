"use client";

import { useEffect, useState } from "react";
import { usePersonalizationStore } from "@/app/stores/usePersonalizationStore";
import {
  Loader2,
  Save,
  Layout,
  Building2,
  Fingerprint,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { playSound } from "@/app/lib/sounds";
import { notify } from "@/app/lib/notify";

export default function PersonalizationSettings() {
  const {
    personalization,
    fetchPersonalization,
    savePersonalization,
    loading,
  } = usePersonalizationStore();

  const [form, setForm] = useState({
    businessName: "",
    initial: "",
  });

  // 1. Initial Load from Appwrite
  useEffect(() => {
    fetchPersonalization();
  }, [fetchPersonalization]);

  // 2. Sync Store Data to Local Form State
  useEffect(() => {
    if (personalization) {
      setForm({
        businessName: personalization.businessName || "",
        initial: personalization.initial || "",
      });
    }
  }, [personalization]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await savePersonalization(form);

      // TRIGGER SUCCESS

      notify.success("Brand Assets Synced!");
    } catch (error) {
      // TRIGGER ERROR

      notify.error("Failed to sync with cloud.");
    }
  };

  // Loading State (Initial Fetch)
  if (loading && !personalization) {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-emerald-600 dark:text-emerald-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-black tracking-tight animate-pulse">
          Syncing Brand Assets...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Form Section */}
      <div className="xl:col-span-2 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Sparkles className="text-emerald-500 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              Clinic Identity
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your clinic initials will appear in the top sidebar for brand
              recognition.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Business Name Input */}
            <div className="md:col-span-3 space-y-2 group">
              <label className="flex items-center gap-2 text-[11px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest ml-1 group-focus-within:text-emerald-500 transition-colors">
                <Building2 size={14} /> Business Name
              </label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-bold"
                placeholder="e.g. Alipio Dental Clinic"
                value={form.businessName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    businessName: e.target.value.toUpperCase(),
                  })
                }
                required
              />
            </div>

            {/* Initials Input */}
            <div className="md:col-span-1 space-y-2 group text-center">
              <label className="flex items-center justify-center gap-2 text-[11px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest group-focus-within:text-emerald-500 transition-colors">
                <Fingerprint size={14} /> ID
              </label>
              <input
                type="text"
                maxLength={2}
                className="w-full px-5 py-4 bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-center font-black uppercase"
                placeholder="AD"
                value={form.initial}
                onChange={(e) =>
                  setForm({ ...form, initial: e.target.value.toUpperCase() })
                }
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={clsx(
              "flex items-center justify-center gap-2 font-black px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-70 w-full md:w-auto",
              loading
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-wait"
                : "bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white shadow-emerald-500/20",
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {personalization ? "Update Brand Assets" : "Save Brand Settings"}
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className="xl:col-span-1">
        <div className="relative p-6 bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 transition-colors">
          <p className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-6 tracking-widest text-center">
            Real-time Header Preview
          </p>

          <div className="flex items-center gap-4 p-5 bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl shadow-black/5 dark:shadow-none border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/30">
              {form.initial || "—"}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="h-2 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-2" />
              <p className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-none truncate tracking-tight">
                {form.businessName || "CLINIC NAME"}
              </p>
            </div>
            <Layout className="text-zinc-200 dark:text-zinc-800" size={24} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
              <CheckCircle2 size={12} /> Live Sync Enabled
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed font-medium italic px-4">
              "This is how your identity appears in the navigation sidebar."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
