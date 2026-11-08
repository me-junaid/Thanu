"use client";

import React from "react";
import {
  X,
  Printer,
  Sparkles,
  Lock,
  CheckCircle2,
} from "lucide-react";
import type { SalesDealItem } from "../../../app/dashboard/accounting/actions";
import { formatINR } from "../../../lib/currency";

interface TokenReceiptModalProps {
  isOpen: boolean;
  deal: SalesDealItem | null;
  onClose: () => void;
}

export function TokenReceiptModal({
  isOpen,
  deal,
  onClose,
}: TokenReceiptModalProps) {
  if (!isOpen || !deal) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = deal.tokenReceiptNumber || `TKN-${deal.dealNumber.replace("DL-", "")}`;
  const receiptDate = deal.tokenPaidAt
    ? new Date(deal.tokenPaidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-200/80 bg-neutral-50/80 print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-neutral-900">Token Receipt Preview</span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-500">Official Booking Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher */}
        <div className="p-8 space-y-6 text-neutral-950 bg-white max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-neutral-950 pb-5">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight uppercase">
                Apex Motors
              </h1>
              <p className="text-[11px] text-neutral-600 font-sans">
                Official Booking & Inventory Reservation Receipt
              </p>
              <p className="text-[10px] font-mono text-neutral-500 mt-1">
                Indiranagar 100ft Road, Bengaluru, Karnataka • GSTIN: 29AABCU9821K1ZM
              </p>
            </div>

            <div className="text-right font-mono">
              <span className="inline-block rounded-md bg-amber-500/20 text-amber-950 border border-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                TOKEN RECEIPT
              </span>
              <p className="text-xs font-bold text-neutral-900 mt-2">
                Receipt: {receiptNumber}
              </p>
              <p className="text-[11px] text-neutral-500">
                Date: {receiptDate}
              </p>
            </div>
          </div>

          {/* Received From & Vehicle */}
          <div className="grid grid-cols-2 gap-6 text-xs border-b border-neutral-200 pb-5">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Received With Thanks From:
              </span>
              <p className="font-bold text-neutral-900 text-sm">{deal.customerName}</p>
              <p className="font-mono text-neutral-700">Phone: {deal.customerPhone}</p>
              <p className="text-neutral-600 truncate">{deal.customerEmail || "No email on record"}</p>
              {deal.customerPan && (
                <p className="font-mono text-neutral-700">PAN: {deal.customerPan}</p>
              )}
            </div>

            <div className="space-y-1 font-mono">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Reserved Vehicle Unit:
              </span>
              <p className="font-sans font-bold text-neutral-900 text-sm">
                {deal.vehicle.manufacturingYear} {deal.vehicle.brand} {deal.vehicle.model}
              </p>
              <p className="text-neutral-700">
                Reg No: <strong>{deal.vehicle.registrationNumber || "Unregistered Unit"}</strong>
              </p>
              <p className="text-neutral-500 text-[11px]">
                Contract Total: {deal.formattedTotalDealAmount}
              </p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="rounded-2xl border-2 border-neutral-900 bg-neutral-50 p-6 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                Booking Token Amount Received
              </span>
              <span className="font-serif text-3xl font-bold text-neutral-950">
                {deal.formattedTokenAmount}
              </span>
              <span className="font-mono text-xs text-neutral-600 block mt-1">
                Status: Verified & Cleared Into Showroom Account
              </span>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-neutral-400 uppercase block">Remaining Balance</span>
              <span className="text-lg font-bold text-amber-900 block font-serif">
                {deal.formattedBalanceDue}
              </span>
              <span className="text-[10px] text-neutral-500">
                Due before vehicle rollout
              </span>
            </div>
          </div>

          {/* Reservation Commitment & Terms */}
          <div className="space-y-2 text-[10px] text-neutral-600 font-sans leading-relaxed border-b border-neutral-200 pb-5">
            <span className="font-mono font-bold text-neutral-900 uppercase block text-[11px]">
              Reservation Terms & Commitment:
            </span>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Inventory Lock:</strong> Upon receipt of this token advance, the motor vehicle is immediately marked as <em>'Reserved'</em> in showroom inventory and removed from public digital discovery for a period of 14 calendar days.
              </li>
              <li>
                <strong>Financing & Disbursement:</strong> If the transaction involves bank loan financing, the customer agrees to submit all necessary KYC documentation within 5 business days to expedite the Delivery Order (DO).
              </li>
              <li>
                <strong>Final Clearance:</strong> Full remaining settlement must be cleared prior to issuance of the Delivery Gate Pass and physical rollout of the vehicle.
              </li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-xs font-mono">
            <div className="border-t border-neutral-900 pt-2 text-center">
              <span className="block font-semibold text-neutral-900">Customer Signatory</span>
              <span className="text-[10px] text-neutral-400">Buyer Acknowledgement</span>
            </div>
            <div className="border-t border-neutral-900 pt-2 text-center">
              <span className="block font-semibold text-neutral-900">Apex Motors</span>
              <span className="text-[10px] text-neutral-400">Authorized Sales Representative</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

