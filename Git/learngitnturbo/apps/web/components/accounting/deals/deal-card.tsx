import React from "react";
import Image from "next/image";
import { DealStatusBadge, RtoStatusBadge } from "../deal-status-badge";
import { formatINR } from "../../../lib/currency";
import type { SalesDealItem } from "../../../app/dashboard/accounting/actions";
import {
  User,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface DealCardProps {
  deal: SalesDealItem;
  onClick: (deal: SalesDealItem) => void;
  onRecordPayment?: (deal: SalesDealItem) => void;
  onIssueGatePass?: (deal: SalesDealItem) => void;
}

export function DealCard({
  deal,
  onClick,
  onRecordPayment,
  onIssueGatePass,
}: DealCardProps) {
  const percentPaid = Math.min(
    100,
    deal.totalDealAmount > 0
      ? Math.round((deal.totalPaid / deal.totalDealAmount) * 100)
      : 0
  );

  return (
    <div
      onClick={() => onClick(deal)}
      className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs hover:border-neutral-300 hover:shadow-xs transition cursor-pointer"
    >
      <div className="space-y-3">
        {/* ─── Top Row: Deal ID & Status Badges ─── */}
        <div className="flex items-center justify-between gap-1.5">
          <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
            {deal.dealNumber}
          </span>
          <DealStatusBadge status={deal.status} size="sm" />
        </div>

        {/* ─── Vehicle Header: Thumbnail & Specs ─── */}
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
            <Image
              src={deal.vehicle.heroImage}
              alt={deal.vehicle.model}
              fill
              className="object-cover group-hover:scale-105 transition duration-500"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs font-semibold text-neutral-900 group-hover:text-black">
              {deal.vehicle.manufacturingYear} {deal.vehicle.brand} {deal.vehicle.model}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] font-medium text-neutral-400">
                {deal.vehicle.registrationNumber || "Unregistered"}
              </span>
              {deal.status === "delivered" && (
                <span className="text-[8px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-semibold">
                  Gate Pass Active
                </span>
              )}
            </div>
            <p className="font-mono text-sm font-semibold text-neutral-950 mt-1">
              {deal.formattedTotalDealAmount}
            </p>
          </div>
        </div>

        {/* ─── Customer Details ─── */}
        <div className="rounded-xl bg-neutral-50 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-900 truncate">
              {deal.customerName}
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              {deal.customerPhone}
            </span>
          </div>

          {deal.isFinanced && (
            <div className="flex items-center gap-1 text-[10px] text-sky-700 font-medium">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {deal.financierName || "Bank Loan"} • Sanction: {formatINR(deal.loanSanctionedAmount)}
              </span>
            </div>
          )}
        </div>

        {/* ─── Financial Progress Meter ─── */}
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-500">
              Paid: {deal.formattedTotalPaid}
            </span>
            <span className="font-semibold text-neutral-800">
              {percentPaid}%
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentPaid === 100
                  ? "bg-emerald-600"
                  : percentPaid > 0
                  ? "bg-neutral-900"
                  : "bg-neutral-200"
              }`}
              style={{ width: `${percentPaid}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-0.5 text-[10px] font-mono">
            <span className="text-neutral-400">
              Balance:
            </span>
            <span
              className={`font-semibold ${
                deal.balanceDue === 0 ? "text-emerald-700" : "text-amber-800"
              }`}
            >
              {deal.formattedBalanceDue}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Footer: RTO status & Sales Rep ─── */}
      <div className="mt-3.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
        <div className="flex items-center gap-1 truncate">
          <User className="h-3 w-3 text-neutral-400 shrink-0" />
          <span className="truncate">{deal.salesRepName || "Sales Rep"}</span>
        </div>

        {deal.rtoStatus && (
          <RtoStatusBadge status={deal.rtoStatus} size="sm" />
        )}
      </div>
    </div>
  );
}

