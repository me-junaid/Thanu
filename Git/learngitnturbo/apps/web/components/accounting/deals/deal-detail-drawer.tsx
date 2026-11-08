"use client";

import React from "react";
import Image from "next/image";
import { DealStatusBadge, RtoStatusBadge } from "../deal-status-badge";
import { formatINR } from "../../../lib/currency";
import type { SalesDealItem } from "../../../app/dashboard/accounting/actions";
import { Can } from "../../permissions/can";
import {
  X,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Printer,
  Car,
  FileText,
  ShieldCheck,
  User,
  Plus,
  ArrowRight,
  Landmark,
  Clock,
  Sparkles,
} from "lucide-react";

interface DealDetailDrawerProps {
  deal: SalesDealItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (deal: SalesDealItem) => void;
  onIssueGatePass: (deal: SalesDealItem) => void;
  onUpdateRtoStatus: (deal: SalesDealItem) => void;
  onPrintInvoice: (deal: SalesDealItem) => void;
  onPrintTokenReceipt?: (deal: SalesDealItem) => void;
  isOwnerOrAccountant?: boolean;
}

export function DealDetailDrawer({
  deal,
  isOpen,
  onClose,
  onRecordPayment,
  onIssueGatePass,
  onUpdateRtoStatus,
  onPrintInvoice,
  onPrintTokenReceipt,
  isOwnerOrAccountant = true,
}: DealDetailDrawerProps) {
  if (!isOpen || !deal) return null;

  const percentPaid = Math.min(
    100,
    deal.totalDealAmount > 0
      ? Math.round((deal.totalPaid / deal.totalDealAmount) * 100)
      : 0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Drawer Header ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/90 bg-neutral-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {deal.dealNumber}
                </span>
                <DealStatusBadge status={deal.status} size="sm" />
              </div>
              <h2 className="font-serif text-lg font-normal text-neutral-900 mt-0.5">
                Deal Sheet & Financial Dossier
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ─── Scrollable Body ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Vehicle Hero Banner */}
          <div className="flex gap-4 p-4 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
            <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
              <Image
                src={deal.vehicle.heroImage}
                alt={deal.vehicle.model}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-mono font-bold text-neutral-700 uppercase tracking-wider">
                {deal.vehicle.registrationNumber || "Unregistered Stock"}
              </span>
              <h3 className="font-mono text-base font-semibold text-neutral-900 truncate mt-1">
                {deal.vehicle.manufacturingYear} {deal.vehicle.brand} {deal.vehicle.model}
              </h3>
              <p className="text-xs text-neutral-500 truncate mt-0.5">
                {deal.vehicle.variant || "Standard Certified Unit"} • {deal.vehicle.kilometers.toLocaleString("en-IN")} km
              </p>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-lg font-bold text-neutral-950">
                  {deal.formattedTotalDealAmount}
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  Total Deal Value
                </span>
              </div>
            </div>
          </div>

          {/* 2. Buyer Dossier & KYC */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>Customer & KYC Dossier</span>
              </h4>
              <span className="text-[11px] font-mono text-neutral-400">
                Rep: {deal.salesRepName || "General Sales"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-neutral-400 text-[10px] uppercase font-mono">Full Name</span>
                <span className="font-semibold text-neutral-900">{deal.customerName}</span>
              </div>
              <div>
                <span className="block text-neutral-400 text-[10px] uppercase font-mono">Phone Number</span>
                <span className="font-mono font-medium text-neutral-800">{deal.customerPhone}</span>
              </div>
              <div>
                <span className="block text-neutral-400 text-[10px] uppercase font-mono">Email Address</span>
                <span className="text-neutral-700 truncate block">{deal.customerEmail || "Not on file"}</span>
              </div>
              <div>
                <span className="block text-neutral-400 text-[10px] uppercase font-mono">PAN / Identity</span>
                <span className="font-mono font-semibold text-neutral-800">{deal.customerPan || "Pending submission"}</span>
              </div>
            </div>

            {deal.customerAddress && (
              <div className="pt-1 text-xs">
                <span className="block text-neutral-400 text-[10px] uppercase font-mono">Registered Address</span>
                <span className="text-neutral-700">{deal.customerAddress}</span>
              </div>
            )}
          </div>

          {/* 3. Commercial Breakdown */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono border-b border-neutral-100 pb-2 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Commercial Agreement</span>
            </h4>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Agreed Vehicle Selling Price</span>
                <span className="font-mono font-medium text-neutral-900">{deal.formattedSellingPrice}</span>
              </div>

              {deal.rtoTransferCharges > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">RTO Title Transfer Fee</span>
                  <span className="font-mono text-neutral-700">+{formatINR(deal.rtoTransferCharges)}</span>
                </div>
              )}

              {deal.insuranceCharges > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Comprehensive Motor Insurance</span>
                  <span className="font-mono text-neutral-700">+{formatINR(deal.insuranceCharges)}</span>
                </div>
              )}

              {deal.extendedWarrantyFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Extended Warranty Package</span>
                  <span className="font-mono text-neutral-700">+{formatINR(deal.extendedWarrantyFee)}</span>
                </div>
              )}

              {deal.discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Showroom Discount / Waiver</span>
                  <span className="font-mono font-medium">-{formatINR(deal.discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-neutral-200/80 pt-2 font-mono font-bold text-neutral-950 text-sm">
                <span>Total Contracted Amount</span>
                <span>{deal.formattedTotalDealAmount}</span>
              </div>
            </div>
          </div>

          {/* 4. Payment Tranches & Receipts */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5" />
                <span>Payment Reconciliation & Tranches</span>
              </h4>

              {deal.balanceDue > 0 && (
                <Can permission="accounting:record_transactions">
                  <button
                    type="button"
                    onClick={() => onRecordPayment(deal)}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-950 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-neutral-800 transition"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Collect Payment</span>
                  </button>
                </Can>
              )}
            </div>

            {/* Progress Meter */}
            <div className="rounded-xl bg-neutral-50 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-600 font-medium">
                  Received: {deal.formattedTotalPaid}
                </span>
                <span className="font-bold text-neutral-900">
                  {percentPaid}% Cleared
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentPaid === 100 ? "bg-emerald-600" : "bg-neutral-900"
                  }`}
                  style={{ width: `${percentPaid}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="text-neutral-500">Outstanding Balance:</span>
                <span
                  className={`font-bold ${
                    deal.balanceDue === 0 ? "text-emerald-700" : "text-amber-800"
                  }`}
                >
                  {deal.formattedBalanceDue}
                </span>
              </div>
            </div>

            {/* Payment List */}
            <div className="space-y-2">
              {deal.payments.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-2">
                  No payment tranches recorded yet.
                </p>
              ) : (
                deal.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 bg-white text-xs font-mono"
                  >
                    <div>
                      <span className="font-semibold text-neutral-900 block">
                        {p.formattedAmount} • {p.paymentType.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {p.paymentMethod.toUpperCase()} • Ref: {p.transactionRef || "N/A"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span>Cleared</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. Statutory GST Margin & Unit Economics (Gated by accounting:view_pnl) */}
          <Can permission="accounting:view_pnl">
            <div className="rounded-2xl border border-neutral-200/90 bg-neutral-950 text-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Statutory GST Margin & Deal P&L</span>
                </h4>
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                  Rule 32(5) Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="block text-neutral-400 text-[10px]">Purchase Cost</span>
                  <span className="text-neutral-200">{formatINR(deal.vehiclePurchaseCost)}</span>
                </div>
                <div>
                  <span className="block text-neutral-400 text-[10px]">Total Landed Cost</span>
                  <span className="text-neutral-200">{formatINR(deal.vehicleLandedCost)}</span>
                </div>
                <div>
                  <span className="block text-neutral-400 text-[10px]">Taxable Margin</span>
                  <span className="text-neutral-200">{formatINR(deal.taxableMargin)}</span>
                </div>
                <div>
                  <span className="block text-neutral-400 text-[10px]">GST on Margin ({deal.gstRatePercent}%)</span>
                  <span className="text-amber-400">-{formatINR(deal.totalGstOnMargin)}</span>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-2 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-neutral-400 font-mono uppercase">Net Gross Profit</span>
                  <span className="text-base font-mono font-bold text-emerald-400">
                    {deal.formattedGrossProfit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-neutral-400 font-mono uppercase">Margin Yield</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {deal.grossMarginPercent}%
                  </span>
                </div>
              </div>
            </div>
          </Can>

          {/* 6. Handover & Delivery Gate Pass */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5" />
                <span>Showroom Gate Pass & Handover</span>
              </h4>

              {deal.status === "payment_cleared" && !deal.gatePassNumber && (
                <Can permission="sales:create">
                  <button
                    type="button"
                    onClick={() => onIssueGatePass(deal)}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-indigo-700 transition"
                  >
                    <Car className="h-3 w-3" />
                    <span>Issue Gate Pass</span>
                  </button>
                </Can>
              )}

              {deal.gatePassNumber && (
                <button
                  type="button"
                  onClick={() => onIssueGatePass(deal)}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-700 hover:bg-neutral-50 transition"
                >
                  <Printer className="h-2.5 w-2.5" />
                  <span>Print Slip</span>
                </button>
              )}
            </div>

            {deal.gatePassNumber ? (
              <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950">
                    Gate Pass: {deal.gatePassNumber}
                  </span>
                  <span className="text-indigo-700 text-[10px]">
                    {deal.deliveredAt ? new Date(deal.deliveredAt).toLocaleDateString("en-IN") : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-indigo-800">
                  <span>Exit Odometer: {deal.deliveryOdometerKm} km</span>
                  <span>•</span>
                  <span>Fuel: {deal.deliveryFuelLevel}</span>
                </div>
                {deal.deliveryNotes && (
                  <p className="text-[11px] text-indigo-900/80 font-sans mt-1">
                    {deal.deliveryNotes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 py-1">
                Vehicle remains parked on showroom lot. Gate pass requires cleared financial balance or approved bank delivery order.
              </p>
            )}
          </div>

          {/* 7. RTO Title Transfer Tracking */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>RTO Title Transfer Docket</span>
              </h4>

              <Can permission="accounting:record_transactions">
                <button
                  type="button"
                  onClick={() => onUpdateRtoStatus(deal)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700 hover:text-black transition"
                >
                  <span>Update RTO Status</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </Can>
            </div>

            <div className="flex items-center justify-between text-xs">
              <RtoStatusBadge status={deal.rtoStatus} />
              {deal.rtoApplicationNo && (
                <span className="font-mono text-[11px] text-neutral-500">
                  Docket: {deal.rtoApplicationNo}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Drawer Action Footer ─── */}
        <div className="px-6 py-4 border-t border-neutral-200/90 bg-neutral-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onPrintInvoice(deal)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs font-medium text-neutral-800 shadow-2xs hover:bg-neutral-50 transition"
            >
              <Printer className="h-3.5 w-3.5 text-neutral-600" />
              <span>Tax Invoice</span>
            </button>

            {deal.tokenAmount > 0 && onPrintTokenReceipt && (
              <button
                type="button"
                onClick={() => onPrintTokenReceipt(deal)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs font-medium text-neutral-800 shadow-2xs hover:bg-neutral-50 transition"
              >
                <FileText className="h-3.5 w-3.5 text-amber-600" />
                <span>Token Receipt</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

