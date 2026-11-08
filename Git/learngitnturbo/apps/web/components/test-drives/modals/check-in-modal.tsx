"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  CheckCheck,
  Star,
  Flame,
  Zap,
  Snowflake,
  Fuel,
  Gauge,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  completeTestDriveAction,
  type TestDriveItem,
  type FuelLevel,
  type CustomerInterestTier,
} from "../../../app/dashboard/test-drives/actions";

interface CheckInModalProps {
  testDrive: TestDriveItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckInModal({
  testDrive,
  isOpen,
  onClose,
  onSuccess,
}: CheckInModalProps) {
  if (!isOpen || !testDrive) return null;

  const { vehicle } = testDrive;
  const startKm = testDrive.startOdometerKm || vehicle.kilometers || 0;

  const [endOdometerKm, setEndOdometerKm] = useState<number>(startKm + 12);
  const [endFuelLevel, setEndFuelLevel] = useState<FuelLevel>(
    testDrive.startFuelLevel || "half"
  );
  const [customerRating, setCustomerRating] = useState<number>(5);
  const [interestTier, setInterestTier] = useState<CustomerInterestTier>("hot");
  const [customerFeedback, setCustomerFeedback] = useState("");
  const [nextStepAction, setNextStepAction] = useState("token_deposit");
  const [postDriveNotes, setPostDriveNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distanceDriven = Math.max(0, endOdometerKm - startKm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (endOdometerKm < startKm) {
      setError(`Return odometer (${endOdometerKm} km) cannot be less than departure odometer (${startKm} km).`);
      return;
    }

    try {
      setSubmitting(true);
      await completeTestDriveAction({
        id: testDrive.id,
        endOdometerKm: Number(endOdometerKm),
        endFuelLevel,
        customerRating,
        interestTier,
        customerFeedback: customerFeedback.trim() || null,
        nextStepAction,
        postDriveNotes: postDriveNotes.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to check in vehicle.");
    } finally {
      setSubmitting(false);
    }
  };

  const FUEL_OPTIONS: { id: FuelLevel; label: string }[] = [
    { id: "reserve", label: "Reserve / Low" },
    { id: "quarter", label: "1/4 Tank" },
    { id: "half", label: "1/2 Tank" },
    { id: "three_quarters", label: "3/4 Tank" },
    { id: "full", label: "Full Tank" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto scrollbar-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 text-white">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-normal text-neutral-950">
                Vehicle Check-in & Evaluation
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Log return mileage, fuel, and buyer sentiment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Vehicle & Customer Summary */}
        <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
              <Image
                src={vehicle.heroImage}
                alt={vehicle.model}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <p className="font-semibold text-xs text-neutral-900">
                {vehicle.manufacturingYear} {vehicle.brand} {vehicle.model}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                Departure: {startKm.toLocaleString("en-IN")} km
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 font-mono block">PROSPECT</span>
            <span className="font-semibold text-xs text-neutral-900 block">
              {testDrive.customerName}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Return Odometer & Fuel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-neutral-700">
                  Return Odometer (km) *
                </label>
                <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  +{distanceDriven} km driven
                </span>
              </div>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="number"
                  required
                  min={startKm}
                  value={endOdometerKm}
                  onChange={(e) => setEndOdometerKm(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Return Fuel Level *
              </label>
              <div className="relative">
                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <select
                  value={endFuelLevel}
                  onChange={(e) => setEndFuelLevel(e.target.value as FuelLevel)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                >
                  {FUEL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Customer Rating (1-5 stars) */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1.5">
              Customer Driving Experience Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCustomerRating(star)}
                  className="p-1 rounded-lg hover:bg-neutral-100 transition active:scale-95"
                >
                  <Star
                    className={`w-6 h-6 transition ${
                      star <= customerRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-neutral-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-neutral-700 ml-2 font-mono">
                {customerRating}.0 / 5.0
              </span>
            </div>
          </div>

          {/* Customer Purchase Intent Tier */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1.5">
              Prospect Purchase Intent Tier *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInterestTier("hot")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  interestTier === "hot"
                    ? "bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400/30"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Flame className="w-4 h-4 text-rose-600 fill-rose-500" />
                <span>Hot Intent</span>
              </button>

              <button
                type="button"
                onClick={() => setInterestTier("warm")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  interestTier === "warm"
                    ? "bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/30"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span>Warm Intent</span>
              </button>

              <button
                type="button"
                onClick={() => setInterestTier("cold")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  interestTier === "cold"
                    ? "bg-neutral-100 border-neutral-400 text-neutral-950 ring-2 ring-neutral-400/30"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Snowflake className="w-4 h-4 text-neutral-500" />
                <span>Cold Intent</span>
              </button>
            </div>
          </div>

          {/* Customer Feedback */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Customer Feedback & Sound/Dynamics Impressions
            </label>
            <textarea
              rows={2}
              value={customerFeedback}
              onChange={(e) => setCustomerFeedback(e.target.value)}
              placeholder="e.g. Loved sports exhaust and ride comfort. Comparing with another unit."
              className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            />
          </div>

          {/* Next Step Action */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Next Immediate Showroom Action
            </label>
            <select
              value={nextStepAction}
              onChange={(e) => setNextStepAction(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950 font-medium"
            >
              <option value="token_deposit">Collect Token Booking Deposit (Advance to Booked)</option>
              <option value="finance_quote">Send Loan / Financial Quote (Advance to Negotiation)</option>
              <option value="followup">Schedule 24h Follow-up Call</option>
              <option value="alternative_car">Recommend Alternative Vehicle from Fleet</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-neutral-950 text-white font-semibold hover:bg-neutral-800 transition shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking in...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Complete Check-in</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

