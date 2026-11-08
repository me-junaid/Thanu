"use client";

import React from "react";
import {
  type StaffRole,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
} from "../../lib/permissions/types";
import {
  ShieldCheck,
  Shield,
  Users,
  UserCheck,
  Car,
  Receipt,
  Eye,
  HelpCircle,
} from "lucide-react";

export { ROLE_LABELS, ROLE_DESCRIPTIONS };

const ROLE_CONFIGS: Record<
  StaffRole,
  {
    icon: typeof ShieldCheck;
    badgeClass: string;
    iconClass: string;
    dotClass: string;
  }
> = {
  owner: {
    icon: ShieldCheck,
    badgeClass: "border-neutral-900 bg-neutral-900 text-white shadow-2xs",
    iconClass: "text-amber-400",
    dotClass: "bg-amber-400",
  },
  admin: {
    icon: Shield,
    badgeClass: "border-neutral-800 bg-neutral-800 text-neutral-100",
    iconClass: "text-sky-400",
    dotClass: "bg-sky-400",
  },
  sales_manager: {
    icon: Users,
    badgeClass: "border-indigo-200 bg-indigo-50/80 text-indigo-900",
    iconClass: "text-indigo-600",
    dotClass: "bg-indigo-500",
  },
  sales_executive: {
    icon: UserCheck,
    badgeClass: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
    iconClass: "text-emerald-600",
    dotClass: "bg-emerald-500",
  },
  inventory_manager: {
    icon: Car,
    badgeClass: "border-amber-200 bg-amber-50/80 text-amber-900",
    iconClass: "text-amber-600",
    dotClass: "bg-amber-500",
  },
  accountant: {
    icon: Receipt,
    badgeClass: "border-purple-200 bg-purple-50/80 text-purple-900",
    iconClass: "text-purple-600",
    dotClass: "bg-purple-500",
  },
  viewer: {
    icon: Eye,
    badgeClass: "border-neutral-200 bg-neutral-100 text-neutral-700",
    iconClass: "text-neutral-500",
    dotClass: "bg-neutral-400",
  },
};

export interface ShowroomRoleBadgeProps {
  role?: StaffRole | string | null;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

/**
 * Premium automotive-grade role indicator badge.
 * Displays standardized title, custom accent styling, and role icon.
 */
export function ShowroomRoleBadge({
  role = "viewer",
  size = "md",
  showIcon = true,
  className = "",
}: ShowroomRoleBadgeProps) {
  const safeRole: StaffRole = (role && role in ROLE_CONFIGS ? role : "viewer") as StaffRole;
  const config = ROLE_CONFIGS[safeRole] || ROLE_CONFIGS.viewer;
  const label = ROLE_LABELS[safeRole] || "Viewer";
  const IconComponent = config.icon || HelpCircle;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses[size]} ${config.badgeClass} ${className}`}
      title={ROLE_DESCRIPTIONS[safeRole]}
    >
      {showIcon && (
        <IconComponent className={`${iconSizes[size]} shrink-0 ${config.iconClass}`} />
      )}
      <span>{label}</span>
    </span>
  );
}
