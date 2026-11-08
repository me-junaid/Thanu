import React from "react";
import { type TestDriveStatus, type CustomerInterestTier } from "../../app/dashboard/test-drives/actions";
import { Clock, CheckCircle2, Car, CheckCheck, XCircle, UserX, Flame, Zap, Snowflake } from "lucide-react";

interface TestDriveStatusBadgeProps {
  status: TestDriveStatus;
  size?: "sm" | "md";
}

export function TestDriveStatusBadge({ status, size = "md" }: TestDriveStatusBadgeProps) {
  const isSm = size === "sm";
  const sizeClasses = isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  const iconSize = isSm ? "w-3 h-3" : "w-3.5 h-3.5";

  switch (status) {
    case "in_progress":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs ${sizeClasses}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <Car className={iconSize} />
          <span>Active On Road</span>
        </span>
      );

    case "confirmed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 ${sizeClasses}`}
        >
          <CheckCircle2 className={`${iconSize} text-sky-600`} />
          <span>Confirmed</span>
        </span>
      );

    case "scheduled":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 ${sizeClasses}`}
        >
          <Clock className={`${iconSize} text-amber-600`} />
          <span>Scheduled</span>
        </span>
      );

    case "completed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 ${sizeClasses}`}
        >
          <CheckCheck className={`${iconSize} text-neutral-500`} />
          <span>Completed</span>
        </span>
      );

    case "cancelled":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 ${sizeClasses}`}
        >
          <XCircle className={`${iconSize} text-rose-500`} />
          <span>Cancelled</span>
        </span>
      );

    case "no_show":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-orange-50 text-orange-900 border border-orange-200/80 ${sizeClasses}`}
        >
          <UserX className={`${iconSize} text-orange-500`} />
          <span>No Show</span>
        </span>
      );

    default:
      return null;
  }
}

export function InterestTierBadge({ tier }: { tier: CustomerInterestTier | null }) {
  if (!tier) return null;

  switch (tier) {
    case "hot":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
          <span>Hot Intent</span>
        </span>
      );
    case "warm":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
          <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
          <span>Warm Intent</span>
        </span>
      );
    case "cold":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
          <Snowflake className="w-3 h-3 text-neutral-500" />
          <span>Cold Intent</span>
        </span>
      );
  }
}

