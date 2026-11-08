"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Landmark,
  Coins,
  CheckCircle2,
  Loader2,
  Calendar,
  Building,
} from "lucide-react";
import {
  recordPaymentAction,
  type SalesDealItem,
  type PaymentMethod,
  type PaymentType,
} from "../../../app/dashboard/accounting/actions";
import { formatINR } from "../../../lib/currency";

interface RecordPaymentModalProps {
  isOpen: boolean;
  deal: SalesDealItem | null;
  onClose: () => void;
  onSuccess: (paymentNumber?: string) => void;
}

export function RecordPaymentModal({
  isOpen,
  deal,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<PaymentType>("down_payment");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [transactionRef, setTransactionRef] = useState("");
  const [chequeBankName, setChequeBankName] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [notes, setNotes] = useState("");

  // Pre-fill amount with balance due when deal changes
  useEffect(() => {
    if (deal && isOpen) {
      setAmount(deal.balanceDue > 0 ? deal.balanceDue : 50000);
      setTransactionRef("");
      setNotes("");
      setError(null);
    }
  }, [deal, isOpen]);

  if (!isOpen || !deal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }
    if (!transactionRef.trim()) {
      setError("Transaction reference / UTR or Cheque number is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await recordPaymentAction({
        dealId: deal.id,
        amount,
        paymentType,
        paymentMethod,
        transactionRef: transactionRef.trim(),
        chequeBankName: paymentMethod === "cheque" ? chequeBankName.trim() : null,
        chequeDate: paymentMethod === "cheque" ? chequeDate : null,
        notes: notes.trim() || null,
      });

      if (res.success) {
        onSuccess(res.paymentNumber);
        onClose();
      } else {
        setError(res.error || "Failed to log payment.");
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
              <span className="text-xs text-neutral-600 font-mono">Payment Entry</span>
            </div>
            <h2 className="font-serif text-lg font-normal text-neutral-900 mt-0.5">
              Collect Deal Payment Tranche
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

        {/* Deal Context Strip */}
        <div className="bg-neutral-950 text-white p-4 mx-6 mt-4 rounded-xl flex items-center justify-between text-xs font-mono">
          <div>
            <span className="block text-[10px] text-neutral-400 uppercase">Customer & Vehicle</span>
            <span className="font-bold text-white block truncate max-w-[200px]">
              {deal.customerName}
            </span>
            <span className="text-neutral-400 text-[10px]">
              {deal.vehicle.brand} {deal.vehicle.model}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] text-neutral-400 uppercase">Balance Due</span>
            <span className="text-base font-bold text-amber-400">
              {deal.formattedBalanceDue}
            </span>
            <span className="text-neutral-400 text-[10px] block">
              Total: {deal.formattedTotalDealAmount}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 font-mono">
                Collection Amount (₹) *
              </label>
              {deal.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(deal.balanceDue)}
                  className="text-[11px] font-mono text-neutral-900 hover:underline font-semibold"
                >
                  Pay Full Balance
                </button>
              )}
            </div>

            <input
              type="number"
              required
              min={100}
              step="any"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300/90 px-3.5 py-2.5 text-base font-serif font-bold text-neutral-950 focus:border-neutral-900 focus:outline-hidden"
              placeholder="e.g. 500000"
            />
          </div>

          {/* Payment Type & Method */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                Payment Type
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                className="w-full rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              >
                <option value="down_payment">Customer Down Payment</option>
                <option value="token_deposit">Booking Token Advance</option>
                <option value="loan_disbursement">Bank Loan Disbursement</option>
                <option value="exchange_adjustment">Exchange Car Allowance</option>
                <option value="final_settlement">Final Clearance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              >
                <option value="bank_transfer">RTGS / NEFT Transfer</option>
                <option value="upi">UPI / Instant QR</option>
                <option value="auto_loan">Lender Auto Loan NEFT</option>
                <option value="cheque">Cheque / Demand Draft</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash Receipt</option>
              </select>
            </div>
          </div>

          {/* Reference UTR */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">
              Bank Reference / UTR Number / Receipt ID *
            </label>
            <input
              type="text"
              required
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. HDFC9821892019 / UPI/20260401/8921"
              className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs font-mono text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
            />
          </div>

          {/* Cheque Details if applicable */}
          {paymentMethod === "cheque" && (
            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Drawee Bank Name</label>
                <input
                  type="text"
                  value={chequeBankName}
                  onChange={(e) => setChequeBankName(e.target.value)}
                  placeholder="e.g. ICICI Bank"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Cheque Date</label>
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900"
                />
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">
              Ledger Memo / Transaction Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via RTGS into primary current account."
              className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
            />
          </div>

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
                  <span>Clearing Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Record {formatINR(amount)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

