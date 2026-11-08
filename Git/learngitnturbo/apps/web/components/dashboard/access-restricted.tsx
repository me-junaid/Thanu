"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import type { PermissionKey } from "../../lib/permissions/types";

export interface AccessRestrictedProps {
  title?: string;
  description?: string;
  requiredPermission?: PermissionKey;
  returnHref?: string;
  returnLabel?: string;
}

/**
 * Enterprise-grade 403 Access Denied presentation screen.
 * Displayed when an authenticated user attempts to access a protected route without required capabilities.
 */
export function AccessRestricted({
  title = "Access Restricted",
  description = "Your current account access tier does not have permission to access this showroom workspace. Please contact your Showroom Principal or General Manager if you believe this is an error.",
  requiredPermission,
  returnHref = "/dashboard",
  returnLabel = "Return to Command Center",
}: AccessRestrictedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200/90 bg-white p-8 text-center shadow-xl shadow-neutral-900/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl font-serif">
          {title}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed font-light">
          {description}
        </p>

        {requiredPermission && (
          <div className="mt-3 inline-block rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-[10px] text-neutral-600">
            Capability Required: {requiredPermission}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-neutral-100">
          <Link
            href={returnHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{returnLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

