"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { clearDashboardCache } from "../../lib/prefetch";
import type { StaffRole } from "../../lib/permissions/types";

interface DashboardLayoutContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isKpiCollapsed: boolean;
  toggleKpi: () => void;
  dealershipName: string;
  userEmail: string;
  userName: string;
  role: StaffRole;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextType>({
  isSidebarCollapsed: false,
  toggleSidebar: () => {},
  isKpiCollapsed: false,
  toggleKpi: () => {},
  dealershipName: "Apex Motors",
  userEmail: "",
  userName: "",
  role: "viewer",
});

export function useDashboardLayout() {
  return useContext(DashboardLayoutContext);
}

interface DashboardShellProps {
  userEmail: string;
  userName: string;
  dealershipName: string;
  role?: StaffRole;
  children: React.ReactNode;
}

export function DashboardShell({
  userEmail,
  userName,
  dealershipName,
  role = "viewer",
  children,
}: DashboardShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isKpiCollapsed, setIsKpiCollapsed] = useState(false);

  // Multi-tenant isolation: purge SWR in-memory cache when user or dealership identity changes
  const prevTenantRef = React.useRef(`${dealershipName}:${userEmail}`);
  useEffect(() => {
    const currentTenant = `${dealershipName}:${userEmail}`;
    if (prevTenantRef.current !== currentTenant) {
      prevTenantRef.current = currentTenant;
      clearDashboardCache();
    }
  }, [dealershipName, userEmail]);

  useEffect(() => {
    try {
      const savedSidebar = localStorage.getItem("orgetise_sidebar_collapsed");
      if (savedSidebar !== null) {
        setIsSidebarCollapsed(savedSidebar === "true");
      }
      const savedKpi = localStorage.getItem("orgetise_kpi_collapsed");
      if (savedKpi !== null) {
        setIsKpiCollapsed(savedKpi === "true");
      }
    } catch {
      // Ignore localStorage access restrictions
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+B or Ctrl+B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b" && !e.shiftKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("orgetise_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const toggleKpi = () => {
    setIsKpiCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("orgetise_kpi_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  return (
    <DashboardLayoutContext.Provider
      value={{
        isSidebarCollapsed,
        toggleSidebar,
        isKpiCollapsed,
        toggleKpi,
        dealershipName,
        userEmail,
        userName,
        role,
      }}
    >
      <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans antialiased flex">
        {/* ── Left Navigation Sidebar ── */}
        <DashboardSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        {/* ── Main App Shell ── */}
        <div
          className={`flex flex-1 flex-col overflow-x-hidden transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
        >
          <DashboardHeader
            userEmail={userEmail}
            userName={userName}
            dealershipName={dealershipName}
            role={role}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />

          <main className="flex-1 mt-16 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full transition-all duration-300">
            {children}
          </main>
        </div>
      </div>
    </DashboardLayoutContext.Provider>
  );
}
