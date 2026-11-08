"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Users2, Plus, CheckCheck, Loader2, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { LeadsHeader } from "./leads-header";
import { LeadsToolbar } from "./leads-toolbar";
import { LeadsKanban } from "./leads-kanban";
import { LeadsTable } from "./leads-table";
import { LeadDrawer } from "./lead-drawer";
import { CreateLeadModal } from "./modals/create-lead-modal";
import {
  getLeadsAction,
  getLeadVehicleOptionsAction,
  getDealershipStaffOptionsAction,
  getLeadsDashboardBundleAction,
  updateLeadStatusAction,
  type LeadItem,
  type LeadsStats,
  type LeadStatus,
} from "../../app/dashboard/leads/actions";

interface LeadsShellProps {
  initialLeads?: LeadItem[];
  stats?: LeadsStats;
  vehicleOptions?: { id: string; label: string; price: string }[];
  staffOptions?: { id: string; fullName: string; role: string }[];
  dealershipName?: string;
}

export function LeadsShell({
  initialLeads,
  stats: initialStats,
  vehicleOptions: initialVehicleOptions,
  staffOptions: initialStaffOptions,
  dealershipName = "Apex Motors",
}: LeadsShellProps) {
  const router = useRouter();

  // SWR: in-memory client cache with background revalidation
  const { data, isLoading, mutate } = useSWR(
    "dashboard-leads-data",
    async () => {
      return await getLeadsDashboardBundleAction();
    },
    {
      fallbackData:
        initialLeads && initialStats && initialVehicleOptions && initialStaffOptions
          ? {
              leads: initialLeads,
              stats: initialStats,
              vehicleOptions: initialVehicleOptions,
              staffOptions: initialStaffOptions,
            }
          : undefined,
      dedupingInterval: 60000,
      revalidateOnFocus: false,
      revalidateIfStale: true,
      keepPreviousData: true,
    }
  );

  const leads = data?.leads ?? initialLeads ?? [];
  const stats = data?.stats ?? initialStats ?? null;
  const vehicleOptions = data?.vehicleOptions ?? initialVehicleOptions ?? [];
  const staffOptions = data?.staffOptions ?? initialStaffOptions ?? [];

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Ultra-minimal toast state for stage updates (loading -> success/double-tick)
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
  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (priorityFilter !== "all" && l.priority !== priorityFilter) return false;
    if (sourceFilter !== "all" && l.source !== sourceFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const carText = l.vehicle
        ? `${l.vehicle.brand} ${l.vehicle.model} ${l.vehicle.variant || ""}`.toLowerCase()
        : "";
      const matches =
        l.customerName.toLowerCase().includes(q) ||
        l.phoneNumber.toLowerCase().includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        carText.includes(q);

      if (!matches) return false;
    }
    return true;
  });

  // Optimistic stage transition (via Drag & Drop, Advance button, or Drawer) with rollback
  const handleMoveLead = async (leadId: string, nextStatus: LeadStatus) => {
    const currentLead = leads.find((l) => l.id === leadId);
    if (!currentLead || currentLead.status === nextStatus) return;
    const previousStatus = currentLead.status;

    // 1. Instant Optimistic UI Update in SWR cache
    if (data) {
      mutate(
        {
          ...data,
          leads: data.leads.map((l) =>
            l.id === leadId ? { ...l, status: nextStatus } : l
          ),
        },
        false
      );
    }
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    // 2. Start toast immediately at the moment card drops with spinner animation
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ status: "loading", message: "Updating stage..." });

    // 3. Background Server Action
    try {
      const res = await updateLeadStatusAction({
        leadId,
        status: nextStatus,
      });
      if (!res?.success) {
        throw new Error("Failed to persist stage transition");
      }

      // 4. Transition to WhatsApp-style double-tick confirmation
      setToast({ status: "success", message: "Stage updated" });
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 2000);

      mutate();
    } catch (err) {
      console.error("Stage transition failed, rolling back to previous stage:", err);
      // Rollback to original status on failure
      if (data) {
        mutate(
          {
            ...data,
            leads: data.leads.map((l) =>
              l.id === leadId ? { ...l, status: previousStatus } : l
            ),
          },
          false
        );
      }
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, status: previousStatus } : null));
      }

      setToast({ status: "error", message: "Could not update stage" });
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 3000);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* ─── Top Header & Live KPI Metrics ─── */}
        <LeadsHeader
          stats={stats}
          isLoading={isLoading && !data}
          dealershipName={dealershipName}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        {/* ─── Filter & View Switcher Toolbar ─── */}
        <LeadsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          sourceFilter={sourceFilter}
          onSourceChange={setSourceFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFiltered={filteredLeads.length}
        />

        {/* ─── View Modes: Kanban Pipeline vs Data Table ─── */}
        {viewMode === "kanban" ? (
          <LeadsKanban
            leads={filteredLeads}
            isLoading={isLoading && leads.length === 0}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onSelectLead={setSelectedLead}
            onAdvanceStage={handleMoveLead}
            onMoveLead={handleMoveLead}
          />
        ) : isLoading && leads.length === 0 ? (
          <LeadsTable leads={[]} isLoading={true} onSelectLead={() => {}} />
        ) : filteredLeads.length > 0 ? (
          <LeadsTable leads={filteredLeads} onSelectLead={setSelectedLead} />
        ) : (
        <div className="rounded-3xl border border-dashed border-neutral-200/90 bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
            <Users2 className="h-7 w-7" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="font-serif text-lg font-bold text-neutral-950">
              No Prospects Found
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-1">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search criteria or resetting the stage filters."
                : "No customer inquiries recorded yet. Record your first showroom walk-in or website lead."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setPriorityFilter("all");
              setSourceFilter("all");
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* ─── Slide-over Lead Dossier Drawer ─── */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        staffOptions={staffOptions}
        onRefresh={() => {
          router.refresh();
        }}
      />

        {/* ─── Record New Lead Modal ─── */}
        <CreateLeadModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          vehicleOptions={vehicleOptions}
          staffOptions={staffOptions}
          onSuccess={() => {
            mutate();
          }}
        />
      </div>

      {/* ─── WhatsApp-Style Toast with Loading Spinner to Double-Tick Transition ─── */}
      {isMounted &&
        toast &&
        createPortal(
          <div className="fixed bottom-[20px] right-[20px] z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-2 rounded-full bg-neutral-950/0 backdrop-blur-md px-4 py-2 text-xs font-medium border border-black/9 shadow-xl transition-all duration-200">
              {toast.status === "loading" && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400 shrink-0" />
              )}
              {toast.status === "success" && (
                <CheckCheck className="h-4 w-4 text-sky-400 shrink-0 animate-in zoom-in-75 duration-150" />
              )}
              {toast.status === "error" && (
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

