import React from "react";
import { Search, LayoutGrid, Table, SlidersHorizontal, X } from "lucide-react";

interface InventoryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  fuelFilter: string;
  onFuelChange: (fuel: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  totalFiltered: number;
}

const STATUS_TABS = [
  { id: "all", label: "All Fleet" },
  { id: "available", label: "Available" },
  { id: "reserved", label: "Reserved" },
  { id: "in_refurbishment", label: "Refurbishment" },
  { id: "sold", label: "Sold" },
];

export function InventoryToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  fuelFilter,
  onFuelChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
}: InventoryToolbarProps) {
  return (
    <div className="space-y-4 pt-2">
      {/* ─── Status Filter Tabs ─── */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1 border-b border-neutral-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => {
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

        {/* View Toggle (Grid vs Table) */}
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200/90 bg-white p-1 shadow-2xs">
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
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid View"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
              viewMode === "grid"
                ? "bg-neutral-950 text-white shadow-2xs"
                : "text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Secondary Filter Bar (Search, Dropdowns) ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by brand, model, registration #, or VIN..."
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

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Fuel Filter */}
          <select
            value={fuelFilter}
            onChange={(e) => onFuelChange(e.target.value)}
            className="rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs text-neutral-800 focus:border-neutral-950 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">All Fuel Types</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs text-neutral-800 focus:border-neutral-950 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="newest">Recently Acquired</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="km_asc">Mileage: Lowest First</option>
          </select>

          <span className="text-[11px] text-neutral-400 font-mono whitespace-nowrap pl-1">
            {totalFiltered} vehicles
          </span>
        </div>
      </div>
    </div>
  );
}

