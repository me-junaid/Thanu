import React, { useState } from "react";
import { LeadCard } from "./lead-card";
import type { LeadItem, LeadStatus } from "../../app/dashboard/leads/actions";

interface LeadsKanbanProps {
  leads: LeadItem[];
  isLoading?: boolean;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  onSelectLead: (leadItem: LeadItem) => void;
  onAdvanceStage: (leadId: string, nextStatus: LeadStatus) => void;
  onMoveLead?: (leadId: string, nextStatus: LeadStatus) => void;
}

const COLUMNS: { id: LeadStatus; title: string; dot: string; countBg: string }[] = [
  { id: "new", title: "New Inquiries", dot: "bg-blue-500", countBg: "bg-blue-100 text-blue-800" },
  { id: "contacted", title: "Contacted", dot: "bg-neutral-500", countBg: "bg-neutral-100 text-neutral-800" },
  { id: "interested", title: "Interested", dot: "bg-cyan-500", countBg: "bg-cyan-100 text-cyan-800" },
  { id: "test_drive_scheduled", title: "Test Drive", dot: "bg-amber-500", countBg: "bg-amber-100 text-amber-800" },
  { id: "negotiation", title: "Negotiation", dot: "bg-orange-500", countBg: "bg-orange-100 text-orange-800" },
  { id: "booked", title: "Token Booked", dot: "bg-purple-500", countBg: "bg-purple-100 text-purple-800" },
  { id: "converted", title: "Won / Sold", dot: "bg-emerald-500", countBg: "bg-emerald-100 text-emerald-800" },
  { id: "lost", title: "Lost", dot: "bg-red-500", countBg: "bg-red-100 text-red-800" },
];

export function LeadsKanban({
  leads,
  isLoading = false,
  statusFilter = "all",
  onStatusChange,
  onSelectLead,
  onAdvanceStage,
  onMoveLead,
}: LeadsKanbanProps) {
  const isFiltered = Boolean(statusFilter && statusFilter !== "all");

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<LeadStatus | null>(null);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, lead: LeadItem) => {
    e.dataTransfer.setData("text/plain", lead.id);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ leadId: lead.id, status: lead.status })
    );
    e.dataTransfer.effectAllowed = "move";
    setDraggedLeadId(lead.id);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, colId: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    setDraggedLeadId(null);
    setDragOverColumnId(null);

    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.status !== targetStatus) {
      const moveFn = onMoveLead || onAdvanceStage;
      moveFn(leadId, targetStatus);
    }
  };

  // When a specific stage filter is active (e.g. Test Drives or New Inquiries), fill the space across the full dashboard width
  if (isFiltered) {
    const matchedCol = COLUMNS.find((c) => c.id === statusFilter);
    const col = matchedCol || {
      id: statusFilter as LeadStatus,
      title: "Active Stage",
      dot: "bg-amber-500",
      countBg: "bg-amber-100 text-amber-800",
    };
    const columnLeads = leads.filter((l) => l.status === col.id);

    return (
      <div className="w-full space-y-4 py-2">
        {/* Full-Width Stage Header Bar */}
        <div className="w-full flex items-center justify-between px-1 pb-3 border-b border-neutral-200/80">
          <div className="flex items-center gap-2.5">
            <span className={`h-3 w-3 rounded-full ${col.dot}`} />
            <h3 className="font-serif text-base font-bold text-neutral-950">
              {col.title} Pipeline
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${col.countBg}`}
            >
              {columnLeads.length} {columnLeads.length === 1 ? "prospect" : "prospects"}
            </span>
          </div>
          {onStatusChange && (
            <button
              type="button"
              onClick={() => onStatusChange("all")}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 underline underline-offset-4 transition"
            >
              ← View Full Pipeline (All Stages)
            </button>
          )}
        </div>

        {/* Content Area: Full-Width Responsive Card Grid or Full-Width Empty State */}
        {columnLeads.length > 0 ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {columnLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSelect={onSelectLead}
                onAdvanceStage={onAdvanceStage}
                isDragging={draggedLeadId === lead.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        ) : (
          <div className="w-full rounded-3xl border border-dashed border-neutral-200/90 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <span className={`h-4 w-4 rounded-full ${col.dot}`} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif text-lg font-bold text-neutral-950">
                No Prospects in {col.title}
              </h3>
              <p className="text-xs text-neutral-500 font-light">
                All prospects in this stage have been handled or moved forward in the pipeline.
              </p>
            </div>
            {onStatusChange && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onStatusChange("all")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition shadow-2xs"
                >
                  <span>Return to All Stages</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full Pipeline Kanban Board (All Stages) with Drag-and-Drop
  return (
    <div
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragOverColumnId(null);
        }
      }}
      className="flex gap-4 overflow-x-auto pb-4 scrollbar-none select-none"
    >
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.id);
        const isOver = dragOverColumnId === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`w-72 shrink-0 rounded-2xl p-3 flex flex-col max-h-[75vh] border transition-colors duration-150 ${
              isOver
                ? "bg-neutral-100/95 border-neutral-400 ring-1 ring-neutral-400/50"
                : "bg-neutral-100/60 border-neutral-200/60 hover:bg-neutral-100/80"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-bold text-neutral-900 font-serif">
                  {col.title}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold transition-colors ${col.countBg}`}
              >
                {columnLeads.length}
              </span>
            </div>

            {/* Column Cards Container & Active Drop Target */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
              {isLoading && leads.length === 0 ? (
                <>
                  <div className="rounded-xl border border-neutral-200/80 bg-white p-3 space-y-2 animate-pulse shadow-2xs">
                    <div className="h-4 w-28 bg-neutral-200 rounded" />
                    <div className="h-3 w-36 bg-neutral-100 rounded" />
                    <div className="h-3 w-20 bg-neutral-100 rounded" />
                  </div>
                  <div className="rounded-xl border border-neutral-200/80 bg-white p-3 space-y-2 animate-pulse shadow-2xs">
                    <div className="h-4 w-24 bg-neutral-200 rounded" />
                    <div className="h-3 w-32 bg-neutral-100 rounded" />
                  </div>
                </>
              ) : (
                <>
                  {/* Subtle Drop Target Slot when Hovering Over Populated Column */}
                  {isOver && columnLeads.length > 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white/80 py-3 px-4 text-center text-xs font-semibold text-neutral-600 transition-all flex items-center justify-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 animate-pulse" />
                      <span>Drop to move to {col.title}</span>
                    </div>
                  )}

                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={draggedLeadId && draggedLeadId !== lead.id ? "pointer-events-none" : ""}
                    >
                      <LeadCard
                        lead={lead}
                        onSelect={onSelectLead}
                        onAdvanceStage={onAdvanceStage}
                        isDragging={draggedLeadId === lead.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  ))}

                  {/* Empty Column Drop Zone */}
                  {columnLeads.length === 0 && (
                    <div
                      className={`rounded-2xl border border-dashed p-6 text-center transition-all duration-150 ${
                        isOver
                          ? "border-neutral-400 bg-white/90 text-neutral-800 shadow-2xs"
                          : "border-neutral-300/80 bg-transparent text-neutral-400"
                      }`}
                    >
                      <p className="text-xs font-medium">
                        {isOver ? `Drop to move to ${col.title}` : "No prospects in this stage"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

