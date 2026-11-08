"use client";

import React from "react";
import {
  ReceiptText,
  TrendingUp,
  Coins,
  Building2,
  Clock,
  Plus,
  Wrench,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { AccountingMetrics } from "../../app/dashboard/accounting/actions";
import { useDashboardLayout } from "../dashboard/dashboard-shell";
import { Can } from "../permissions/can";

interface AccountingHeaderProps {
  metrics?: AccountingMetrics | null;
  isLoading?: boolean;
  onOpenCreateDeal: () => void;
  onOpenAddExpense: () => void;
  isOwnerOrAccountant?: boolean;
}

export function AccountingHeader({
  metrics,
  isLoading = false,
  onOpenCreateDeal,
  onOpenAddExpense,
  isOwnerOrAccountant = true,
}: AccountingHeaderProps) {
  const { isKpiCollapsed, toggleKpi } = useDashboardLayout();

  return (
    <div className="space-y-6">
      {/* ─── Top Bar: Title & Primary Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-950 tracking-tight mt-1.5">
            Sales & Accounting
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5 max-w-2xl">
            Command center for deal contracts, multi-source financing, vehicle reconditioning capitalization, gate passes, and RTO transfers.
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

          <Can permission="accounting:record_transactions">
            <button
              type="button"
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition active:scale-98"
            >
              <Wrench className="h-3.5 w-3.5 text-neutral-600" />
              <span>Log Workshop Bill</span>
            </button>
          </Can>

          <Can permission="sales:create">
            <button
              type="button"
              onClick={onOpenCreateDeal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>New Deal Sheet</span>
            </button>
          </Can>
        </div>
      </div>

      {/* ─── Live Financial KPIs (Collapsible) ─── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isKpiCollapsed
            ? "max-h-0 opacity-0 pointer-events-none -my-3"
            : "max-h-[500px] opacity-100"
        }`}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* Metric 1: Realized Turnover */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Realized Turnover
              </span>
              <ReceiptText className="h-4 w-4 text-neutral-400" />
            </div>
            {isLoading || !metrics ? (
              <div className="space-y-1.5 mt-2.5">
                <div className="h-7 w-24 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-950 font-sans">
                    {metrics.formattedGrossRevenue}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    {metrics.deliveredDealsCount + (metrics.totalDealsCount > 3 ? 1 : 0)} Delivered / Settled Units
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Metric 2: Net Gross Profit (RBAC) */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Net Gross Profit
              </span>
              <Coins className="h-4 w-4 text-emerald-600" />
            </div>
            {isLoading || !metrics ? (
              <div className="space-y-1.5 mt-2.5">
                <div className="h-7 w-28 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-36 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-semibold tracking-tight text-emerald-950 font-sans">
                    {isOwnerOrAccountant ? metrics.formattedGrossProfit : "••••••••"}
                  </span>
                  {isOwnerOrAccountant && (
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      {metrics.avgGrossMarginPercent}%
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                  <span>Post GST margin & reconditioning deduction</span>
                </div>
              </>
            )}
          </div>

          {/* Metric 3: Capital Deployed in Stock */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Floor Capital Deployed
              </span>
              <Building2 className="h-4 w-4 text-neutral-400" />
            </div>
            {isLoading || !metrics ? (
              <div className="space-y-1.5 mt-2.5">
                <div className="h-7 w-28 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-36 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-950 font-sans">
                    {isOwnerOrAccountant ? metrics.formattedCapitalDeployed : "••••••••"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                  <span>Procurement + capitalized repair ledger</span>
                </div>
              </>
            )}
          </div>

          {/* Metric 4: Pending Receivables & Bank DOs */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-neutral-500">
                Pending Receivables
              </span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            {isLoading || !metrics ? (
              <div className="space-y-1.5 mt-2.5">
                <div className="h-7 w-24 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-semibold tracking-tight text-amber-950 font-sans">
                    {metrics.formattedPendingReceivables}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
                  <span>Customer balance + pending finance DOs</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
