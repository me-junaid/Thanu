"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  FileClock,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  updateRtoStatusAction,
  type SalesDealItem,
  type RtoTransferStatus,
} from "../../../app/dashboard/accounting/actions";

interface RtoUpdateModalProps {
  isOpen: boolean;
  deal: SalesDealItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RTO_STATUSES: { label: string; value: RtoTransferStatus; desc: string }[] = [
  {
    label: "Documents Pending",
    value: "pending_docs",
    desc: "Awaiting Form 29, Form 30 or bank NOC documents.",
  },
  {
    label: "Documents Collected & Verified",
    value: "docs_collected",
    desc: "All physical documents and signature cards verified.",
  },
  {
    label: "Submitted to RTO Authority",
    value: "submitted_to_rto",
    desc: "Docket submitted to RTO counter; Parivahan application active.",
  },
  {
    label: "Scrutiny Approved",
    value: "scrutiny_approved",
    desc: "Vehicle physical inspection passed and scrutiny cleared.",
  },
  {
    label: "RC Transferred (Deal Closed)",
    value: "rc_transferred",
    desc: "New Smart Card issued in buyer's name. Car marked 'sold' and commission approved.",
  },
  {
    label: "Disputed / Objection Raised",
    value: "disputed",
    desc: "RTO raised tax or document objection requiring rectification.",
  },
];

export function RtoUpdateModal({
  isOpen,
  deal,
  onClose,
  onSuccess,
}: RtoUpdateModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rtoStatus, setRtoStatus] = useState<RtoTransferStatus>("submitted_to_rto");
  const [rtoApplicationNo, setRtoApplicationNo] = useState("");
  const [rtoCompletionDate, setRtoCompletionDate] = useState("");
  const [newRcSmartcardUrl, setNewRcSmartcardUrl] = useState("");

  useEffect(() => {
    if (deal && isOpen) {
      setRtoStatus(deal.rtoStatus);
      setRtoApplicationNo(deal.rtoApplicationNo || "");
      setRtoCompletionDate(deal.rtoCompletionDate || "");
      setNewRcSmartcardUrl(deal.newRcSmartcardUrl || "");
      setError(null);
    }
  }, [deal, isOpen]);

  if (!isOpen || !deal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      const res = await updateRtoStatusAction({
        dealId: deal.id,
        rtoStatus,
        rtoApplicationNo: rtoApplicationNo.trim() || null,
        rtoCompletionDate: rtoCompletionDate || null,
        newRcSmartcardUrl: newRcSmartcardUrl.trim() || null,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to update RTO status.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                {deal.dealNumber}
              </span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span className="text-xs text-neutral-600 font-mono">Title Transfer</span>
            </div>
            <h2 className="font-serif text-lg font-normal text-neutral-900 mt-0.5">
              Update RTO Docket Status
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
          <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 font-mono">
              Select RTO Stage *
            </label>
            <div className="space-y-2">
              {RTO_STATUSES.map((status) => {
                const isSelected = rtoStatus === status.value;
                return (
                  <label
                    key={status.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "border-neutral-950 bg-neutral-50/80 shadow-2xs"
                        : "border-neutral-200 hover:bg-neutral-50/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rtoStatus"
                      value={status.value}
                      checked={isSelected}
                      onChange={() => setRtoStatus(status.value)}
                      className="mt-0.5 text-neutral-950 focus:ring-0"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-neutral-900 block">
                        {status.label}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {status.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Docket Application Number */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1 font-mono">
              Parivahan / RTO Docket Number
            </label>
            <input
              type="text"
              value={rtoApplicationNo}
              onChange={(e) => setRtoApplicationNo(e.target.value)}
              placeholder="e.g. KA04-RTO-2026-8819"
              className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs font-mono text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
            />
          </div>

          {/* Completion Date */}
          {rtoStatus === "rc_transferred" && (
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1 font-mono">
                Smart Card Issuance Date
              </label>
              <input
                type="date"
                value={rtoCompletionDate}
                onChange={(e) => setRtoCompletionDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              />
            </div>
          )}

          {/* Critical Transition Notice */}
          {rtoStatus === "rc_transferred" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Ownership Transferred:</strong> Saving this will officially transition the deal to <strong>'completed'</strong>, set vehicle status to <strong>'sold'</strong>, and approve sales executive commissions for settlement.
              </span>
            </div>
          )}

          {/* Footer Submit */}
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating Docket...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Update Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

