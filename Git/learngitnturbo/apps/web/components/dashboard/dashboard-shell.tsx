"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { DashboardOverviewView } from "./dashboard-overview-view";
import { InventoryShell } from "../inventory/inventory-shell";
import { LeadsShell } from "../leads/leads-shell";
import { TestDrivesShell } from "../test-drives/test-drives-shell";
import { AccountingShell } from "../accounting/accounting-shell";
import { TeamShell } from "../team/team-shell";
import { AccessRestricted } from "./access-restricted";
import { usePermissions } from "../../lib/permissions";
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
  activePath: string;
  navigateTo: (path: string) => void;
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
  activePath: "/dashboard",
  navigateTo: () => {},
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
  const currentPathname = usePathname();
  const [activePath, setActivePath] = useState<string>(() => currentPathname || "/dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isKpiCollapsed, setIsKpiCollapsed] = useState(false);
  const { can, canAny } = usePermissions();

  // Synchronize activePath on direct navigation or browser back/forward (popstate)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname);

      const handlePopState = () => {
        setActivePath(window.location.pathname);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [currentPathname]);

  const navigateTo = (path: string) => {
    if (activePath === path) return;
    setActivePath(path);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", path);
    }
  };

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

  // Instant SPA view renderer without server roundtrips, protected by capability assertions
  const renderActiveView = () => {
    switch (activePath) {
      case "/dashboard":
        return <DashboardOverviewView />;
      case "/dashboard/inventory":
        if (!can("inventory:view")) {
          return (
            <AccessRestricted
              title="Fleet Inventory Restricted"
              description="Access to dealership fleet listings requires authorized showroom credentials."
              requiredPermission="inventory:view"
            />
          );
        }
        return <InventoryShell dealershipName={dealershipName} />;
      case "/dashboard/leads":
        if (!canAny("leads:view_all", "leads:view_assigned_only")) {
          return (
            <AccessRestricted
              title="Leads CRM Restricted"
              description="Access to customer inquiries, prospect contact details, and sales pipelines is restricted to authorized sales executives and floor managers."
              requiredPermission="leads:view_all"
            />
          );
        }
        return <LeadsShell dealershipName={dealershipName} />;
      case "/dashboard/test-drives":
        if (!canAny("test_drives:view_all", "test_drives:view_assigned")) {
          return (
            <AccessRestricted
              title="Test Drives Workspace Restricted"
              description="Access to customer test drive schedules, vehicle checkout status, and gate passes is restricted to authorized sales representatives."
              requiredPermission="test_drives:view_all"
            />
          );
        }
        return <TestDrivesShell />;
      case "/dashboard/accounting":
        if (!can("accounting:view_pnl")) {
          return (
            <AccessRestricted
              title="Accounting & P&L Restricted"
              description="Access to showroom financial books, unit margin schemes, workshop expenditure ledgers, and bank delivery orders is restricted to Showroom Principals and Finance Controllers."
              requiredPermission="accounting:view_pnl"
            />
          );
        }
        return <AccountingShell />;
      case "/dashboard/team":
        if (!can("staff:manage_roster")) {
          return (
            <AccessRestricted
              title="Staff & Role Management Restricted"
              description="Staff and access role governance is restricted to Showroom Principals and General Managers. Your current account tier does not have permission to view or manage showroom team members."
              requiredPermission="staff:manage_roster"
            />
          );
        }
        return <TeamShell />;
      default:
        return children;
    }
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
        activePath,
        navigateTo,
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
            {renderActiveView()}
          </main>
        </div>
      </div>
    </DashboardLayoutContext.Provider>
  );
}
