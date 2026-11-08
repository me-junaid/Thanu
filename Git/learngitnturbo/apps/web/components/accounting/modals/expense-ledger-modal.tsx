"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Wrench,
  Car,
  Receipt,
  Building,
  Calendar,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  addVehicleExpenseAction,
  type ReconditioningCategory,
} from "../../../app/dashboard/accounting/actions";
import { formatINR } from "../../../lib/currency";

interface ExpenseLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableInventory: {
    id: string;
    brand: string;
    model: string;
    registrationNumber: string | null;
  }[];
}

const CATEGORIES: { label: string; value: ReconditioningCategory }[] = [
  { label: "Mechanical & Suspension Repair", value: "mechanical_repair" },
  { label: "Bodywork & Paint Touchup", value: "bodywork_paint" },
  { label: "Detailing & Ceramic Coating", value: "detailing_ceramic" },
  { label: "Tyre Replacement & Alignment", value: "tyre_replacement" },
  { label: "Interior & Leather Restoration", value: "interior_restoration" },
  { label: "Battery & Electrical", value: "electrical_battery" },
  { label: "RTO NOC / Paperwork / Fines", value: "rto_paperwork_fines" },
  { label: "Inward Flatbed Towing", value: "transportation_towing" },
  { label: "Other Workshop Supplies", value: "other" },
];

export function ExpenseLedgerModal({
  isOpen,
  onClose,
  onSuccess,
  availableInventory,
}: ExpenseLedgerModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vehicleId, setVehicleId] = useState("");
  const [category, setCategory] = useState<ReconditioningCategory>("detailing_ceramic");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(50000);
  const [vendorName, setVendorName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (isOpen && availableInventory.length > 0 && !vehicleId && availableInventory[0]) {
      setVehicleId(availableInventory[0].id);
      setError(null);
    }
  }, [isOpen, availableInventory, vehicleId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError("Please select a vehicle to capitalize the expense onto.");
      return;
    }
    if (!description.trim()) {
      setError("Detailed expense description is required.");
      return;
    }
    if (amount <= 0) {
      setError("Expense amount must be positive.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addVehicleExpenseAction({
        vehicleId,
        category,
        description: description.trim(),
        amount,
        vendorName: vendorName.trim() || null,
        invoiceNumber: invoiceNumber.trim() || null,
        invoiceDate: invoiceDate || null,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to log expense.");
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
                Workshop & Reconditioning
              </span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span className="text-xs text-neutral-600 font-mono">Landed Cost Ledger</span>
            </div>
            <h2 className="font-bold text-lg text-neutral-900 mt-0.5">
              Capitalize Workshop Bill
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
          {/* Target Vehicle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 font-mono mb-1">
              Select Vehicle to Capitalize *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
            >
              {availableInventory.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} ({car.registrationNumber || "Lot Stock"})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ReconditioningCategory)}
              className="w-full rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">
              Job Description / Parts Itemized *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Full 9H Ceramic Coating & Paint Correction"
              className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1 font-mono">
              Expenditure Amount (INR ₹) *
            </label>
            <input
              type="number"
              required
              min={1}
              step="any"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="e.g. 80000"
              className="w-full rounded-xl border border-neutral-300/90 px-3 py-2 text-sm font-bold text-neutral-950 focus:border-neutral-900 focus:outline-hidden"
            />
          </div>

          {/* Vendor & Invoice */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] text-neutral-500 mb-1">Vendor / Studio Name</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Apex Detailing Studio"
                className="w-full rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-[10px] text-neutral-500 mb-1">Vendor Invoice #</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-4921"
                className="w-full rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-mono text-neutral-900"
              />
            </div>
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
                  <span>Capitalizing...</span>
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4" />
                  <span>Capitalize {formatINR(amount)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

