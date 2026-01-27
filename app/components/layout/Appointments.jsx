"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  Loader2,
  Plus,
  CheckCircle,
  XCircle,
  Stethoscope,
  Trash2,
  User,
  Mail,
  X,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { databases, client, ID } from "@/app/lib/appwrite";
import { Query } from "appwrite";
import clsx from "clsx";
import { notify } from "@/app/lib/notify";
import { Toaster } from "react-hot-toast";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID;
const COLLECTION_ID = "appointments";

export default function AppointmentManager() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("Pending");
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    email: "",
    date: "",
    notes: "",
    status: "pending",
  });

  const [rescheduleEvent, setRescheduleEvent] = useState(null);
  const [newDateValue, setNewDateValue] = useState("");

  const fetchDocs = useCallback(async () => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.orderAsc("date"),
      ]);
      setEvents(res.documents.map((d) => ({ ...d, date: new Date(d.date) })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    const unsub = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`,
      fetchDocs,
    );
    return () => unsub();
  }, [fetchDocs]);

  const statusCounts = useMemo(
    () => ({
      Pending: events.filter((e) => e.status === "pending").length,
      Confirmed: events.filter((e) => e.status === "confirmed").length,
      Declined: events.filter((e) => e.status === "cancelled").length,
      All: events.length,
    }),
    [events],
  );

  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (viewMode === "Pending")
      list = events.filter((e) => e.status === "pending");
    if (viewMode === "Confirmed")
      list = events.filter((e) => e.status === "confirmed");
    if (viewMode === "Declined")
      list = events.filter((e) => e.status === "cancelled");
    return list.sort((a, b) => a.date - b.date);
  }, [events, viewMode]);

  const handleUpdateStatus = async (event, status, notes) => {
    // --- OPTIMISTIC UPDATE START ---
    // We update the local state immediately so the patient moves to the new list
    setEvents((prev) =>
      prev.map((e) => (e.$id === event.$id ? { ...e, status: status } : e)),
    );
    // --- OPTIMISTIC UPDATE END ---

    try {
      const eventDate = new Date(event.date);
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, event.$id, {
        status,
        dateKey: eventDate.toISOString().split("T")[0],
        time: eventDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        name: event.title,
      });

      // Using your custom notify function path
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: event.email,
          status,
          patientName: event.title,
          date: eventDate.toLocaleString(),
          notes: notes || event.notes || "No additional notes.",
        }),
      });

      notify.success(`Status updated to ${status}`);
    } catch (e) {
      // ROLLBACK: If the DB update fails, put the event back to its original status
      setEvents((prev) =>
        prev.map((e) =>
          e.$id === event.$id ? { ...e, status: event.status } : e,
        ),
      );
      notify.error(e.message);
    }
  };

  const handleSave = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.email)
      return notify.error("Missing required fields");
    setIsSaving(true);
    try {
      const selectedDate = new Date(newEvent.date);
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        title: newEvent.title,
        name: newEvent.title,
        email: newEvent.email,
        date: selectedDate.toISOString(),
        dateKey: selectedDate.toISOString().split("T")[0],
        time: selectedDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        referralSource: "Clinic Entry",
        notes: newEvent.notes || "",
        status: newEvent.status,
      });
      notify.success("Patient record created");
      setShowModal(false);
      setNewEvent({
        title: "",
        email: "",
        date: "",
        notes: "",
        status: "pending",
      });
    } catch (e) {
      notify.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReappointSave = async () => {
    // 1. Validation
    if (!newDateValue)
      return notify.error("Please select a new date and time.");

    // Optimistic Update
    const originalEvent = { ...rescheduleEvent };
    setEvents((prev) =>
      prev.map((e) =>
        e.$id === rescheduleEvent.$id
          ? { ...e, status: "pending", date: selectedDate }
          : e,
      ),
    );

    try {
      const selectedDate = new Date(newDateValue);

      // 2. Prepare Appwrite attributes (matching your schema)
      const dateKey = selectedDate.toISOString().split("T")[0];
      const time = selectedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // 3. Update Document
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        rescheduleEvent.$id,
        {
          status: "pending", // Reset to pending so you can review it
          date: selectedDate.toISOString(),
          dateKey: dateKey,
          time: time,
        },
      );

      // 4. Send Email Notification via your notify route
      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: rescheduleEvent.email,
            patientName: rescheduleEvent.title,
            date: selectedDate.toLocaleString([], {
              dateStyle: "full",
              timeStyle: "short",
            }),
            status: "Rescheduled (Pending Review)",
            notes: rescheduleEvent.notes,
          }),
        });
      } catch (emailError) {
        console.error("Email failed to send, but DB updated:", emailError);
        // We don't stop the flow here because the database update was successful
      }

      // 5. Success UI Feedback
      notify.success("Patient rescheduled. Notification sent.");

      // 6. Reset State
      setRescheduleEvent(null);
      setNewDateValue("");
      fetchDocs(); // Refresh the list
    } catch (e) {
      notify.error(`Update failed: ${e.message}`);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
          <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Synchronizing...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 transition-colors duration-300">
      {/* Header */}
      <div className="max-w-9xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <Stethoscope size={24} />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Appointments
            </h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium ml-1">
            Manage patient schedules and clinic queue.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 group"
        >
          <Plus
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />
          <span className="uppercase tracking-widest text-xs">Add Patient</span>
        </button>
      </div>

      <div className="max-w-9xl mx-auto space-y-8">
        {/* Custom Tabs */}
        <div className="flex p-1 bg-zinc-200/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-[1.5rem] w-fit border border-zinc-200 dark:border-zinc-800">
          {["Pending", "Confirmed", "Declined", "All"].map((tab) => (
            <button
              key={tab}
              onClick={() => setViewMode(tab)}
              className={clsx(
                "px-6 py-2.5 rounded-[1.2rem] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3",
                viewMode === tab
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
              )}
            >
              {tab}
              <span
                className={clsx(
                  "px-2 py-0.5 rounded-md text-[10px]",
                  viewMode === tab
                    ? "bg-emerald-100 dark:bg-emerald-500/10"
                    : "bg-zinc-200 dark:bg-zinc-800",
                )}
              >
                {statusCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Appointment Grid */}
        <div className="grid gap-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.$id}
                className="group bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-emerald-500/30 transition-all shadow-sm"
              >
                <div className="flex items-start gap-5">
                  <div className="relative">
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-400 group-hover:text-emerald-500 transition-colors">
                      <User size={24} />
                    </div>
                    <div
                      className={clsx(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900",
                        event.status === "confirmed"
                          ? "bg-emerald-500"
                          : event.status === "pending"
                            ? "bg-amber-500"
                            : "bg-red-500",
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xl tracking-tight">
                      {event.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                        <Mail size={14} className="opacity-50" /> {event.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Clock size={14} />{" "}
                        {event.date.toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    {event.notes && (
                      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 italic">
                        "{event.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-800">
                  {event.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(event, "confirmed", event.notes)
                        }
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(event, "cancelled", event.notes)
                        }
                        className="px-4 py-2 text-zinc-400 hover:text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {(event.status === "confirmed" ||
                    event.status === "cancelled") && (
                    <button
                      onClick={() => setDeleteId(event.$id)}
                      className="p-3 text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}

                  {event.status === "cancelled" && (
                    <button
                      onClick={() => setRescheduleEvent(event)}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:opacity-90"
                    >
                      <Calendar size={14} /> Re-appoint
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
              <div className="bg-zinc-100 dark:bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                <Calendar size={32} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No appointments found
              </h3>
              <p className="text-zinc-500 text-sm">
                There are no records in the "{viewMode}" category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add Patient */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="p-8 pb-0 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  New Clinic Entry
                </h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                  Manual Schedule System
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl focus:border-emerald-500 outline-none transition-all dark:text-white"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl focus:border-emerald-500 outline-none transition-all dark:text-white"
                  value={newEvent.email}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, email: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl focus:border-emerald-500 outline-none text-xs dark:text-white"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    Status
                  </label>
                  <select
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl outline-none focus:border-emerald-500 text-xs dark:text-white"
                    value={newEvent.status}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, status: e.target.value })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                  Visit Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl focus:border-emerald-500 outline-none resize-none dark:text-white"
                  value={newEvent.notes}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, notes: e.target.value })
                  }
                />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? "Processing..." : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reschedule */}
      {rescheduleEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] p-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Calendar size={20} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Reschedule Patient
              </h3>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 font-medium leading-relaxed">
              You are suggesting a new appointment time for{" "}
              <span className="text-emerald-500 font-bold">
                {rescheduleEvent.title}
              </span>
              . This will reset their status to{" "}
              <span className="italic font-semibold">pending</span>.
            </p>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1 tracking-widest">
                  Proposed Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 ring-emerald-500/20 focus:border-emerald-500 outline-none dark:text-white transition-all"
                  value={newDateValue}
                  onChange={(e) => setNewDateValue(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRescheduleEvent(null);
                    setNewDateValue("");
                  }}
                  className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReappointSave} // This calls the logic we restored
                  disabled={!newDateValue}
                  className="flex-1 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-red-100 dark:border-red-900/20 shadow-2xl max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Delete Record?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
              This patient record will be permanently removed from the database.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all active:scale-95"
                onClick={async () => {
                  await databases.deleteDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    deleteId,
                  );
                  notify.success("Record deleted");
                  setDeleteId(null);
                  fetchDocs();
                }}
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}
