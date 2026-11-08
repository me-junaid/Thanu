import React from "react";
import Image from "next/image";
import {
  Phone,
  MessageCircle,
  Clock,
  Car,
  User,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { LeadPriorityBadge, LeadSourceBadge } from "./lead-status-badge";
import type { LeadItem, LeadStatus } from "../../app/dashboard/leads/actions";

interface LeadCardProps {
  lead: LeadItem;
  onSelect: (lead: LeadItem) => void;
  onAdvanceStage?: (leadId: string, nextStatus: LeadStatus) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, lead: LeadItem) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const STAGE_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "interested",
  "test_drive_scheduled",
  "negotiation",
  "booked",
  "converted",
];

export function LeadCard({
  lead,
  onSelect,
  onAdvanceStage,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: LeadCardProps) {
  const isDraggingInternalRef = React.useRef(false);

  const currentIndex = STAGE_ORDER.indexOf(lead.status);
  const nextStage =
    currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1
      ? STAGE_ORDER[currentIndex + 1]
      : null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    isDraggingInternalRef.current = true;
    onDragStart?.(e, lead);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setTimeout(() => {
      isDraggingInternalRef.current = false;
    }, 100);
    onDragEnd?.(e);
  };

  const handleClick = () => {
    if (isDraggingInternalRef.current) return;
    onSelect(lead);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`group rounded-2xl border p-3.5 transition-all duration-150 select-none space-y-3 ${
        isDragging
          ? "opacity-25 border-dashed border-neutral-400 bg-neutral-100/70 shadow-none"
          : "border-neutral-200/90 bg-white shadow-2xs hover:shadow-md hover:border-neutral-300 cursor-grab active:cursor-grabbing"
      }`}
    >
      {/* ─── Top Row: Name, Priority, Due Alert ─── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-serif text-sm font-bold text-neutral-950 group-hover:text-neutral-700 transition">
              {lead.customerName}
            </h4>
            {lead.isFollowupDue && (
              <span
                title="Follow-up due today"
                className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"
              />
            )}
          </div>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {lead.phoneNumber}
          </p>
        </div>

        <LeadPriorityBadge priority={lead.priority} />
      </div>

      {/* ─── Interested Vehicle Tag (Crucial for Automotive) ─── */}
      {lead.vehicle ? (
        <div className="flex items-center gap-2.5 rounded-xl bg-neutral-50 p-2 border border-neutral-100">
          <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-200">
            <Image
              src={lead.vehicle.heroImage}
              alt={`${lead.vehicle.brand} ${lead.vehicle.model}`}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-neutral-900 truncate">
              {lead.vehicle.manufacturingYear} {lead.vehicle.brand} {lead.vehicle.model}
            </p>
            <p className="text-[10px] font-serif font-semibold text-neutral-700">
              {lead.vehicle.formattedPrice}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 italic py-1">
          <Car className="h-3 w-3" />
          <span>General Showroom Inquiry</span>
        </div>
      )}

      {/* ─── Budget & Source ─── */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100">
        <div>
          <span className="text-[9px] uppercase font-mono text-neutral-400 block">
            Budget
          </span>
          <span className="font-mono font-semibold text-neutral-900">
            {lead.formattedBudget || "Not Specified"}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[9px] uppercase font-mono text-neutral-400 block">
            Source
          </span>
          <LeadSourceBadge source={lead.source} />
        </div>
      </div>

      {/* ─── Card Footer: Assigned Sales Rep & Advance Action ─── */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px] text-neutral-500">
        <div className="flex items-center gap-1.5 truncate">
          <User className="h-3 w-3 text-neutral-400 shrink-0" />
          <span className="truncate">{lead.assignedStaffName}</span>
        </div>

        {nextStage && onAdvanceStage && (
          <button
            type="button"
            draggable={false}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceStage(lead.id, nextStage);
            }}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-900 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-lg px-2 py-0.5 transition"
          >
            <span>Advance</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

