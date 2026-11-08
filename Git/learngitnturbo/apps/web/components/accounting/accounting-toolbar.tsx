import React from "react";
import { Search, LayoutGrid, List, Filter } from "lucide-react";
import type { DealStatus } from "../../app/dashboard/accounting/actions";

interface AccountingToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  viewMode: "table" | "kanban";
  onViewModeChange: (mode: "table" | "kanban") => void;
  totalDeals: number;
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All Deals", value: "all" },
  { label: "Active Pipeline", value: "active" },
  { label: "Token Booked", value: "token_booked" },
  { label: "Finance Pending", value: "financing_pending" },
  { label: "Payment Cleared", value: "payment_cleared" },
  { label: "Delivered", value: "delivered" },
  { label: "Deal Closed", value: "completed" },
];

export function AccountingToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  totalDeals,
}: AccountingToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
      {/* Search Input & Status Pills */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search */}
        <div className="relative min-w-[240px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search deal #, customer, car, or VIN..."
            className="w-full rounded-xl border border-neutral-200/90 bg-white pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-hidden transition"
          />
        </div>

        {/* Status Filter Dropdown / Pills - Table View Only */}
        {viewMode === "table" && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {STATUS_FILTERS.map((filter) => {
              const isSelected = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onStatusFilterChange(filter.value)}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? "bg-neutral-950 text-white shadow-2xs"
                      : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* View Switcher: Table vs Kanban */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <span className="text-[11px] font-mono text-neutral-500 hidden md:inline">
          {totalDeals} {totalDeals === 1 ? "Deal" : "Deals"}
        </span>

        <div className="flex items-center rounded-xl border border-neutral-200/90 bg-neutral-100 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              viewMode === "table"
                ? "bg-white text-neutral-950 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
            title="Table View"
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("kanban")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              viewMode === "kanban"
                ? "bg-white text-neutral-950 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
            title="Kanban Pipeline"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}

