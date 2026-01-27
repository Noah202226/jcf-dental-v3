"use client";

import React, { useState, useEffect } from "react";
import { databases } from "@/app/lib/appwrite";
import { Query } from "appwrite";
import { notify } from "@/app/lib/notify"; // ✅ Use your custom notify
import {
  FiEdit3,
  FiX,
  FiCheck,
  FiFileText,
  FiCalendar,
  FiPhone,
  FiUser,
  FiBriefcase,
  FiMapPin,
} from "react-icons/fi";

import SubSectionModal from "./SubSectionModal";
import { useNotesStore } from "../../stores/useNotesStore";
import { useMedicalHistoryStore } from "../../stores/useMedicalHistoryStore";
import { useTreatmentPlanStore } from "../../stores/useTreatmentPlanStore";
import { useDentalChartStore } from "../../stores/useDentalChartStore";

import PaymentSectionCard from "./PaymentSectionCard";
import ConsentFormModal from "./ConsentFormModal";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID;
const PATIENTS_COLLECTION_ID = "patients";
const COLLECTION_TRANSACTIONS = "transactions";

export default function ViewPatientDetailsModal({ patient, isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedPatient, setUpdatedPatient] = useState({ ...patient });
  const [saving, setSaving] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  const notes = useNotesStore();
  const medHistory = useMedicalHistoryStore();
  const treatment = useTreatmentPlanStore();
  const dentalChart = useDentalChartStore();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalPaid: 0, totalRemaining: 0 });

  useEffect(() => {
    if (patient?.$id) {
      notes.fetchItems(patient.$id);
      medHistory.fetchItems(patient.$id);
      treatment.fetchItems(patient.$id);
      dentalChart.fetchItems(patient.$id);
      setUpdatedPatient({ ...patient });
      fetchTransactions();
    }
  }, [patient?.$id]);

  if (!patient || !isOpen) return null;

  const sectionsLoading =
    notes.loading || medHistory.loading || treatment.loading;

  const fetchTransactions = async () => {
    if (!patient?.$id) return;
    try {
      setLoading(true);
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_TRANSACTIONS,
        [Query.equal("patientId", patient.$id), Query.orderDesc("$createdAt")],
      );
      const docs = res.documents;
      const totalRemaining = docs.reduce(
        (sum, t) => sum + Number(t.remaining || 0),
        0,
      );
      setTransactions(docs);
      setSummary({ totalRemaining });
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async () => {
    if (!updatedPatient.patientName?.trim()) {
      notify.error("Patient name is required");
      return;
    }
    try {
      setSaving(true);

      const {
        $id,
        $collectionId,
        $databaseId,
        $createdAt,
        $updatedAt,
        $permissions,
        ...cleanData
      } = updatedPatient;

      await databases.updateDocument(
        DATABASE_ID,
        PATIENTS_COLLECTION_ID,
        patient.$id,
        cleanData,
      );
      notify.success("Record updated successfully.");
      setEditMode(false);
    } catch (err) {
      console.log("Error updating patient:", err);
      notify.error("Update failed.", err);
    } finally {
      setSaving(false);
    }
  };

  function calculateAge(birthdate) {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white dark:bg-zinc-950 w-full h-full sm:h-screen sm:max-w-9xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/20 dark:border-zinc-800">
          {/* Header Area */}
          <div className="p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                <FiUser size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight leading-none">
                  {updatedPatient.patientName}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Balance:
                  </span>
                  <span className="text-sm font-black text-red-500">
                    ₱{summary.totalRemaining.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsConsentModalOpen(true)}
                className="flex-1 sm:flex-none p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
              >
                <FiFileText /> <span className="hidden lg:inline">Consent</span>
              </button>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex-1 sm:flex-none p-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest ${editMode ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-emerald-500/10 text-emerald-600"}`}
              >
                {editMode ? (
                  <>
                    <FiX /> Cancel
                  </>
                ) : (
                  <>
                    <FiEdit3 /> Edit Info
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl active:scale-95 transition-all lg:hidden"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar space-y-8">
            {/* Demographic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EditableField
                label="Full Name"
                name="patientName"
                value={updatedPatient.patientName}
                editMode={editMode}
                onChange={setUpdatedPatient}
                icon={<FiUser />}
              />
              <EditableField
                label="Gender"
                name="gender"
                value={updatedPatient.gender}
                editMode={editMode}
                onChange={setUpdatedPatient}
                icon={<FiUser />}
              />
              <EditableField
                label="Contact"
                name="contact"
                value={updatedPatient.contact}
                editMode={editMode}
                onChange={setUpdatedPatient}
                icon={<FiPhone />}
              />
              <EditableField
                label="Birthdate"
                name="birthdate"
                type="date"
                value={updatedPatient.birthdate}
                editMode={editMode}
                onChange={setUpdatedPatient}
                icon={<FiCalendar />}
              />
              <EditableField
                label="Occupation"
                name="occupation"
                value={updatedPatient.occupation}
                editMode={editMode}
                onChange={setUpdatedPatient}
                icon={<FiBriefcase />}
              />
              <EditableField
                label="Address"
                name="address"
                value={updatedPatient.address}
                editMode={editMode}
                onChange={setUpdatedPatient}
                icon={<FiMapPin />}
              />

              <div className="md:col-span-2 lg:col-span-3">
                <EditableField
                  label="Clinical Notes"
                  name="note"
                  type="textarea"
                  value={updatedPatient.note}
                  editMode={editMode}
                  onChange={setUpdatedPatient}
                />
              </div>
            </div>

            {/* Subsection Cards (Modern Glass Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sectionsLoading ? (
                <div className="col-span-full h-40 animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem]" />
              ) : (
                <>
                  <SectionCard
                    title="Dental Chart"
                    description="Visual tooth-by-tooth mapping of conditions and treatments."
                    icon={<FiBriefcase size={20} />}
                    count={dentalChart.items.length}
                    onClick={() =>
                      setActiveSection({
                        title: "Dental Chart",
                        collectionId: "dentalchart",
                      })
                    }
                  />
                  <SectionCard
                    title="Med History"
                    description="Allergies, chronic conditions, and past medical alerts."
                    icon={<FiFileText size={20} />}
                    colorClass="text-blue-500"
                    count={medHistory.items.length}
                    onClick={() =>
                      setActiveSection({
                        title: "Medical History",
                        collectionId: "medicalhistory",
                      })
                    }
                  />
                  <SectionCard
                    title="Clinical Notes"
                    description="Detailed session summaries and observation logs."
                    icon={<FiEdit3 size={20} />}
                    colorClass="text-amber-500"
                    count={notes.items.length}
                    onClick={() =>
                      setActiveSection({
                        title: "Dental Notes",
                        collectionId: "notes",
                      })
                    }
                  />
                  <SectionCard
                    title="Treatment Plan"
                    description="Proposed procedures and future dental goals."
                    icon={<FiCalendar size={20} />}
                    colorClass="text-purple-500"
                    count={treatment.items.length}
                    onClick={() =>
                      setActiveSection({
                        title: "Treatment Plan",
                        collectionId: "treatmentplans",
                      })
                    }
                  />
                  <div className="sm:col-span-2 lg:col-span-4">
                    <PaymentSectionCard patient={patient} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-8 py-3 font-black uppercase text-[10px] tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              Close
            </button>
            {editMode && (
              <button
                onClick={handleUpdatePatient}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3 rounded-xl flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-[10px] uppercase tracking-widest disabled:opacity-50"
              >
                {saving ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <FiCheck /> Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub Modals */}
      {activeSection && (
        <SubSectionModal
          title={activeSection.title}
          collectionId={activeSection.collectionId}
          patientId={patient.$id}
          onClose={() => setActiveSection(null)}
        />
      )}
      {isConsentModalOpen && (
        <ConsentFormModal
          patient={patient}
          calculateAge={calculateAge}
          onClose={() => setIsConsentModalOpen(false)}
        />
      )}
    </>
  );
}

// Sub-components with Modern Styling
function EditableField({ label, name, value, editMode, onChange, type, icon }) {
  const formattedValue =
    type === "date" && value
      ? new Date(value).toISOString().split("T")[0]
      : value || "";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
        {icon} <span>{label}</span>
      </div>
      {editMode ? (
        type === "textarea" ? (
          <textarea
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:border-emerald-500 outline-none text-sm font-bold transition-all min-h-[100px]"
            value={formattedValue}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, [name]: e.target.value }))
            }
          />
        ) : (
          <input
            type={type || "text"}
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:border-emerald-500 outline-none text-sm font-bold transition-all"
            value={formattedValue}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, [name]: e.target.value }))
            }
          />
        )
      ) : (
        <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tight">
          {type === "date" && value
            ? new Date(value).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : value || "—"}
        </div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  count,
  onClick,
  icon,
  description,
  colorClass = "text-emerald-500",
}) {
  return (
    <div
      onClick={onClick}
      className="relative p-6 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-3xl active:scale-95 transition-all cursor-pointer hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 group overflow-hidden"
    >
      {/* Decorative Background Icon */}
      <div
        className={`absolute -right-2 -bottom-2 opacity-5 dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-500 ${colorClass}`}
      >
        {icon &&
          React.isValidElement(icon) &&
          React.cloneElement(icon, { size: 80 })}
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div
            className={`p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 ${colorClass}`}
          >
            {icon}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
              {count.toString().padStart(2, "0")}
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Entries
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">
            {title}
          </h4>
          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
            Open Section →
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
