"use client";
import React from "react";
import { motion } from "framer-motion";

// A more realistic anatomical tooth shape
const AnatomicalToothSVG = ({ fill, stroke }) => (
  <svg
    viewBox="0 0 100 120"
    className="w-10 h-12 transition-colors duration-300"
  >
    <path
      d="M20 20 Q 20 5 50 5 Q 80 5 80 20 Q 85 50 75 90 Q 70 115 55 115 Q 50 110 45 115 Q 30 115 25 90 Q 15 50 20 20 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    {/* Subtle highlight for depth */}
    <path
      d="M35 25 Q 40 15 50 15"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

export default function ToothIcon({
  status,
  hasNote,
  toothNumber,
  isSelected,
}) {
  // Theme-aware color mapping
  const statusConfig = {
    caries: { fill: "#FCA5A5", stroke: "#DC2626", label: "C" },
    filled: { fill: "#FEF08A", stroke: "#EAB308", label: "F" },
    extracted: { fill: "#3F3F46", stroke: "#18181B", label: "X" },
    dentition: { fill: "#991B1B", stroke: "#7F1D1D", label: "P" },
    healthy: { fill: "#FFFFFF", stroke: "#D4D4D8", label: "" },
  };

  const current = statusConfig[status] || statusConfig.healthy;

  return (
    <div className="relative group flex flex-col items-center">
      {/* Tooth Numbering Label (Top) */}
      <span
        className={`text-[10px] font-black mb-1 transition-colors ${
          isSelected ? "text-indigo-600 scale-110" : "text-zinc-400"
        }`}
      >
        {toothNumber}
      </span>

      {/* Main Tooth Container */}
      <motion.div
        whileHover={{ y: -2 }}
        className={`
          relative p-2 rounded-2xl transition-all duration-300
          ${
            isSelected
              ? "bg-indigo-50 ring-2 ring-indigo-500 shadow-lg shadow-indigo-100"
              : "bg-white/50 border border-transparent hover:border-zinc-200"
          }
        `}
      >
        <AnatomicalToothSVG fill={current.fill} stroke={current.stroke} />

        {/* Status Badge Overlay */}
        {status !== "healthy" && (
          <div
            className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm"
            style={{ backgroundColor: current.stroke }}
          >
            <span className="text-[8px] font-black text-white leading-none">
              {current.label}
            </span>
          </div>
        )}

        {/* Note Indicator (Glow effect) */}
        {hasNote && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </div>
        )}
      </motion.div>

      {/* Selection Glow (Underneath) */}
      {isSelected && (
        <motion.div
          layoutId="selectionGlow"
          className="absolute inset-0 bg-indigo-500/5 blur-xl -z-10 rounded-full"
        />
      )}
    </div>
  );
}
