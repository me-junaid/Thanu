import React from "react";
import type { LeadStatus, LeadPriority, LeadSource } from "../../app/dashboard/leads/actions";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  new: {
    label: "New Inquiry",
    bg: "bg-blue-50",
    text: "text-blue-800",
    dot: "bg-blue-500",
    border: "border-blue-200/80",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-neutral-100",
    text: "text-neutral-800",
    dot: "bg-neutral-500",
    border: "border-neutral-200/80",
  },
  interested: {
    label: "Interested",
    bg: "bg-cyan-50",
    text: "text-cyan-800",
    dot: "bg-cyan-500",
    border: "border-cyan-200/80",
  },
  test_drive_scheduled: {
    label: "Test Drive Booked",
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "bg-amber-500",
    border: "border-amber-200/80",
  },
  negotiation: {
    label: "Negotiation",
    bg: "bg-orange-50",
    text: "text-orange-800",
    dot: "bg-orange-500",
    border: "border-orange-200/80",
  },
  booked: {
    label: "Token Booked",
    bg: "bg-purple-50",
    text: "text-purple-800",
    dot: "bg-purple-500",
    border: "border-purple-200/80",
  },
  converted: {
    label: "Deal Closed / Converted",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    border: "border-emerald-200/80",
  },
  lost: {
    label: "Deal Lost",
    bg: "bg-red-50",
    text: "text-red-800",
    dot: "bg-red-400",
    border: "border-red-200/80",
  },
};

export function LeadStatusBadge({
  status,
  size = "md",
}: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium ${
        config.bg
      } ${config.text} ${config.border} ${
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

export function LeadPriorityBadge({
  priority,
}: {
  priority: LeadPriority;
}) {
  const map: Record<LeadPriority, { label: string; color: string }> = {
    urgent: { label: "Urgent", color: "text-red-700 bg-red-50 border-red-200" },
    high: { label: "High", color: "text-amber-800 bg-amber-50 border-amber-200" },
    medium: { label: "Medium", color: "text-neutral-700 bg-neutral-100 border-neutral-200" },
    low: { label: "Low", color: "text-neutral-500 bg-neutral-50 border-neutral-200" },
  };

  const item = map[priority] || map.medium;

  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${item.color}`}
    >
      {item.label}
    </span>
  );
}

export function LeadSourceBadge({ source }: { source: LeadSource }) {
  const map: Record<LeadSource, string> = {
    website_form: "Website Form",
    whatsapp_direct: "WhatsApp Direct",
    showroom_walkin: "Walk-in Floor",
    phone_call: "Phone Desk",
    referral: "Referral",
    other: "Other",
  };

  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600 font-medium">
      <span className="h-1 w-1 rounded-full bg-neutral-400" />
      <span>{map[source] || source}</span>
    </span>
  );
}

