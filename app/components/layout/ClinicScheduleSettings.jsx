"use client";

import React, { useState, useEffect } from "react";
import { databases, ID } from "@/app/lib/appwrite";
import { Query } from "appwrite";
import { notify } from "@/app/lib/notify"; // Use your combined sound+toast utility
import {
  Trash2,
  Plus,
  Calendar as CalIcon,
  Edit3,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import clsx from "clsx";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID;
const SCHEDULE_COLLECTION_ID = "clinic_schedules";

const DEFAULT_WEEK_CONFIG = {
  Monday: { open: "09:00", close: "17:00", active: true },
  Tuesday: { open: "09:00", close: "17:00", active: true },
  Wednesday: { open: "09:00", close: "17:00", active: true },
  Thursday: { open: "09:00", close: "17:00", active: true },
  Friday: { open: "09:00", close: "17:00", active: true },
  Saturday: { open: "09:00", close: "12:00", active: true },
  Sunday: { open: "00:00", close: "00:00", active: false },
};

export default function ClinicScheduleSettings() {
  const [schedules, setSchedules] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newName, setNewName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentConfig, setCurrentConfig] = useState(DEFAULT_WEEK_CONFIG);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        SCHEDULE_COLLECTION_ID,
        [Query.orderDesc("priority")],
      );
      setSchedules(res.documents);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setNewName("");
    setStartDate("");
    setEndDate("");
    setCurrentConfig(DEFAULT_WEEK_CONFIG);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (sch) => {
    setEditingId(sch.$id);
    setNewName(sch.name);
    setStartDate(new Date(sch.startDate).toISOString().split("T")[0]);
    setEndDate(new Date(sch.endDate).toISOString().split("T")[0]);
    setCurrentConfig(JSON.parse(sch.config));
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!newName || !startDate || !endDate) {
      return notify.error("Please fill in all date fields");
    }

    const payload = {
      name: newName,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      config: JSON.stringify(currentConfig),
      priority: 10,
    };

    try {
      if (editingId) {
        await databases.updateDocument(
          DATABASE_ID,
          SCHEDULE_COLLECTION_ID,
          editingId,
          payload,
        );
        notify.success("Schedule successfully updated");
      } else {
        await databases.createDocument(
          DATABASE_ID,
          SCHEDULE_COLLECTION_ID,
          ID.unique(),
          payload,
        );
        notify.success("New schedule range activated");
      }
      resetForm();
      fetchSchedules();
    } catch (e) {
      notify.error(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Permanently remove this schedule?")) {
      try {
        await databases.deleteDocument(DATABASE_ID, SCHEDULE_COLLECTION_ID, id);
        notify.success("Schedule removed");
        fetchSchedules();
      } catch (error) {
        notify.error("Deletion failed");
      }
    }
  };

  const updateDay = (day, field, value) => {
    setCurrentConfig((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  return (
    <div className="max-w-9xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-3 uppercase tracking-tighter">
            <CalIcon className="text-emerald-500" size={28} /> Operating Hours
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-1">
            Manage seasonal clinic availability and shifts.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            <Plus size={18} /> New Range
          </button>
        )}
      </div>

      {/* List Mode */}
      {!isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((sch) => (
            <div
              key={sch.$id}
              className="group p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] hover:border-emerald-500/40 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">
                    Active Range
                  </div>
                  <h3 className="font-black text-lg text-zinc-800 dark:text-zinc-200 tracking-tight leading-none mb-2">
                    {sch.name}
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-tighter">
                    <span>{new Date(sch.startDate).toLocaleDateString()}</span>
                    <span className="text-emerald-500">→</span>
                    <span>{new Date(sch.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(sch)}
                    className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(sch.$id)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {schedules.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
              <p className="text-zinc-400 font-bold italic">
                No schedules configured yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={resetForm}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-black text-xs uppercase tracking-widest mb-8"
          >
            <ArrowLeft size={16} /> Back to list
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Configuration Name
              </label>
              <input
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                placeholder="e.g. Regular Season"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Valid From
              </label>
              <input
                type="date"
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl font-bold outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Valid Until
              </label>
              <input
                type="date"
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl font-bold outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-[2rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
              <Clock size={14} /> Weekly Shift Configuration
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {Object.keys(DEFAULT_WEEK_CONFIG).map((day) => (
                <div
                  key={day}
                  className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <div className="w-28 font-black text-zinc-900 dark:text-zinc-100 uppercase text-xs tracking-widest">
                      {day}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateDay(day, "active", !currentConfig[day].active)
                      }
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all",
                        currentConfig[day].active
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400",
                      )}
                    >
                      {currentConfig[day].active ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {currentConfig[day].active ? "Open" : "Closed"}
                    </button>
                  </div>

                  {currentConfig[day].active && (
                    <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                        <input
                          type="time"
                          className="bg-transparent text-sm font-black outline-none"
                          value={currentConfig[day].open}
                          onChange={(e) =>
                            updateDay(day, "open", e.target.value)
                          }
                        />
                      </div>
                      <span className="text-zinc-300 font-bold">to</span>
                      <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                        <input
                          type="time"
                          className="bg-transparent text-sm font-black outline-none"
                          value={currentConfig[day].close}
                          onChange={(e) =>
                            updateDay(day, "close", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-10">
            <button
              onClick={handleSave}
              className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              {editingId ? "Update Schedule" : "Confirm Schedule"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
