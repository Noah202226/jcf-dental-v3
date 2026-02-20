"use client";

import { useEffect, useState } from "react";
import {
  FiUserPlus,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiLock,
} from "react-icons/fi";
import { notify } from "@/app/lib/notify";
import AddPatientModal from "../helper/AddPatientModal";
import ViewPatientDetailsModal from "../helper/ViewPatientDetailsModal";
import { usePatientStore } from "@/app/stores/usePatientStore";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";

export default function PatientsSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    patient: null,
  });

  const [isInitialFetching, setIsInitialFetching] = useState(true);

  // States for delete authorization
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for visibility toggle
  const REQUIRED_PASSWORD = "ServeWithLove_1Cor1313";

  const { patients, fetchPatients, addPatient, deletePatient } =
    usePatientStore();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { withBalancePatients, getWithBalancePatients, fetchAllPayments } =
    useTransactionsStore();

  useEffect(() => {
    const loadData = async () => {
      setIsInitialFetching(true);
      await Promise.all([
        fetchAllPayments(),
        fetchPatients(),
        getWithBalancePatients(),
      ]);
      setIsInitialFetching(false);
    };

    loadData();
  }, [fetchPatients]); // Note: Ensure fetchPatients is stable or remove from deps if it causes loops

  const handleView = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = (patient) => {
    setConfirmModal({ isOpen: true, patient });
    setDeletePassword("");
    setShowPassword(false); // Ensure it's hidden when opening
  };

  const handleDelete = async () => {
    if (deletePassword !== REQUIRED_PASSWORD) {
      notify.error("Invalid authorization password.");
      return;
    }

    try {
      setDeleteLoading(true);
      await deletePatient(confirmModal.patient.$id);
      notify.success("Patient record purged successfully.");
      setConfirmModal({ isOpen: false, patient: null });
      setDeletePassword("");
      setShowPassword(false);
      fetchPatients();
    } catch (error) {
      notify.error("Failed to delete record.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSavePatient = async (newData) => {
    try {
      setLoading(true);
      await addPatient(newData);
      notify.success("New patient registered.");
      setIsOpen(false);
      fetchPatients();
    } catch (err) {
      notify.error("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-zinc-100 dark:border-zinc-900">
      <td className="py-6 px-8">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      </td>
      <td>
        <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg" />
      </td>
      <td>
        <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg" />
      </td>
      <td className="px-8">
        <div className="flex justify-end gap-3">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-4 lg:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">
            Clinical <span className="text-emerald-500">Records</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1 text-sm lg:text-base">
            Centralized database for patient history and financial balances.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-xs uppercase tracking-widest disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <>
              <FiUserPlus size={18} /> Add New Patient
            </>
          )}
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
            Total Registry
          </p>
          <div className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
            {isInitialFetching ? (
              <div className="h-10 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            ) : (
              patients.length
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-2">
            Pending Balances
          </p>

          <div className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
            {isInitialFetching ? (
              <div className="h-10 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            ) : (
              withBalancePatients.length
            )}
          </div>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] shadow-sm sm:col-span-2 md:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-2">
            Total Receivables
          </p>

          <div className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
            {isInitialFetching ? (
              <div className="h-10 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            ) : (
              <>
                ₱
                {withBalancePatients
                  .reduce((sum, p) => sum + p.remaining, 0)
                  .toLocaleString()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Database View Container */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/[0.02]">
        {/* Search Bar Area */}
        <div className="p-4 lg:p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="relative max-w-md group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-12 pr-6 py-3 lg:py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/30 dark:bg-zinc-900/10">
                <th className="py-6 px-8">Patient Identity</th>
                <th>Clinic Address</th>
                <th>Contact Info</th>
                <th className="text-right px-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
              {isInitialFetching ? (
                // Show 5 skeleton rows while loading
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : filteredPatients.length > 0 ? (
                [...filteredPatients]
                  .sort((a, b) => a.patientName.localeCompare(b.patientName))
                  .map((patient) => (
                    <tr
                      key={patient.$id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all"
                    >
                      <td className="py-6 px-8 font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                        {patient.patientName}
                      </td>
                      <td className="text-zinc-500 dark:text-zinc-400 font-medium text-sm italic">
                        {patient.address || "No address provided"}
                      </td>
                      <td className="text-zinc-600 dark:text-zinc-300 font-black text-xs tracking-widest">
                        {patient.contact}
                      </td>
                      <td className="px-8">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleView(patient)}
                            className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white rounded-xl text-zinc-500 transition-all"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(patient)}
                            className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500 hover:text-white rounded-xl text-zinc-500 transition-all"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-24 text-zinc-400 font-bold uppercase tracking-widest text-xs opacity-50"
                  >
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: List */}
        <div className="lg:hidden divide-y divide-zinc-100 dark:divide-zinc-900">
          {filteredPatients.length > 0 ? (
            [...filteredPatients]
              .sort((a, b) => a.patientName.localeCompare(b.patientName))
              .map((patient) => (
                <div key={patient.$id} className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight text-lg leading-none">
                        {patient.patientName}
                      </h3>
                      <p className="text-xs font-black text-emerald-500 mt-1 tracking-widest">
                        {patient.contact}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(patient)}
                        className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl active:bg-emerald-500 active:text-white transition-all"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(patient)}
                        className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl active:bg-red-500 active:text-white transition-all"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                      Clinic Address
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                      {patient.address || "No address provided"}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-20 text-zinc-400 font-bold uppercase tracking-widest text-[10px] opacity-50">
              No matching records found
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddPatientModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSave={handleSavePatient}
        loading={loading}
      />
      <ViewPatientDetailsModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Glass Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6">
              <FiTrash2 size={32} />
            </div>
            <h3 className="font-black text-2xl text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
              Archive Record?
            </h3>
            <p className="py-4 text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              You are about to permanently delete{" "}
              <span className="text-zinc-900 dark:text-zinc-100 font-black">
                "{confirmModal.patient?.patientName}"
              </span>
              . This action cannot be undone.
            </p>

            {/* Password Input Field with Show/Hide Toggle */}
            <div className="mt-2 mb-6 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Authorization Required
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  name="action-confirmation"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter delete password"
                  className="w-full pl-12 pr-12 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-sm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                onClick={() => {
                  setConfirmModal({ isOpen: false, patient: null });
                  setDeletePassword("");
                  setShowPassword(false);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="flex-[2] bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-500/20 transition-all uppercase text-xs tracking-widest disabled:opacity-50 disabled:grayscale"
                onClick={handleDelete}
                disabled={deleteLoading || deletePassword !== REQUIRED_PASSWORD}
              >
                {deleteLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Confirm Purge"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
