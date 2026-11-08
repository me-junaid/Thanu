import React from "react";
import { DealCard } from "./deal-card";
import { formatINR } from "../../../lib/currency";
import type { SalesDealItem, DealStatus } from "../../../app/dashboard/accounting/actions";
import { Layers } from "lucide-react";

interface DealsKanbanProps {
  deals: SalesDealItem[];
  isLoading?: boolean;
  onSelectDeal: (deal: SalesDealItem) => void;
  onRecordPayment: (deal: SalesDealItem) => void;
  onIssueGatePass: (deal: SalesDealItem) => void;
}

interface ColumnConfig {
  id: string;
  title: string;
  statuses: DealStatus[];
  dotColor: string;
}

const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: "col-token",
    title: "Token Booked",
    statuses: ["token_booked", "draft"],
    dotColor: "bg-amber-500",
  },
  {
    id: "col-finance",
    title: "Financing / Loan",
    statuses: ["financing_pending"],
    dotColor: "bg-sky-500",
  },
  {
    id: "col-cleared",
    title: "Payment Cleared",
    statuses: ["payment_cleared"],
    dotColor: "bg-teal-500",
  },
  {
    id: "col-delivered",
    title: "Delivered (Gate Pass)",
    statuses: ["delivered"],
    dotColor: "bg-indigo-500",
  },
  {
    id: "col-rto",
    title: "RTO Transfer",
    statuses: ["rto_in_progress"],
    dotColor: "bg-blue-500",
  },
  {
    id: "col-completed",
    title: "Completed",
    statuses: ["completed"],
    dotColor: "bg-emerald-500",
  },
];

export function DealsKanban({
  deals,
  isLoading = false,
  onSelectDeal,
  onRecordPayment,
  onIssueGatePass,
}: DealsKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[580px] max-w-full">
      {KANBAN_COLUMNS.map((column) => {
        const columnDeals = deals.filter((d) =>
          column.statuses.includes(d.status)
        );

        const columnVolume = columnDeals.reduce(
          (sum, d) => sum + d.totalDealAmount,
          0
        );

        return (
          <div
            key={column.id}
            className="flex flex-col flex-1 min-w-[350px] max-w-[350px] shrink-0 rounded-2xl bg-neutral-100/60 border border-neutral-200/70 p-3"
          >
            {/* ─── Column Header ─── */}
            <div className="flex items-center justify-between pb-2.5 px-1 border-b border-neutral-200/60 mb-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${column.dotColor}`} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 font-mono">
                  {column.title}
                </h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-700 font-mono border border-neutral-200 shadow-2xs">
                  {columnDeals.length}
                </span>
              </div>

              {columnVolume > 0 && (
                <span className="text-[10px] font-mono font-medium text-neutral-500">
                  {formatINR(columnVolume)}
                </span>
              )}
            </div>

            {/* ─── Deals Stack ─── */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
              {columnDeals.length === 0 ? (
                isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-neutral-200/80 bg-white p-3 space-y-2.5 animate-pulse shadow-2xs"
                      >
                        <div className="h-3 w-20 bg-neutral-200 rounded" />
                        <div className="h-4 w-36 bg-neutral-200 rounded" />
                        <div className="flex justify-between items-center pt-2">
                          <div className="h-3 w-16 bg-neutral-100 rounded" />
                          <div className="h-3 w-12 bg-neutral-100 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white/50 p-4 text-center">
                    <Layers className="h-5 w-5 text-neutral-300" />
                    <p className="mt-1 text-xs text-neutral-400">
                      No active deals in stage
                    </p>
                  </div>
                )
              ) : (
                columnDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onClick={onSelectDeal}
                    onRecordPayment={onRecordPayment}
                    onIssueGatePass={onIssueGatePass}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

