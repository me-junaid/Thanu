"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Car,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Loader2,
  KeyRound,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";
import {
  issueDeliveryGatePassAction,
  type SalesDealItem,
} from "../../../app/dashboard/accounting/actions";
import { formatINR } from "../../../lib/currency";

interface DeliveryGatePassModalProps {
  isOpen: boolean;
  deal: SalesDealItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeliveryGatePassModal({
  isOpen,
  deal,
  onClose,
  onSuccess,
}: DeliveryGatePassModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [deliveryOdometerKm, setDeliveryOdometerKm] = useState<number>(0);
  const [deliveryFuelLevel, setDeliveryFuelLevel] = useState("full");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [keysVerified, setKeysVerified] = useState(true);
  const [form29Verified, setForm29Verified] = useState(true);

  useEffect(() => {
    if (deal && isOpen) {
      setDeliveryOdometerKm(deal.deliveryOdometerKm || deal.vehicle.kilometers || 0);
      setDeliveryFuelLevel(deal.deliveryFuelLevel || "full");
      setHandoverNotes(deal.deliveryNotes || "Handover completed with two original keys, BSI warranty documents, and Form 29/30 acknowledged.");
      setError(null);
    }
  }, [deal, isOpen]);

  if (!isOpen || !deal) return null;

  const isAlreadyDelivered = Boolean(deal.gatePassNumber);

  const handleIssueGatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (deliveryOdometerKm < 0) {
      setError("Please provide a valid exit odometer reading.");
      return;
    }
    if (!form29Verified) {
      setError("Form 29 & Form 30 acknowledgement is mandatory for showroom rollout.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await issueDeliveryGatePassAction({
        dealId: deal.id,
        deliveryOdometerKm,
        deliveryFuelLevel,
        handoverNotes: handoverNotes.trim() || null,
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Failed to issue gate pass.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 bg-neutral-50/50 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Showroom Security
              </span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span className="text-xs text-neutral-600 font-mono">
                {isAlreadyDelivered ? "Gate Pass Active" : "Rollout Clearance"}
              </span>
            </div>
            <h2 className="font-serif text-lg font-normal text-neutral-900 mt-0.5">
              {isAlreadyDelivered ? "Official Delivery Gate Pass" : "Issue Delivery Gate Pass"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 print:hidden">
            {error}
          </div>
        )}

        {/* ─── CASE A: Gate Pass Issuance Form ─── */}
        {!isAlreadyDelivered ? (
          <form onSubmit={handleIssueGatePass} className="p-6 space-y-4">
            {/* Clearance Notice */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-950 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Pre-Rollout Security Check:</span>
                <span>
                  Deal <strong>{deal.dealNumber}</strong> is ready for physical handover. Issuing this gate pass records official checkout from showroom inventory and timestamps legal custody transfer.
                </span>
              </div>
            </div>

            {/* Odometer & Fuel */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1 font-mono">
                  Exit Odometer Reading (km) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={deliveryOdometerKm || ""}
                  onChange={(e) => setDeliveryOdometerKm(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-300/90 px-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Fuel Gauge Level *
                </label>
                <select
                  value={deliveryFuelLevel}
                  onChange={(e) => setDeliveryFuelLevel(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300/90 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                >
                  <option value="full">Full Tank</option>
                  <option value="three_quarters">3/4 Tank</option>
                  <option value="half">1/2 Tank</option>
                  <option value="quarter">1/4 Tank</option>
                </select>
              </div>
            </div>

            {/* Verification Checkboxes */}
            <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50 space-y-2 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={keysVerified}
                  onChange={(e) => setKeysVerified(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
                <KeyRound className="h-3.5 w-3.5 text-neutral-500" />
                <span>2 Original Keys, Service Booklet, Spare Tyre & Jack Handed Over</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={form29Verified}
                  onChange={(e) => setForm29Verified(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
                <FileCheck2 className="h-3.5 w-3.5 text-neutral-500" />
                <span>Form 29 & Form 30 Transfer Acknowledgement Signed by Buyer *</span>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                Departure Notes / VIP Delivery Memo
              </label>
              <textarea
                rows={2}
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="e.g. VIP handover completed with customer sign-off."
                className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition active:scale-98 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Issuing Gate Pass...</span>
                  </>
                ) : (
                  <>
                    <Car className="h-4 w-4" />
                    <span>Issue Rollout Gate Pass</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ─── CASE B: Printable Gate Pass Slip ─── */
          <div className="p-6 space-y-6">
            {/* Printable Pass Container */}
            <div className="rounded-2xl border-2 border-neutral-900 p-6 space-y-5 bg-white text-neutral-950">
              {/* Slip Header */}
              <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold tracking-tight uppercase">
                    Apex Motors
                  </h1>
                  <p className="text-[10px] font-mono tracking-wider text-neutral-600 uppercase">
                    Security Gate Pass & Rollout Clearance Slip
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="block text-xs font-bold bg-neutral-950 text-white px-2.5 py-1 rounded">
                    {deal.gatePassNumber}
                  </span>
                  <span className="block text-[10px] text-neutral-500 mt-1">
                    {deal.deliveredAt ? new Date(deal.deliveredAt).toLocaleString("en-IN") : ""}
                  </span>
                </div>
              </div>

              {/* Clearance Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-mono">
                <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>100% FINANCIAL SETTLEMENT CLEARED</span>
                </span>
                <span className="text-neutral-500">
                  Deal: {deal.dealNumber}
                </span>
              </div>

              {/* Vehicle Particulars */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-neutral-200 pb-4">
                <div>
                  <span className="text-neutral-400 text-[10px] font-mono uppercase block">Vehicle Description</span>
                  <span className="font-semibold text-neutral-900 block text-sm">
                    {deal.vehicle.manufacturingYear} {deal.vehicle.brand} {deal.vehicle.model}
                  </span>
                  <span className="font-mono text-neutral-600 text-[11px]">
                    {deal.vehicle.variant || ""}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 text-[10px] font-mono uppercase block">Registration Plate</span>
                  <span className="font-mono font-bold text-sm text-neutral-900 block">
                    {deal.vehicle.registrationNumber || "Lot Unit"}
                  </span>
                  <span className="font-mono text-neutral-500 text-[11px]">
                    Exit Odo: {deal.deliveryOdometerKm} km • Fuel: {deal.deliveryFuelLevel}
                  </span>
                </div>
              </div>

              {/* Customer Particulars */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-neutral-200 pb-4">
                <div>
                  <span className="text-neutral-400 text-[10px] font-mono uppercase block">Customer / Transferee</span>
                  <span className="font-semibold text-neutral-900 block">{deal.customerName}</span>
                  <span className="font-mono text-neutral-500 text-[11px] block">{deal.customerPhone}</span>
                </div>

                <div>
                  <span className="text-neutral-400 text-[10px] font-mono uppercase block">Delivery Handover Rep</span>
                  <span className="font-semibold text-neutral-900 block">{deal.salesRepName || "Showroom Staff"}</span>
                  <span className="font-mono text-neutral-500 text-[11px] block">Showroom Operations</span>
                </div>
              </div>

              {/* Legal Undertaking */}
              <p className="text-[10px] text-neutral-500 leading-relaxed font-sans">
                The transferee acknowledges taking physical delivery of the motor vehicle in sound roadworthy condition along with original registration certificate, insurance policy, 2 vehicle keys, and Form 29/30 transfer dockets. From the moment of exit, all traffic liabilities, toll charges, and road responsibilities rest with the transferee.
              </p>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-xs font-mono">
                <div className="border-t border-neutral-900 pt-2 text-center">
                  <span className="block font-semibold text-neutral-900">Customer Signature</span>
                  <span className="text-[10px] text-neutral-400">Transferee / Authorized Signatory</span>
                </div>
                <div className="border-t border-neutral-900 pt-2 text-center">
                  <span className="block font-semibold text-neutral-900">Security Gate Officer</span>
                  <span className="text-[10px] text-neutral-400">Showroom Operations Manager</span>
                </div>
              </div>
            </div>

            {/* Print CTA */}
            <div className="flex items-center justify-end gap-2.5 pt-2 print:hidden">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98"
              >
                <Printer className="h-4 w-4" />
                <span>Print Gate Pass Slip</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

