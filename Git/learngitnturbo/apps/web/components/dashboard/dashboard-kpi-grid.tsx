"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDashboardLayout } from "./dashboard-shell";

export function DashboardOverviewHeaderToggle() {
  const { isKpiCollapsed, toggleKpi } = useDashboardLayout();

  return (
    <button
      type="button"
      onClick={toggleKpi}
      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition active:scale-98"
      title={isKpiCollapsed ? "Show summary metrics" : "Hide summary metrics"}
      aria-label={isKpiCollapsed ? "Show summary metrics" : "Hide summary metrics"}
    >
      {isKpiCollapsed ? (
        <>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
          <span>Show Metrics</span>
        </>
      ) : (
        <>
          <ChevronUp className="h-3.5 w-3.5 text-neutral-500" />
          <span>Hide Metrics</span>
        </>
      )}
    </button>
  );
}

export function DashboardOverviewKpiWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isKpiCollapsed } = useDashboardLayout();

  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isKpiCollapsed
          ? "max-h-0 opacity-0 pointer-events-none -my-4"
          : "max-h-[500px] opacity-100"
      }`}
    >
      {children}
    </div>
  );
}

