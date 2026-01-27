"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "../../stores/useNotesStore";
import { useMedicalHistoryStore } from "../../stores/useMedicalHistoryStore";
import { useTreatmentPlanStore } from "../../stores/useTreatmentPlanStore";
import { useDentalChartStore } from "@/app/stores/useDentalChartStore";
import { notify } from "@/app/lib/notify";
import ToothIcon from "./ToothIcon";

const sectionMap = {
  notes: useNotesStore,
  medicalhistory: useMedicalHistoryStore,
  treatmentplans: useTreatmentPlanStore,
  dentalchart: useDentalChartStore,
};

// --- MODERN DENTAL CHART SUB-COMPONENTS ---

const LegendItem = ({ color, label, count }) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-2">
      <div
        className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm group-hover:scale-110 transition-transform`}
      />
      <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">
        {label}
      </span>
    </div>
    <span className="text-xs font-black text-zinc-300 dark:text-zinc-600">
      {count || 0}
    </span>
  </div>
);

const ActionButton = ({ color, label, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex-1`}
  >
    {label}
  </button>
);

export default function SubSectionModal({
  title,
  collectionId,
  patientId,
  onClose,
}) {
  const useStore = sectionMap[collectionId];
  const { items, fetchItems, addItem, deleteItem, updateItem, loading } =
    useStore();

  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);

  // Dental Specific States
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothDetails, setToothDetails] = useState({ note: "" });

  useEffect(() => {
    fetchItems(patientId);
  }, [patientId, fetchItems]);

  useEffect(() => {
    resetForm();
  }, [collectionId]);

  const resetForm = () => {
    setEditingId(null);
    const defaults = {
      medicalhistory: {
        medicalName: "",
        description: "",
        diagnosisDate: "",
        severity: "Low",
        status: "Active",
      },
      treatmentplans: { treatmentNote: "", treatmentDate: "" },
      notes: { name: "", description: "" },
    };
    setForm(defaults[collectionId] || { name: "", description: "" });
  };

  const handleSave = async () => {
    setAdding(true);
    try {
      if (editingId) {
        const {
          $id,
          $collectionId,
          $databaseId,
          $createdAt,
          $updatedAt,
          $permissions,
          ...cleanData
        } = form;

        await updateItem(editingId, cleanData);
        notify.success("Record updated successfully");
      } else {
        await addItem(patientId, form);
        notify.success("New record added");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      notify.error("Failed to save clinical record");
    } finally {
      setAdding(false);
    }
  };

  // --- RENDERING HELPERS ---

  const renderListItems = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-[#DCD1B4] dark:border-zinc-800 p-5 rounded-2xl animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                    <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                  </div>
                  <div className="h-5 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                  <div className="h-12 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-100 dark:border-zinc-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.$id}
              className="bg-white dark:bg-zinc-900 border border-[#DCD1B4] dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-emerald-200 dark:hover:border-emerald-500 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {(() => {
                        const dateValue =
                          item.diagnosisDate ||
                          item.treatmentDate ||
                          item.date ||
                          item.$createdAt;
                        if (!dateValue) return "No Date";
                        return new Date(dateValue).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      })()}
                    </span>

                    {collectionId === "medicalhistory" && (
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          item.severity === "High"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                            : item.severity === "Moderate"
                              ? "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
                              : "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                        }`}
                      >
                        {item.severity || "Low"} Severity
                      </span>
                    )}
                  </div>

                  <h4 className="font-black text-zinc-800 dark:text-zinc-100 uppercase text-sm mb-1">
                    {item.medicalName ||
                      item.treatmentNote ||
                      item.name ||
                      "Untitled Record"}
                  </h4>

                  {(item.description || item.note) && (
                    <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                      <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
                        "{item.description || item.note}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-1 ml-4 shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(item.$id);
                      setForm(item);
                    }}
                    className="btn btn-sm btn-circle btn-ghost text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteItem(item.$id)}
                    className="btn btn-sm btn-circle btn-ghost text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2rem]">
            <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest italic">
              No clinical records found
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderFormFields = () => {
    const inputClass =
      "input w-full bg-[#FFF8EA] dark:bg-zinc-900 border-[#DCD1B4] dark:border-zinc-700 rounded-xl font-bold text-zinc-800 dark:text-zinc-100";
    const labelClass =
      "text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-1 block";

    switch (collectionId) {
      case "medicalhistory":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Condition Name</label>
              <input
                type="text"
                className={inputClass}
                value={form.medicalName || ""}
                onChange={(e) =>
                  setForm({ ...form, medicalName: e.target.value })
                }
                placeholder="e.g. Hypertension"
              />
            </div>
            <div>
              <label className={labelClass}>Severity</label>
              <select
                className={inputClass + " select text-xs"}
                value={form.severity || "Low"}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Diagnosis Date</label>
              <input
                type="date"
                className={inputClass + " text-xs"}
                value={form.diagnosisDate || ""}
                onChange={(e) =>
                  setForm({ ...form, diagnosisDate: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Clinical Notes</label>
              <textarea
                className={inputClass + " textarea min-h-[100px]"}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Medications, allergies..."
              />
            </div>
          </div>
        );
      case "treatmentplans":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Treatment Procedure</label>
              <input
                type="text"
                placeholder="e.g. Root Canal"
                className={inputClass}
                value={form.treatmentNote || ""}
                onChange={(e) =>
                  setForm({ ...form, treatmentNote: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Procedure Date</label>
              <input
                type="date"
                className={inputClass + " text-xs"}
                value={form.treatmentDate || ""}
                onChange={(e) =>
                  setForm({ ...form, treatmentDate: e.target.value })
                }
              />
            </div>
          </div>
        );
      case "notes":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Note Subject</label>
              <input
                type="text"
                placeholder="Subject..."
                className={inputClass}
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Observation Details</label>
              <textarea
                className={inputClass + " textarea min-h-[150px]"}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <dialog open className="modal modal-open z-[1000]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="modal-box w-full max-w-6xl max-h-[95vh] lg:max-h-[90vh] bg-[#FBFBFB] dark:bg-zinc-950 rounded-[2rem] lg:rounded-[2.5rem] p-0 overflow-hidden border border-[#DCD1B4] dark:border-zinc-800 shadow-2xl flex flex-col"
      >
        <div className="p-6 lg:p-8 border-b border-[#E6D8BA] dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-xl lg:text-2xl uppercase tracking-tight text-zinc-800 dark:text-zinc-100">
              {title}
            </h3>
            <p className="text-[9px] lg:text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
              Patient Clinical Dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm lg:btn-md btn-circle btn-ghost hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-4 lg:p-8 overflow-y-auto custom-scrollbar flex-1">
          {collectionId === "dentalchart" ? (
            <DentalChartSection
              items={items}
              patientId={patientId}
              selectedTooth={selectedTooth}
              setSelectedTooth={setSelectedTooth}
              toothDetails={toothDetails}
              setToothDetails={setToothDetails}
              loading={loading}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-600 mb-4 tracking-widest">
                  Historical Records
                </h4>
                {renderListItems()}
              </div>
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-[#DCD1B4] dark:border-zinc-800 shadow-sm">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-6 tracking-widest">
                  {editingId ? "Update Existing" : "Create New Entry"}
                </h4>
                {renderFormFields()}
                <button
                  onClick={handleSave}
                  disabled={adding}
                  className="btn w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all"
                >
                  {adding
                    ? "Syncing..."
                    : editingId
                      ? "Save Changes"
                      : "Commit to Record"}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="btn btn-ghost w-full mt-2 text-[10px] font-black uppercase text-zinc-400"
                  >
                    Discard Edits
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </dialog>
  );
}

// --- DENTAL CHART SECTION ---
function DentalChartSection({
  items,
  patientId,
  selectedTooth,
  setSelectedTooth,
  toothDetails,
  setToothDetails,
  loading,
}) {
  const UPPER = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  ];
  const LOWER = [
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
  ];

  const stats = useMemo(() => {
    const counts = {
      caries: 0,
      filled: 0,
      extracted: 0,
      healthy: 32,
      notes: 0,
    };
    if (loading) return counts;
    items?.forEach((i) => {
      if (i.status && i.status !== "healthy") {
        counts[i.status] = (counts[i.status] || 0) + 1;
        counts.healthy--;
      }
      if (i.note) counts.notes++;
    });
    return counts;
  }, [items, loading]);

  const renderToothRow = (numbers) => (
    <div className="grid grid-cols-16 gap-3">
      {numbers.map((num) =>
        loading ? (
          <div
            key={num}
            className="aspect-[2/3] bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg animate-pulse"
          />
        ) : (
          <ToothButton
            key={num}
            num={num}
            items={items}
            selected={selectedTooth === num}
            onClick={() => {
              const found = items?.find(
                (x) => String(x.toothNumber) === String(num),
              );
              setSelectedTooth(num);
              setToothDetails({ note: found?.note || "" });
            }}
          />
        ),
      )}
    </div>
  );

  const updateStatus = async (status) => {
    if (!selectedTooth) return;
    try {
      await useDentalChartStore
        .getState()
        .updateTooth(patientId, selectedTooth, status, toothDetails.note);
      notify.success(`Tooth ${selectedTooth} updated`);
      setSelectedTooth(null);
      setToothDetails({ note: "" });
    } catch (e) {
      notify.error("Update failed");
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-[#DCD1B4] dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-inner overflow-x-auto">
        <div className="min-w-[650px]">
          <div className="text-[10px] font-black uppercase text-zinc-300 dark:text-zinc-600 tracking-widest text-center mb-8 italic">
            Maxillary (Upper)
          </div>
          {renderToothRow(UPPER)}
          <div className="h-px bg-gradient-to-r from-transparent via-[#E6D8BA] dark:via-zinc-800 to-transparent w-full my-4" />
          {renderToothRow(LOWER)}
          <div className="text-[10px] font-black uppercase text-zinc-300 dark:text-zinc-600 tracking-widest text-center mt-8 italic">
            Mandibular (Lower)
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-[#DCD1B4] dark:border-zinc-800 shadow-sm">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
            Live Summary
          </h4>
          <div
            className={`space-y-2 ${loading ? "animate-pulse opacity-50" : ""}`}
          >
            <LegendItem
              color="bg-zinc-100 dark:bg-zinc-800"
              label="Healthy"
              count={stats.healthy}
            />
            <LegendItem
              color="bg-red-500"
              label="Caries"
              count={stats.caries}
            />
            <LegendItem
              color="bg-yellow-500"
              label="Filled"
              count={stats.filled}
            />
            <LegendItem
              color="bg-zinc-900 dark:bg-black"
              label="Extracted"
              count={stats.extracted}
            />
            <div className="pt-2 mt-2 border-t border-dashed border-zinc-100 dark:border-zinc-800">
              <LegendItem
                color="bg-blue-500"
                label="With Notes"
                count={stats.notes}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedTooth ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-[#FFF8EA] dark:bg-zinc-900 p-6 rounded-[2rem] border border-[#DCD1B4] dark:border-zinc-800 shadow-lg"
            >
              <h4 className="font-black text-lg mb-4 text-zinc-800 dark:text-zinc-100">
                Update Tooth {selectedTooth}
              </h4>
              <div className="space-y-4">
                <input
                  type="text"
                  className="input w-full bg-white dark:bg-zinc-800 border-[#DCD1B4] dark:border-zinc-700 rounded-xl font-bold text-xs text-zinc-800 dark:text-zinc-100"
                  placeholder="Findings..."
                  value={toothDetails.note}
                  onChange={(e) =>
                    setToothDetails({ ...toothDetails, note: e.target.value })
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    color="bg-emerald-500"
                    label="Healthy"
                    onClick={() => updateStatus("healthy")}
                  />
                  <ActionButton
                    color="bg-red-500"
                    label="Caries"
                    onClick={() => updateStatus("caries")}
                  />
                  <ActionButton
                    color="bg-yellow-500"
                    label="Filled"
                    onClick={() => updateStatus("filled")}
                  />
                  <ActionButton
                    color="bg-zinc-900 dark:bg-black"
                    label="Extract"
                    onClick={() => updateStatus("extracted")}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] text-center">
              <p className="text-[10px] font-black uppercase text-zinc-300 dark:text-zinc-700 leading-relaxed tracking-widest">
                Select a tooth
                <br />
                to begin charting
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToothButton({ num, items, selected, onClick }) {
  const data = items?.find((x) => String(x.toothNumber) === String(num));
  return (
    <button
      onClick={onClick}
      className={`transition-all duration-300 ${selected ? "scale-125 z-10" : "hover:scale-110 opacity-90 hover:opacity-100"}`}
    >
      <ToothIcon
        status={data?.status || "healthy"}
        hasNote={!!data?.note}
        toothNumber={num}
        isSelected={selected}
      />
    </button>
  );
}
