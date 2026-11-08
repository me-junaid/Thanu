import React from "react";

export type VehicleStatus =
  | "draft"
  | "in_refurbishment"
  | "available"
  | "reserved"
  | "sold"
  | "archived";

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  VehicleStatus,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  available: {
    label: "Floor Available",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    border: "border-emerald-200/80",
  },
  reserved: {
    label: "Reserved (Token)",
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "bg-amber-500",
    border: "border-amber-200/80",
  },
  in_refurbishment: {
    label: "In Refurbishment",
    bg: "bg-blue-50",
    text: "text-blue-800",
    dot: "bg-blue-500",
    border: "border-blue-200/80",
  },
  sold: {
    label: "Delivered / Sold",
    bg: "bg-purple-50",
    text: "text-purple-800",
    dot: "bg-purple-500",
    border: "border-purple-200/80",
  },
  draft: {
    label: "Staging Draft",
    bg: "bg-neutral-100",
    text: "text-neutral-700",
    dot: "bg-neutral-400",
    border: "border-neutral-200",
  },
  archived: {
    label: "Archived",
    bg: "bg-neutral-100",
    text: "text-neutral-500",
    dot: "bg-neutral-400",
    border: "border-neutral-200",
  },
};

export function VehicleStatusBadge({
  status,
  size = "md",
}: VehicleStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.available;

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

