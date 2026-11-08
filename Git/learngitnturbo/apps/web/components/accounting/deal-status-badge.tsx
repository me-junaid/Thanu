import React from "react";
import { type DealStatus, type RtoTransferStatus } from "../../app/dashboard/accounting/actions";
import {
  FileText,
  Lock,
  Landmark,
  CheckCircle2,
  Car,
  FileClock,
  CheckCheck,
  XCircle,
  FileQuestion,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface DealStatusBadgeProps {
  status: DealStatus;
  size?: "sm" | "md";
}

export function DealStatusBadge({ status, size = "md" }: DealStatusBadgeProps) {
  const isSm = size === "sm";
  const sizeClasses = isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  const iconSize = isSm ? "w-3 h-3" : "w-3.5 h-3.5";

  switch (status) {
    case "draft":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/90 ${sizeClasses}`}
        >
          <FileText className={`${iconSize} text-neutral-400`} />
          <span>Draft Sheet</span>
        </span>
      );

    case "token_booked":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-900 border border-amber-200/90 ${sizeClasses}`}
        >
          <Lock className={`${iconSize} text-amber-600`} />
          <span>Token Booked</span>
        </span>
      );

    case "financing_pending":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-50 text-sky-900 border border-sky-200/90 ${sizeClasses}`}
        >
          <Landmark className={`${iconSize} text-sky-600`} />
          <span>Loan In Review</span>
        </span>
      );

    case "payment_cleared":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-teal-50 text-teal-900 border border-teal-200/90 ${sizeClasses}`}
        >
          <CheckCircle2 className={`${iconSize} text-teal-600`} />
          <span>Payment Cleared</span>
        </span>
      );

    case "delivered":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-950 border border-indigo-200/90 shadow-2xs ${sizeClasses}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
          </span>
          <Car className={`${iconSize} text-indigo-700`} />
          <span>Delivered</span>
        </span>
      );

    case "rto_in_progress":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-900 border border-blue-200/90 ${sizeClasses}`}
        >
          <FileClock className={`${iconSize} text-blue-600`} />
          <span>RTO Processing</span>
        </span>
      );

    case "completed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-950 border border-emerald-200/90 ${sizeClasses}`}
        >
          <CheckCheck className={`${iconSize} text-emerald-600`} />
          <span>Deal Closed</span>
        </span>
      );

    case "cancelled":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-200/90 ${sizeClasses}`}
        >
          <XCircle className={`${iconSize} text-rose-500`} />
          <span>Cancelled</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 ${sizeClasses}`}
        >
          <span>{status}</span>
        </span>
      );
  }
}

interface RtoStatusBadgeProps {
  status: RtoTransferStatus;
  size?: "sm" | "md";
}

export function RtoStatusBadge({ status, size = "md" }: RtoStatusBadgeProps) {
  const isSm = size === "sm";
  const sizeClasses = isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  const iconSize = isSm ? "w-3 h-3" : "w-3.5 h-3.5";

  switch (status) {
    case "pending_docs":
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          <FileQuestion className={iconSize} />
          <span>Docs Pending</span>
        </span>
      );

    case "docs_collected":
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-sky-50 text-sky-800 border border-sky-200 ${sizeClasses}`}
        >
          <FileText className={iconSize} />
          <span>Docs Collected</span>
        </span>
      );

    case "submitted_to_rto":
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 ${sizeClasses}`}
        >
          <FileClock className={iconSize} />
          <span>Submitted to RTO</span>
        </span>
      );

    case "scrutiny_approved":
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-teal-50 text-teal-800 border border-teal-200 ${sizeClasses}`}
        >
          <CheckCircle2 className={iconSize} />
          <span>Scrutiny Approved</span>
        </span>
      );

    case "rc_transferred":
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 ${sizeClasses}`}
        >
          <ShieldCheck className={iconSize} />
          <span>RC Transferred</span>
        </span>
      );

    case "disputed":
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-200 ${sizeClasses}`}
        >
          <AlertTriangle className={iconSize} />
          <span>RTO Disputed</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-neutral-100 text-neutral-700 ${sizeClasses}`}
        >
          <span>{status}</span>
        </span>
      );
  }
}

