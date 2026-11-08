import React from "react";
import Image from "next/image";
import { DealStatusBadge, RtoStatusBadge } from "../deal-status-badge";
import { formatINR } from "../../../lib/currency";
import type { SalesDealItem } from "../../../app/dashboard/accounting/actions";
import {
  CreditCard,
  Building2,
  ChevronRight,
  Car,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface DealsTableProps {
  deals: SalesDealItem[];
  isLoading?: boolean;
  onSelectDeal: (deal: SalesDealItem) => void;
  onRecordPayment: (deal: SalesDealItem) => void;
  onIssueGatePass: (deal: SalesDealItem) => void;
}

export function DealsTable({
  deals,
  isLoading = false,
  onSelectDeal,
  onRecordPayment,
  onIssueGatePass,
}: DealsTableProps) {
  if (isLoading && deals.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200/90 bg-neutral-50/80 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Deal #</th>
                <th scope="col" className="px-4 py-3 font-semibold">Vehicle</th>
                <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-4 py-3 font-semibold">Deal Value</th>
                <th scope="col" className="px-4 py-3 font-semibold">Payment Progress</th>
                <th scope="col" className="px-4 py-3 font-semibold">Financing</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">RTO Transfer</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-16 bg-neutral-200 rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-12 rounded-lg bg-neutral-200 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-neutral-200 rounded" />
                        <div className="h-2.5 w-20 bg-neutral-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-24 bg-neutral-200 rounded" />
                      <div className="h-2.5 w-16 bg-neutral-100 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-20 bg-neutral-200 rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-2 w-24 bg-neutral-200 rounded-full" />
                      <div className="h-2.5 w-16 bg-neutral-100 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-5 w-16 bg-neutral-200 rounded-md" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-5 w-20 bg-neutral-200 rounded-md" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-5 w-16 bg-neutral-200 rounded-md" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="h-6 w-14 bg-neutral-200 rounded ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200/90 bg-white p-12 text-center shadow-2xs">
        <Car className="h-10 w-10 text-neutral-300 stroke-1" />
        <h3 className="font-serif text-lg font-normal text-neutral-900 mt-3">
          No Sales Deals Found
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mt-1">
          No deals match your search criteria or status filter. Create a new deal sheet or clear active filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="border-b border-neutral-200/90 bg-neutral-50/80 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Deal #</th>
              <th scope="col" className="px-4 py-3 font-semibold">Vehicle</th>
              <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
              <th scope="col" className="px-4 py-3 font-semibold">Deal Value</th>
              <th scope="col" className="px-4 py-3 font-semibold">Payment Progress</th>
              <th scope="col" className="px-4 py-3 font-semibold">Financing</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">RTO Transfer</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-neutral-100">
            {deals.map((deal) => {
              const percentPaid = Math.min(
                100,
                deal.totalDealAmount > 0
                  ? Math.round((deal.totalPaid / deal.totalDealAmount) * 100)
                  : 0
              );

              return (
                <tr
                  key={deal.id}
                  onClick={() => onSelectDeal(deal)}
                  className="group hover:bg-neutral-50/70 transition cursor-pointer"
                >
                  {/* Deal # */}
                  <td className="px-4 py-3 font-mono font-bold text-neutral-900 whitespace-nowrap">
                    {deal.dealNumber}
                    <span className="block text-[10px] font-normal text-neutral-400">
                      {new Date(deal.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>

                  {/* Vehicle */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-100">
                        <Image
                          src={deal.vehicle.heroImage}
                          alt={deal.vehicle.model}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-semibold text-neutral-900 truncate">
                          {deal.vehicle.brand} {deal.vehicle.model}
                        </span>
                        <span className="block font-mono text-[10px] text-neutral-400">
                          {deal.vehicle.registrationNumber || "Unregistered"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <span className="block font-medium text-neutral-900 truncate">
                      {deal.customerName}
                    </span>
                    <span className="block font-mono text-[10px] text-neutral-500">
                      {deal.customerPhone}
                    </span>
                  </td>

                  {/* Deal Value */}
                  <td className="px-4 py-3 whitespace-nowrap font-sans font-semibold text-neutral-950">
                    {deal.formattedTotalDealAmount}
                    <span className="block font-mono text-[10px] text-neutral-400 font-normal">
                      Agreed: {deal.formattedSellingPrice}
                    </span>
                  </td>

                  {/* Payment Progress */}
                  <td className="px-4 py-3 min-w-[150px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-neutral-500">
                          {deal.formattedTotalPaid}
                        </span>
                        <span className="font-semibold text-neutral-800">
                          {percentPaid}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percentPaid === 100
                              ? "bg-emerald-600"
                              : "bg-neutral-900"
                          }`}
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono">
                        <span className="text-neutral-400">Bal: </span>
                        <span
                          className={`font-semibold ${
                            deal.balanceDue === 0
                              ? "text-emerald-700"
                              : "text-amber-800"
                          }`}
                        >
                          {deal.formattedBalanceDue}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Financing */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {deal.isFinanced ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-800">
                          <Building2 className="h-3 w-3" />
                          <span>{deal.financierName || "Bank Loan"}</span>
                        </span>
                        <span className="block font-mono text-[10px] text-neutral-400">
                          Sanction: {formatINR(deal.loanSanctionedAmount)}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 font-mono">
                        Direct Settlement
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <DealStatusBadge status={deal.status} size="sm" />
                  </td>

                  {/* RTO Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RtoStatusBadge status={deal.rtoStatus} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDeal(deal);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/90 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 transition"
                    >
                      <span>Review</span>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

