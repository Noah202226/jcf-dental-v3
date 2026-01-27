"use client";

import { useEffect, useState } from "react";
import { FiUsers, FiSettings, FiBarChart2, FiList } from "react-icons/fi";
import { ListChecks, LayoutDashboard, ChevronLeft } from "lucide-react";
import TopBar from "./layout/TopBar";
import DashboardSection from "./layout/DashboardSection";
import PatientsSection from "./layout/PatientsSection";
import ReportsSection from "./layout/ReportsSection";
import SettingsSection from "./layout/SettingsSection";
import SchedulingSection from "./layout/ScheduleSections";
import AppointmentManager from "./layout/Appointments";
import { usePersonalizationStore } from "../stores/usePersonalizationStore";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("patients");
  const { personalization, fetchPersonalization } = usePersonalizationStore();

  useEffect(() => {
    fetchPersonalization();
  }, [fetchPersonalization]);

  const mockStats = {
    totalPatients: 1245,
    newPatients: 23,
    activeTreatments: 87,
    revenueMonth: 452000,
    revenueGrowth: 8,
    outstandingBalance: 35700,
  };

  const mockTopServices = [
    { name: "Teeth Cleaning", count: 320 },
    { name: "Braces", count: 150 },
    { name: "Tooth Extraction", count: 110 },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardSection stats={mockStats} topServices={mockTopServices} />
        );
      case "scheduling":
        return <SchedulingSection />;
      case "appointments":
        return <AppointmentManager />;
      case "patients":
        return <PatientsSection />;
      case "reports":
        return <ReportsSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <DashboardSection />;
    }
  };

  // V3 Nav Styling - Now strictly using CSS variables from your globals.css
  const getLinkClasses = (section) => {
    const isActive = activeSection === section;
    return `group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 relative ${
      isActive
        ? "bg-primary/15 text-primary font-bold shadow-sm"
        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-foreground"
    }`;
  };

  const closeDrawer = () => {
    const drawer = document.getElementById("dashboard-drawer");
    if (drawer) drawer.checked = false;
  };

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-background text-foreground transition-colors duration-500">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content Area */}
      <div className="drawer-content flex flex-col relative bg-background">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1600px] mx-auto"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Sidebar Navigation */}
      <div className="drawer-side z-50">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>

        {/* Update: The aside now uses bg-card (white in light, zinc-900 in dark) 
            to stand out against the slightly softer bg-background.
        */}
        <aside className="w-72 min-h-screen bg-card border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-500 ease-in-out shadow-xl lg:shadow-none">
          {/* Logo Section */}
          <div className="p-6 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group">
                {/* Avatar adapts to your --theme-color */}
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-content font-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                  {personalization?.initial || "CA"}
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-tighter text-foreground leading-none">
                    {personalization?.businessName || "Clinic Admin"}
                  </h2>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    v3.0 Pro
                  </span>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>

          {/* Sidebar Menu Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 space-y-8 py-4 custom-scrollbar">
            {/* Group: Analytics */}
            {/* <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-3">
                Analytics
              </p>
              <ul className="space-y-1">
                <NavItem
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                  id="dashboard"
                  activeSection={activeSection}
                  onClick={() => {
                    setActiveSection("dashboard");
                    closeDrawer();
                  }}
                  getLinkClasses={getLinkClasses}
                />
              </ul>
            </div> */}

            {/* Group: Management */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-3">
                Management
              </p>
              <ul className="space-y-1">
                <NavItem
                  icon={<FiUsers size={18} />}
                  label="Patients"
                  id="patients"
                  activeSection={activeSection}
                  onClick={() => {
                    setActiveSection("patients");
                    closeDrawer();
                  }}
                  getLinkClasses={getLinkClasses}
                />
                <NavItem
                  icon={<FiList size={18} />}
                  label="Schedules"
                  id="scheduling"
                  activeSection={activeSection}
                  onClick={() => {
                    setActiveSection("scheduling");
                    closeDrawer();
                  }}
                  getLinkClasses={getLinkClasses}
                />
                <NavItem
                  icon={<ListChecks size={18} />}
                  label="Appointments"
                  id="appointments"
                  activeSection={activeSection}
                  onClick={() => {
                    setActiveSection("appointments");
                    closeDrawer();
                  }}
                  getLinkClasses={getLinkClasses}
                />
              </ul>
            </div>

            {/* Group: Intelligence */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-1000">
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-3">
                PERFORMANCE
              </p>
              <ul className="space-y-1">
                <NavItem
                  icon={<FiBarChart2 size={18} />}
                  label="Sales & Expenses"
                  id="reports"
                  activeSection={activeSection}
                  onClick={() => {
                    setActiveSection("reports");
                    closeDrawer();
                  }}
                  getLinkClasses={getLinkClasses}
                />
              </ul>
            </div>
          </div>

          {/* Bottom Settings Link */}
          <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800/50">
            <a
              className={getLinkClasses("settings")}
              onClick={() => {
                setActiveSection("settings");
                closeDrawer();
              }}
            >
              <FiSettings
                size={18}
                className={
                  activeSection === "settings"
                    ? "text-primary animate-spin-slow"
                    : "text-zinc-400 group-hover:text-primary transition-colors"
                }
              />
              <span className="font-bold">System Settings</span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

function NavItem({ icon, label, id, activeSection, onClick, getLinkClasses }) {
  const isActive = activeSection === id;
  return (
    <li>
      <a className={getLinkClasses(id)} onClick={onClick}>
        <span
          className={
            isActive
              ? "text-primary"
              : "text-zinc-400 group-hover:text-primary transition-colors"
          }
        >
          {icon}
        </span>
        {label}
        {isActive && (
          <motion.div
            layoutId="activePill"
            className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </a>
    </li>
  );
}
