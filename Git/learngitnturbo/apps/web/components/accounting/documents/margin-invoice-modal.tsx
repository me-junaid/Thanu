"use client";

import React from "react";
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  FileText,
} from "lucide-react";
import type { SalesDealItem } from "../../../app/dashboard/accounting/actions";
import { formatINR } from "../../../lib/currency";

interface MarginInvoiceModalProps {
  isOpen: boolean;
  deal: SalesDealItem | null;
  onClose: () => void;
}

export function MarginInvoiceModal({
  isOpen,
  deal,
  onClose,
}: MarginInvoiceModalProps) {
  if (!isOpen || !deal) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${deal.dealNumber.replace("DL-", "")}`;
  const invoiceDate = deal.deliveredAt
    ? new Date(deal.deliveredAt).toLocaleDateString("en-IN", {
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
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-200/80 bg-neutral-50/80 print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-neutral-900">Tax Invoice Preview</span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-500">Statutory GST Margin Scheme</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
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

        {/* Printable Tax Invoice Container */}
        <div className="p-8 space-y-6 text-neutral-950 bg-white max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          {/* 1. Header Banner */}
          <div className="flex items-start justify-between border-b-2 border-neutral-950 pb-5">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight uppercase">
                Apex Motors
              </h1>
              <p className="text-[11px] text-neutral-600 font-sans mt-0.5">
                Premium Pre-Owned Automobile Dealership
              </p>
              <p className="text-[10px] font-mono text-neutral-500 mt-1 max-w-sm">
                Plot #42, Indiranagar 100ft Road, HAL 2nd Stage, Bengaluru, Karnataka — 560038
              </p>
              <p className="text-[10px] font-mono text-neutral-600 font-semibold mt-0.5">
                GSTIN: 29AABCU9821K1ZM • State: Karnataka (Code: 29)
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-md bg-neutral-950 text-white px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider">
                TAX INVOICE
              </span>
              <p className="font-mono text-xs font-bold text-neutral-900 mt-2">
                Invoice No: {invoiceNumber}
              </p>
              <p className="font-mono text-[11px] text-neutral-500">
                Date: {invoiceDate}
              </p>
              <p className="font-mono text-[11px] text-neutral-500">
                Ref Deal: {deal.dealNumber}
              </p>
            </div>
          </div>

          {/* 2. Statutory Margin Scheme Declaration Box */}
          <div className="rounded-xl border border-neutral-300 bg-neutral-50/60 p-3 text-[10px] text-neutral-700 font-mono leading-relaxed">
            <span className="font-bold text-neutral-900 uppercase block mb-0.5">
              Statutory Margin Scheme Declaration (Notification No. 8/2018-Central Tax (Rate)):
            </span>
            <span>
              This Tax Invoice is issued under Rule 32(5) of the CGST Rules, 2017. As this transaction pertains to a second-hand pre-owned motor vehicle, GST is charged strictly on the positive margin difference between the selling price and the procurement purchase price. No input tax credit is availed on the purchase of this motor vehicle.
            </span>
          </div>

          {/* 3. Billed To & Vehicle Details */}
          <div className="grid grid-cols-2 gap-6 text-xs border-b border-neutral-200 pb-5">
            {/* Buyer */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Billed To (Customer Particulars)
              </span>
              <p className="font-bold text-neutral-900 text-sm">{deal.customerName}</p>
              <p className="text-neutral-600">{deal.customerAddress || "Bengaluru, Karnataka"}</p>
              <p className="font-mono text-neutral-700">Phone: {deal.customerPhone}</p>
              <p className="font-mono font-semibold text-neutral-800">
                PAN: {deal.customerPan || "NOT PROVIDED"} • State: Karnataka (29)
              </p>
            </div>

            {/* Vehicle */}
            <div className="space-y-1 font-mono">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Certified Vehicle Particulars
              </span>
              <p className="font-sans font-bold text-neutral-900 text-sm">
                {deal.vehicle.manufacturingYear} {deal.vehicle.brand} {deal.vehicle.model}
              </p>
              <p className="text-neutral-600">{deal.vehicle.variant || "Standard Coupe/Sedan"}</p>
              <p className="text-neutral-800">
                Registration Plate: <strong className="text-neutral-950">{deal.vehicle.registrationNumber || "Unregistered"}</strong>
              </p>
              <p className="text-neutral-500 text-[10px]">
                Odometer: {deal.deliveryOdometerKm || deal.vehicle.kilometers} km
              </p>
            </div>
          </div>

          {/* 4. Financial Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b-2 border-neutral-950 font-mono text-[10px] uppercase text-neutral-700">
                <tr>
                  <th className="py-2.5 pr-2 font-bold">#</th>
                  <th className="py-2.5 px-3 font-bold">Item Description & Tax Classification</th>
                  <th className="py-2.5 px-3 font-bold">HSN/SAC</th>
                  <th className="py-2.5 px-3 text-right font-bold">Taxable Margin</th>
                  <th className="py-2.5 px-3 text-right font-bold">GST Rate</th>
                  <th className="py-2.5 pl-3 text-right font-bold">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-mono">
                <tr>
                  <td className="py-3 pr-2 text-neutral-500">1</td>
                  <td className="py-3 px-3">
                    <span className="font-sans font-semibold text-neutral-900 block">
                      Pre-Owned Certified Vehicle: {deal.vehicle.brand} {deal.vehicle.model}
                    </span>
                    <span className="text-[10px] text-neutral-500 block font-mono">
                      (Statutory Margin Spread Scheme — Rule 32/5)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-600">8703</td>
                  <td className="py-3 px-3 text-right text-neutral-800">
                    {formatINR(deal.taxableMargin)}
                  </td>
                  <td className="py-3 px-3 text-right text-neutral-800">
                    {deal.gstRatePercent}%
                  </td>
                  <td className="py-3 pl-3 text-right font-semibold text-neutral-950">
                    {deal.formattedSellingPrice}
                  </td>
                </tr>

                {deal.rtoTransferCharges > 0 && (
                  <tr>
                    <td className="py-2.5 pr-2 text-neutral-500">2</td>
                    <td className="py-2.5 px-3 font-sans text-neutral-800">
                      RTO Ownership Transfer & Smart Card Processing Fee
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600">9991</td>
                    <td className="py-2.5 px-3 text-right text-neutral-400">Exempt</td>
                    <td className="py-2.5 px-3 text-right text-neutral-400">0%</td>
                    <td className="py-2.5 pl-3 text-right text-neutral-800">
                      {formatINR(deal.rtoTransferCharges)}
                    </td>
                  </tr>
                )}

                {deal.insuranceCharges > 0 && (
                  <tr>
                    <td className="py-2.5 pr-2 text-neutral-500">3</td>
                    <td className="py-2.5 px-3 font-sans text-neutral-800">
                      Comprehensive Motor Vehicle Insurance Premium
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600">9971</td>
                    <td className="py-2.5 px-3 text-right text-neutral-400">Pass-thru</td>
                    <td className="py-2.5 px-3 text-right text-neutral-400">Exempt</td>
                    <td className="py-2.5 pl-3 text-right text-neutral-800">
                      {formatINR(deal.insuranceCharges)}
                    </td>
                  </tr>
                )}

                {deal.extendedWarrantyFee > 0 && (
                  <tr>
                    <td className="py-2.5 pr-2 text-neutral-500">4</td>
                    <td className="py-2.5 px-3 font-sans text-neutral-800">
                      Extended Mechanical Warranty Package (1 Year)
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600">9987</td>
                    <td className="py-2.5 px-3 text-right text-neutral-400">—</td>
                    <td className="py-2.5 px-3 text-right text-neutral-400">18%</td>
                    <td className="py-2.5 pl-3 text-right text-neutral-800">
                      {formatINR(deal.extendedWarrantyFee)}
                    </td>
                  </tr>
                )}

                {deal.discountAmount > 0 && (
                  <tr className="text-emerald-700">
                    <td className="py-2 pr-2">—</td>
                    <td className="py-2 px-3 font-sans font-medium">Showroom Concession / Discount</td>
                    <td className="py-2 px-3">—</td>
                    <td className="py-2 px-3 text-right">—</td>
                    <td className="py-2 px-3 text-right">—</td>
                    <td className="py-2 pl-3 text-right font-semibold">
                      -{formatINR(deal.discountAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 5. Tax Summary & Grand Total */}
          <div className="flex justify-between items-start border-t-2 border-neutral-950 pt-4">
            {/* Tax Breakdown Matrix */}
            <div className="text-[11px] font-mono space-y-1 text-neutral-600 max-w-sm">
              <span className="font-bold text-neutral-900 uppercase block mb-1">
                Statutory Margin Tax Matrix:
              </span>
              <div className="flex justify-between border-b border-neutral-100 pb-0.5">
                <span>Taxable Profit Margin Base:</span>
                <span className="text-neutral-900 font-semibold">{formatINR(deal.taxableMargin)}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-0.5">
                <span>Central GST (CGST @ {deal.gstRatePercent / 2}%):</span>
                <span className="text-neutral-900">{formatINR(deal.cgstAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-0.5">
                <span>State GST (SGST @ {deal.gstRatePercent / 2}%):</span>
                <span className="text-neutral-900">{formatINR(deal.sgstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 pt-0.5">
                <span>Total GST Liability on Margin:</span>
                <span>{formatINR(deal.totalGstOnMargin)}</span>
              </div>
            </div>

            {/* Total Figure */}
            <div className="text-right space-y-1 font-mono">
              <span className="text-[11px] text-neutral-500 uppercase block">Grand Total Invoiced Amount</span>
              <span className="font-serif text-2xl font-bold text-neutral-950 block">
                {deal.formattedTotalDealAmount}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                100% Payment Cleared & Reconciled
              </span>
            </div>
          </div>

          {/* 6. Terms & Authorizing Signatures */}
          <div className="pt-6 border-t border-neutral-200 grid grid-cols-2 gap-8 text-[10px] text-neutral-500 font-sans">
            <div>
              <span className="font-bold font-mono text-neutral-900 uppercase block mb-1">Terms of Sale:</span>
              <ol className="list-decimal pl-3 space-y-0.5 leading-relaxed">
                <li>Vehicle is delivered in inspected and certified condition.</li>
                <li>RTO title transfer is filed under acknowledgment docket.</li>
                <li>All disputes subject to local jurisdiction.</li>
              </ol>
            </div>

            <div className="text-center font-mono pt-8">
              <div className="border-t border-neutral-900 pt-2 inline-block min-w-[200px]">
                <span className="font-bold text-neutral-900 block text-xs">For Apex Motors</span>
                <span className="text-[10px] text-neutral-500">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

