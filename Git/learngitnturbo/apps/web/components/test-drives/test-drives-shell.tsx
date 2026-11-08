"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckCheck, Loader2, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { TestDrivesHeader } from "./test-drives-header";
import { TestDrivesToolbar, type ViewMode } from "./test-drives-toolbar";
import { TestDrivesTimeline } from "./test-drives-timeline";
import { TestDrivesKanban } from "./test-drives-kanban";
import { TestDriveDrawer } from "./test-drive-drawer";
import { ScheduleModal } from "./modals/schedule-modal";
import { GatePassModal } from "./modals/gate-pass-modal";
import { CheckInModal } from "./modals/check-in-modal";
import { CancelModal } from "./modals/cancel-modal";
import {
  getTestDrivesAction,
  confirmTestDriveAction,
  type TestDriveItem,
  type TestDrivesStats,
} from "../../app/dashboard/test-drives/actions";
import { getLocalDateString } from "../../lib/date";

interface TestDrivesShellProps {
  initialTestDrives?: TestDriveItem[];
  stats?: TestDrivesStats;
}

export function TestDrivesShell({
  initialTestDrives,
  stats: initialStats,
}: TestDrivesShellProps) {
  const router = useRouter();

  // SWR: in-memory client cache with background revalidation
  const { data, isLoading, mutate } = useSWR(
    "dashboard-test-drives-data",
    async () => {
      return await getTestDrivesAction();
    },
    {
      fallbackData:
        initialTestDrives && initialStats
          ? { testDrives: initialTestDrives, stats: initialStats }
          : undefined,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const testDrives = data?.testDrives ?? initialTestDrives ?? [];
  const stats = data?.stats ?? initialStats ?? null;

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getLocalDateString(new Date());
  });
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");

  // Modals & Drawer State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [preselectedVehicleId, setPreselectedVehicleId] = useState<string | undefined>(undefined);
  const [gatePassItem, setGatePassItem] = useState<TestDriveItem | null>(null);
  const [checkinItem, setCheckinItem] = useState<TestDriveItem | null>(null);
  const [cancelDriveId, setCancelDriveId] = useState<string | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<TestDriveItem | null>(null);

  // Minimal Toast Notification State
  type ToastState = {
    status: "loading" | "success" | "error";
    message: string;
  } | null;

  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Client-side filtering
  const filteredTestDrives = testDrives.filter((item) => {
    // Status filter (only applied in timeline mode since Kanban has dedicated status columns)
    if (viewMode === "timeline" && selectedStatus !== "all" && item.status !== selectedStatus) {
      return false;
    }

    // Date filter
    if (selectedDate !== "all") {
      const driveDate = getLocalDateString(new Date(item.scheduledAt));
      if (driveDate !== selectedDate) return false;
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const carText = `${item.vehicle.brand} ${item.vehicle.model} ${item.vehicle.registrationNumber || ""}`.toLowerCase();
      const matches =
        item.customerName.toLowerCase().includes(q) ||
        item.customerPhone.toLowerCase().includes(q) ||
        (item.drivingLicenseNumber && item.drivingLicenseNumber.toLowerCase().includes(q)) ||
        carText.includes(q);

      if (!matches) return false;
    }

    return true;
  });

  // Action: Confirm Appointment
  const handleConfirm = async (id: string) => {
    // Optimistic update in SWR cache
    if (data) {
      mutate(
        {
          ...data,
          testDrives: data.testDrives.map((d) =>
            d.id === id ? { ...d, status: "confirmed" } : d
          ),
        },
        false
      );
    }
    if (selectedDossier?.id === id) {
      setSelectedDossier((prev) => (prev ? { ...prev, status: "confirmed" } : null));
    }

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ status: "loading", message: "Confirming appointment..." });

    try {
      await confirmTestDriveAction(id);
      setToast({ status: "success", message: "Appointment confirmed" });
      toastTimeoutRef.current = setTimeout(() => setToast(null), 2000);
      mutate();
    } catch (err: any) {
      setToast({ status: "error", message: err.message || "Failed to confirm" });
      toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
    }
  };

  const handleActionSuccess = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ status: "success", message: msg });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2500);
    mutate();
  };

  return (
    <>
      <div className="space-y-6">
        {/* KPI Metrics Header */}
        <TestDrivesHeader
          stats={stats}
          isLoading={isLoading && !data}
          onOpenScheduleModal={() => {
            setPreselectedVehicleId(undefined);
            setIsScheduleOpen(true);
          }}
        />

        {/* Toolbar (Date picker, Search, View switch) */}
        <TestDrivesToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredTestDrives.length}
        />

        {/* View Switcher: Timeline vs Kanban */}
        {viewMode === "timeline" ? (
          <TestDrivesTimeline
            testDrives={filteredTestDrives}
            isLoading={isLoading && !data}
            selectedDate={selectedDate}
            onSelect={setSelectedDossier}
            onOpenScheduleModal={(vehId) => {
              setPreselectedVehicleId(vehId);
              setIsScheduleOpen(true);
            }}
          />
        ) : (
          <TestDrivesKanban
            testDrives={filteredTestDrives}
            isLoading={isLoading && !data}
            onSelect={setSelectedDossier}
            onOpenGatePass={setGatePassItem}
            onOpenCheckin={setCheckinItem}
            onConfirm={handleConfirm}
          />
        )}
      </div>

      {/* ─── Modals ─── */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        initialVehicleId={preselectedVehicleId}
        onSuccess={() => handleActionSuccess("Test drive appointment scheduled")}
      />

      <GatePassModal
        isOpen={Boolean(gatePassItem)}
        testDrive={gatePassItem}
        onClose={() => setGatePassItem(null)}
        onSuccess={() => handleActionSuccess("Gate pass issued • Vehicle checked out")}
      />

      <CheckInModal
        isOpen={Boolean(checkinItem)}
        testDrive={checkinItem}
        onClose={() => setCheckinItem(null)}
        onSuccess={() => handleActionSuccess("Vehicle checked in • Feedback saved")}
      />

      <CancelModal
        isOpen={Boolean(cancelDriveId)}
        testDriveId={cancelDriveId}
        onClose={() => setCancelDriveId(null)}
        onSuccess={() => handleActionSuccess("Test drive cancelled")}
      />

      {/* ─── Dossier Drawer ─── */}
      <TestDriveDrawer
        isOpen={Boolean(selectedDossier)}
        testDrive={selectedDossier}
        onClose={() => setSelectedDossier(null)}
        onOpenGatePass={(item) => {
          setSelectedDossier(null);
          setGatePassItem(item);
        }}
        onOpenCheckin={(item) => {
          setSelectedDossier(null);
          setCheckinItem(item);
        }}
        onConfirm={handleConfirm}
        onCancel={(id) => {
          setSelectedDossier(null);
          setCancelDriveId(id);
        }}
      />

      {/* ─── WhatsApp-Style Minimalist Floating Toast (Body Portal) ─── */}
      {isMounted &&
        toast &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-999 pointer-events-none transition-all duration-300 ease-out"
          >
            <div className="flex items-center gap-2 rounded-full bg-neutral-950/95 backdrop-blur-md px-4 py-2 text-xs font-medium text-white shadow-2xl border border-neutral-800">
              {toast.status === "loading" && (
                <Loader2 className="h-3.5 w-3.5 text-neutral-400 animate-spin shrink-0" />
              )}
              {toast.status === "success" && (
                <CheckCheck className="h-3.5 w-3.5 text-sky-400 shrink-0 stroke-[2.5]" />
              )}
              {toast.status === "error" && (
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 stroke-[2.5]" />
              )}
              <span className="tracking-tight">{toast.message}</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
