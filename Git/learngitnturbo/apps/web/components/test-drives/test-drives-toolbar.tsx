import React from "react";
import {
  Search,
  CalendarDays,
  Columns3,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  getLocalDateString,
  addDaysToLocalDate,
  formatToolbarDateLabel,
} from "../../lib/date";

export type ViewMode = "timeline" | "kanban";

interface TestDrivesToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedDate: string; // YYYY-MM-DD or "all"
  onDateChange: (date: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (view: ViewMode) => void;
  totalFilteredCount: number;
}

export function TestDrivesToolbar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}: TestDrivesToolbarProps) {
  const todayStr = getLocalDateString(new Date());
  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    const base = selectedDate === "all" ? todayStr : selectedDate;
    onDateChange(addDaysToLocalDate(base, -1));
  };

  const handleNextDay = () => {
    const base = selectedDate === "all" ? todayStr : selectedDate;
    onDateChange(addDaysToLocalDate(base, 1));
  };

  const handleJumpToday = () => {
    onDateChange(todayStr);
  };

  const formattedDateLabel = () => {
    return formatToolbarDateLabel(selectedDate);
  };

  const STATUS_TABS = [
    { id: "all", label: "All Drives" },
    { id: "scheduled", label: "Scheduled" },
    { id: "confirmed", label: "Confirmed" },
    { id: "in_progress", label: "Active On Road" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-3">
      {/* ─── Top Row: Date Navigation & View Mode Toggle ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-2.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        {/* Date Selector */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition active:scale-95"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleJumpToday}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
              isToday
                ? "bg-neutral-950 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            Today
          </button>

          <span className="text-xs font-semibold text-neutral-900 px-2 min-w-35 text-center font-mono">
            {formattedDateLabel()}
          </span>

          <button
            type="button"
            onClick={handleNextDay}
            className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition active:scale-95"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== "all" && (
            <button
              type="button"
              onClick={() => onDateChange("all")}
              className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 ml-1 underline decoration-dotted"
            >
              Show All
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-neutral-400 font-mono hidden md:inline">
            {totalFilteredCount} {totalFilteredCount === 1 ? "drive" : "drives"}
          </span>

          <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200/60">
            <button
              type="button"
              onClick={() => onViewModeChange("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === "timeline"
                  ? "bg-white text-neutral-950 shadow-2xs font-semibold"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === "kanban"
                  ? "bg-white text-neutral-950 shadow-2xs font-semibold"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Status Tabs (Timeline only) & Search ─── */}
      <div
        className={`flex flex-col md:flex-row md:items-center ${
          viewMode === "timeline" ? "justify-between" : "justify-end"
        } gap-3`}
      >
        {/* Status Tabs (Only shown in Timeline mode as Kanban has dedicated stage columns) */}
        {viewMode === "timeline" && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {STATUS_TABS.map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onStatusChange(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-2xs"
                      : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search customer, phone, car, DL..."
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200/90 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
}
