"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "../../stores/useNotesStore";
import { useMedicalHistoryStore } from "../../stores/useMedicalHistoryStore";
import { useTreatmentPlanStore } from "../../stores/useTreatmentPlanStore";
import { useDentalChartStore } from "@/app/stores/useDentalChartStore";
import { notify } from "@/app/lib/notify";
import ToothIcon from "./ToothIcon";
import DentalChartSection from "./DentalChartSection";

const sectionMap = {
  notes: useNotesStore,
  medicalhistory: useMedicalHistoryStore,
  treatmentplans: useTreatmentPlanStore,
  dentalchart: useDentalChartStore,
};

// --- MODERN DENTAL CHART SUB-COMPONENTS ---

function LegendItem({ color, label, abbr, count }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 leading-none">
            {label}
          </span>
          {abbr && (
            <span className="text-[8px] text-zinc-400 font-black">{abbr}</span>
          )}
        </div>
      </div>
      <span className="text-[10px] font-black text-zinc-400 group-hover:text-zinc-800 transition-colors">
        {count}
      </span>
    </div>
  );
}

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
  patientName,
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
        conditions: [], // Add this
      },
      treatmentplans: { treatmentNote: "", treatmentDate: "" },
      notes: { name: "", description: "" },
    };
    setForm(defaults[collectionId] || { name: "", description: "" });
  };

  const handleSave = async () => {
    setAdding(true);
    try {
      // Ensure we are sending the conditions array even if it's empty
      const submissionData = {
        ...form,
        conditions: form.conditions || [],
      };

      if (editingId) {
        // Destructure Appwrite metadata to keep the update payload "clean"
        const {
          $id,
          $collectionId,
          $databaseId,
          $createdAt,
          $updatedAt,
          $permissions,
          ...cleanData
        } = submissionData;

        await updateItem(editingId, cleanData);
        notify.success("Record updated successfully");
      } else {
        // For new items, your store spreads the data object automatically
        await addItem(patientId, submissionData);
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

                  {item.conditions && item.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 mt-1">
                      {item.conditions.map((c) => (
                        <span
                          key={c}
                          className="text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg uppercase border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1 shadow-sm"
                        >
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

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
        const commonConditions = [
          // --- Original & High Priority ---
          "High Blood Pressure",
          "Diabetes",
          "Asthma",
          "Heart Disease",
          "Allergies",
          "Bleeding Problems",
          "Seizures",
          "Hepatitis (A, B, C, D)",
          "Pregnancy",

          // --- Column 1: Cardiac & Chronic ---
          "Osteoporosis",
          "Herpes/ Cold sores",
          "Radiation treatments",
          "Chemotherapy",
          "Artificial heart valves",
          "Heart attack",
          "Pacemakers",
          "Angioplasty with stent",
          "Stroke",
          "Angina pectoris",
          "Frequent high fever",
          "Sinusitis",
          "Emphysema",
          "Breathing Problems",

          // --- Column 2: Systemic & Symptoms ---
          "Afternoon fever",
          "Chronic cough",
          "Bloody Sputum",
          "Tuberculosis",
          "Frequent headaches/Dizziness",
          "Visual impairment",
          "Hearing impairment",
          "Arthritis",
          "Pain in joints",
          "Tremors",
          "Swollen ankles",
          "Goiter",
          "Frequent thirst",
          "Frequent hunger",
          "Frequent urination",
          "Sudden weight loss",

          // --- Column 3: Internal & Lifestyle ---
          "Abdominal discomfort",
          "Acidic Reflux",
          "Bleeding/Bruising easily",
          "Recreational Drugs",
          "Steroid therapy",
          "Blood/Pus in urine",
          "Pain upon urination",
          "Kidney/Liver problems",
          "HIV positive",
          "Sexually transmitted Disease",
          "Fainting spells",
          "Depression",
        ];

        const toggleCondition = (condition) => {
          const current = form.conditions || [];
          const updated = current.includes(condition)
            ? current.filter((c) => c !== condition)
            : [...current, condition];
          setForm({ ...form, conditions: updated });
        };

        return (
          <div className="grid grid-cols-2 gap-4">
            {/* Checkbox Grid */}
            <div className="col-span-2 mb-2">
              <label className={labelClass}>Medical Indicators</label>
              {/* Added max-height and scrolling for the long list */}
              {/* {commonConditions.length} */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 bg-[#FFF8EA]/50 dark:bg-zinc-800/30 p-4 rounded-xl border border-[#DCD1B4]/50 dark:border-zinc-800 max-h-[220px] overflow-y-auto custom-scrollbar">
                {commonConditions.map((condition) => (
                  <label
                    key={condition}
                    className="flex items-center gap-2 cursor-pointer group py-0.5"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs rounded-md border-zinc-400 dark:border-zinc-500 checked:bg-emerald-600 checked:border-emerald-600 [--chkfg:white]"
                      checked={(form.conditions || []).includes(condition)}
                      onChange={() => toggleCondition(condition)}
                    />
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-500 transition-colors truncate">
                      {condition}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Primary Condition / Title</label>
              <input
                type="text"
                className={inputClass}
                value={form.medicalName || ""}
                onChange={(e) =>
                  setForm({ ...form, medicalName: e.target.value })
                }
                placeholder="e.g. Chronic Hypertension"
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
              <label className={labelClass}>Detailed Clinical Notes</label>
              <textarea
                className={inputClass + " textarea min-h-[80px] text-xs"}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Specific medications, allergy types, or precautions..."
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
        className="modal-box w-full max-w-[95vw] xl:max-w-[95vw] max-h-[95vh] lg:max-h-[95vh] bg-[#FBFBFB] dark:bg-zinc-950 rounded-[2rem] lg:rounded-[2.5rem] p-0 overflow-hidden border border-[#DCD1B4] dark:border-zinc-800 shadow-2xl flex flex-col"
      >
        <div className="p-4 lg:p-8 border-b border-[#E6D8BA] dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center shrink-0 sticky top-0 z-50">
          <div>
            <h3 className="font-black text-lg lg:text-2xl uppercase tracking-tight text-zinc-800 dark:text-zinc-100">
              {title}
            </h3>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">
              Clinical Dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost hover:bg-red-50 text-zinc-500"
          >
            ✕
          </button>
        </div>

        <div className="p-4 lg:p-8 overflow-y-auto custom-scrollbar flex-1 pb-32 sm:pb-8 ">
          {collectionId === "dentalchart" ? (
            <DentalChartSection
              items={items} // From useStore()
              patientId={patientId}
              loading={loading}
              patientName={patientName}
              // Pass these handlers down
              onUpdateTooth={async (payload) => {
                try {
                  // Prepare data for Appwrite
                  const submissionData = {
                    ...payload,
                    toothNumber: String(payload.toothNumber), // Ensure String
                    surfaces: JSON.stringify(payload.surfaces || {}), // Convert object to String
                    patientId: String(patientId),
                  };

                  if (payload.$id) {
                    // Clean Appwrite metadata before updating
                    const {
                      $id,
                      $collectionId,
                      $databaseId,
                      $createdAt,
                      $updatedAt,
                      $permissions,
                      ...cleanData
                    } = submissionData;
                    await updateItem($id, cleanData);
                    notify.success(`Tooth ${payload.toothNumber} updated`);
                  } else {
                    await addItem(patientId, submissionData);
                    notify.success(`Tooth ${payload.toothNumber} recorded`);
                  }
                } catch (err) {
                  console.error("Save Error:", err);
                  notify.error(err.message || "Failed to save tooth data");
                }
              }}
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
