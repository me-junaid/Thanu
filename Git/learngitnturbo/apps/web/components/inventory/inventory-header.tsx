"use client";

import React from "react";
import {
  Car,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import type { InventoryStats } from "../../app/dashboard/inventory/actions";
import { useDashboardLayout } from "../dashboard/dashboard-shell";
import { Can } from "../permissions/can";

interface InventoryHeaderProps {
  stats?: InventoryStats | null;
  isLoading?: boolean;
  onOpenAddModal: () => void;
  dealershipName?: string;
}

export function InventoryHeader({
  stats,
  isLoading = false,
  onOpenAddModal,
  dealershipName = "Showroom Floor",
}: InventoryHeaderProps) {
  const { isKpiCollapsed, toggleKpi } = useDashboardLayout();

  return (
    <div className="space-y-6">
      {/* ─── Top Bar: Title & Action Buttons ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-950 tracking-tight mt-1.5">
            Fleet Inventory
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Real-time procurement, margin economics, certification lifecycle, and public storefront synchronization.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
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

          <Link
            href="/inventory"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 hover:text-neutral-950 transition active:scale-98"
          >
            <span>Public Storefront</span>
            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
          </Link>

          <Can permission="inventory:create">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
          </Can>
        </div>
      </div>

      {/* ─── KPI Metric Cards (Collapsible) ─── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isKpiCollapsed
            ? "max-h-0 opacity-0 pointer-events-none -my-3"
            : "max-h-[500px] opacity-100"
        }`}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* Metric 1: Total Fleet */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Total Fleet
              </span>
              <Car className="h-4 w-4 text-neutral-700" />
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-24 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-neutral-950 mt-1">
                  {stats.totalCount} Cars
                </p>
                <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                  {stats.availableCount} on floor • {stats.reservedCount} reserved
                </p>
              </>
            )}
          </div>

          {/* Metric 2: Floor Available */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Ready for Delivery
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            {isLoading || !stats ? (
              <div className="space-y-1.5 mt-2">
                <div className="h-7 w-24 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="font-sans text-2xl font-bold text-emerald-950 mt-1">
                  {stats.availableCount} Available
                </p>
                <p className="text-[11px] text-emerald-700 font-light mt-0.5">
                  100% Certified & Inspected
                </p>
              </>
            )}
          </div>

          {/* Metric 3: Total Invested Capital (Gated by inventory:view_financials) */}
          <Can
            permission="inventory:view_financials"
            fallback={
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                    Floor Allocation
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-neutral-600" />
                </div>
                <p className="font-sans text-2xl font-bold text-neutral-950 mt-1">
                  {stats ? `${stats.availableCount} Ready` : "—"}
                </p>
                <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                  Certified & Inspected Lot
                </p>
              </div>
            }
          >
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                  Invested Capital
                </span>
                <DollarSign className="h-4 w-4 text-neutral-700" />
              </div>
              {isLoading || !stats ? (
                <div className="space-y-1.5 mt-2">
                  <div className="h-7 w-28 bg-neutral-200 rounded-lg animate-pulse" />
                  <div className="h-3 w-36 bg-neutral-100 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="font-sans text-2xl font-bold text-neutral-950 mt-1">
                    {stats.formattedInvestedCapital}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                    Procurement + Refurbishment
                  </p>
                </>
              )}
            </div>
          </Can>

          {/* Metric 4: Projected Margin (Gated by inventory:view_financials) */}
          <Can
            permission="inventory:view_financials"
            fallback={
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                    Customer Holds
                  </span>
                  <Car className="h-4 w-4 text-amber-600" />
                </div>
                <p className="font-sans text-2xl font-bold text-neutral-950 mt-1">
                  {stats ? `${stats.reservedCount} Reserved` : "—"}
                </p>
                <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                  Under Active Negotiation
                </p>
              </div>
            }
          >
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                  Projected Gross Margin
                </span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              {isLoading || !stats ? (
                <div className="space-y-1.5 mt-2">
                  <div className="h-7 w-28 bg-neutral-200 rounded-lg animate-pulse" />
                  <div className="h-3 w-36 bg-neutral-100 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="font-sans text-2xl font-bold text-neutral-950 mt-1">
                    {stats.formattedProjectedMargin}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold font-mono mt-0.5">
                    {stats.averageMarginPercentage}% estimated margin
                  </p>
                </>
              )}
            </div>
          </Can>
        </div>
      </div>
    </div>
  );
}
