"use client";

import React from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  TrendingUp,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { TestDrivesStats } from "../../app/dashboard/test-drives/actions";
import { useDashboardLayout } from "../dashboard/dashboard-shell";
import { Can } from "../permissions/can";

interface TestDrivesHeaderProps {
  stats?: TestDrivesStats | null;
  isLoading?: boolean;
  onOpenScheduleModal: () => void;
}

export function TestDrivesHeader({
  stats,
  isLoading = false,
  onOpenScheduleModal,
}: TestDrivesHeaderProps) {
  const { isKpiCollapsed, toggleKpi } = useDashboardLayout();

  return (
    <div className="space-y-6">
      {/* ─── Top Bar: Title & Primary Action ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-950 tracking-tight mt-1.5">
            Test Drive Operations
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Coordinate appointments, issue digital gate passes, verify licenses, and record post-drive customer evaluation.
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

          <Can permission="test_drives:schedule">
            <button
              type="button"
              onClick={onOpenScheduleModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Test Drive</span>
            </button>
          </Can>
        </div>
      </div>

      {/* ─── Live KPI Metrics (Collapsible) ─── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isKpiCollapsed
            ? "max-h-0 opacity-0 pointer-events-none -my-3"
            : "max-h-[500px] opacity-100"
        }`}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* Metric 1: Today's Appointments */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Today's Schedule
              </span>
              <CalendarCheck2 className="h-4 w-4 text-neutral-700" />
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-20 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-neutral-950 mt-1">
                  {stats.totalToday} Drives
                </p>
                <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                  {stats.upcomingConfirmed} confirmed • Showroom floor
                </p>
              </>
            )}
          </div>

          {/* Metric 2: Active On Road */}
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-emerald-800">
                Active On Road
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-20 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-28 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-emerald-950 mt-1">
                  {stats.activeOnRoad} Vehicles
                </p>
                <p className="text-[11px] text-emerald-700 font-light mt-0.5">
                  Gate pass rollout active
                </p>
              </>
            )}
          </div>

          {/* Metric 3: Completed This Week */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Completed
              </span>
              <CheckCircle2 className="h-4 w-4 text-neutral-700" />
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-24 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-28 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-neutral-950 mt-1">
                  {stats.completedThisWeek} Completed
                </p>
                <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                  This week • Return verified
                </p>
              </>
            )}
          </div>

          {/* Metric 4: Conversion Rate */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Conversion Rate
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-16 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-emerald-900 mt-1">
                  {stats.conversionRatePercent}%
                </p>
                <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                  Drive to Token / Hot Intent
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
