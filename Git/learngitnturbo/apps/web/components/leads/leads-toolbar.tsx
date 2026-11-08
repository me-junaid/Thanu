import React from "react";
import { Search, LayoutGrid, Table, X } from "lucide-react";
import type { LeadStatus } from "../../app/dashboard/leads/actions";

interface LeadsToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (p: string) => void;
  sourceFilter: string;
  onSourceChange: (s: string) => void;
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
  totalFiltered: number;
}

const STAGE_TABS: { id: string; label: string }[] = [
  { id: "all", label: "All Stages" },
  { id: "new", label: "New Inquiries" },
  { id: "contacted", label: "Contacted" },
  { id: "interested", label: "Interested" },
  { id: "test_drive_scheduled", label: "Test Drives" },
  { id: "negotiation", label: "Negotiations" },
  { id: "booked", label: "Booked" },
  { id: "converted", label: "Closed / Won" },
  { id: "lost", label: "Lost" },
];

export function LeadsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sourceFilter,
  onSourceChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
}: LeadsToolbarProps) {
  return (
    <div className="space-y-4 pt-2">
      {/* ─── Stage Filter Tabs & View Mode Switcher ─── */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1 border-b border-neutral-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STAGE_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition active:scale-98 whitespace-nowrap ${
                  isActive
                    ? "bg-neutral-950 text-white shadow-xs"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* View Toggle (Kanban vs Table) */}
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200/90 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange("kanban")}
            aria-label="Kanban Board View"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
              viewMode === "kanban"
                ? "bg-neutral-950 text-white shadow-2xs"
                : "text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            aria-label="Table View"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
              viewMode === "table"
                ? "bg-neutral-950 text-white shadow-2xs"
                : "text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100"
            }`}
          >
            <Table className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Secondary Filter Bar (Search, Source, Priority) ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prospect name, phone, email, or car..."
            className="w-full rounded-xl border border-neutral-200/90 bg-white py-2 pl-9 pr-9 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value)}
            className="rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs text-neutral-800 focus:border-neutral-950 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="website_form">Website Form</option>
            <option value="whatsapp_direct">WhatsApp Direct</option>
            <option value="showroom_walkin">Showroom Walk-in</option>
            <option value="phone_call">Phone Desk</option>
            <option value="referral">Referral</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs text-neutral-800 focus:border-neutral-950 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <span className="text-[11px] text-neutral-400 font-mono whitespace-nowrap pl-1">
            {totalFiltered} prospects
          </span>
        </div>
      </div>
    </div>
  );
}

