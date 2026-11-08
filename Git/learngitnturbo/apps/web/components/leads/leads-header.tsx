"use client";

import React from "react";
import {
  Users2,
  CalendarCheck2,
  Clock,
  TrendingUp,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LeadsStats } from "../../app/dashboard/leads/actions";
import { useDashboardLayout } from "../dashboard/dashboard-shell";
import { Can } from "../permissions/can";

interface LeadsHeaderProps {
  stats?: LeadsStats | null;
  isLoading?: boolean;
  onOpenCreateModal: () => void;
  dealershipName?: string;
}

export function LeadsHeader({
  stats,
  isLoading = false,
  onOpenCreateModal,
  dealershipName = "Showroom Floor",
}: LeadsHeaderProps) {
  const { isKpiCollapsed, toggleKpi } = useDashboardLayout();

  return (
    <div className="space-y-6">
      {/* ─── Top Bar: Title & Primary CTA ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-950 tracking-tight mt-1.5">
            Leads & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light mt-0.5">
            Track prospect outreach, showroom walk-ins, scheduled test drives, and vehicle token bookings.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleKpi}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition active:scale-98"
            title={isKpiCollapsed ? "Show summary metrics" : "Hide summary metrics"}
            aria-label={isKpiCollapsed ? "Show summary metrics" : "Hide summary metrics"}
          >
            {isKpiCollapsed ? (
              <>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                <span>Show Metrics</span>
              </>
            ) : (
              <>
                <ChevronUp className="h-3.5 w-3.5 text-neutral-500" />
                <span>Hide Metrics</span>
              </>
            )}
          </button>

          <Can permission="leads:create">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>New Lead / Walk-in</span>
            </button>
          </Can>
        </div>
      </div>

      {/* ─── KPI Metrics (Collapsible) ─── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isKpiCollapsed
            ? "max-h-0 opacity-0 pointer-events-none -my-3"
            : "max-h-[500px] opacity-100"
        }`}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* Metric 1: Active Inquiries */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Active Pipeline
              </span>
              <Users2 className="h-4 w-4 text-neutral-700" />
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-24 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-neutral-950 mt-1">
                  {stats.totalActive} Prospects
                </p>
                <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                  {stats.newCount} fresh • {stats.negotiationCount} in negotiation
                </p>
              </>
            )}
          </div>

          {/* Metric 2: Scheduled Test Drives */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Test Drives Scheduled
              </span>
              <CalendarCheck2 className="h-4 w-4 text-amber-600" />
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-24 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-amber-950 mt-1">
                  {stats.testDriveCount} Appointments
                </p>
                <p className="text-[11px] text-amber-700 font-light mt-0.5">
                  Showroom floor evaluation
                </p>
              </>
            )}
          </div>

          {/* Metric 3: Follow-ups Due Today */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Follow-ups Due
              </span>
              <Clock className="h-4 w-4 text-red-600" />
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-20 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-36 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-red-950 mt-1">
                  {stats.followupsDueToday} Today
                </p>
                <p className="text-[11px] text-red-700 font-light mt-0.5">
                  Awaiting sales rep call / WhatsApp
                </p>
              </>
            )}
          </div>

          {/* Metric 4: Pipeline Valuation */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Pipeline Value
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-28 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-neutral-950 mt-1">
                  {stats.formattedPipelineValue}
                </p>
                <p className="text-[11px] text-emerald-700 font-mono font-semibold mt-0.5">
                  {stats.bookedCount} token deposits received
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
