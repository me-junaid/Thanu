"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  Car,
  Gauge,
  Fuel,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  checkoutVehicleAction,
  type TestDriveItem,
  type FuelLevel,
} from "../../../app/dashboard/test-drives/actions";

interface GatePassModalProps {
  testDrive: TestDriveItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GatePassModal({
  testDrive,
  isOpen,
  onClose,
  onSuccess,
}: GatePassModalProps) {
  if (!isOpen || !testDrive) return null;

  const { vehicle } = testDrive;

  const [startOdometerKm, setStartOdometerKm] = useState(
    testDrive.startOdometerKm || vehicle.kilometers || 0
  );
  const [startFuelLevel, setStartFuelLevel] = useState<FuelLevel>(
    testDrive.startFuelLevel || "three_quarters"
  );
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState(
    testDrive.drivingLicenseNumber || ""
  );
  const [dlVerified, setDlVerified] = useState(
    Boolean(testDrive.drivingLicenseNumber)
  );
  const [preDriveNotes, setPreDriveNotes] = useState(
    testDrive.preDriveNotes || ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!drivingLicenseNumber.trim()) {
      setError("Driving License number is legally required to issue a Gate Pass.");
      return;
    }

    if (!dlVerified) {
      setError("Please confirm that you have physically verified the customer's driving license.");
      return;
    }

    try {
      setSubmitting(true);
      await checkoutVehicleAction({
        id: testDrive.id,
        startOdometerKm: Number(startOdometerKm),
        startFuelLevel,
        drivingLicenseNumber: drivingLicenseNumber.trim(),
        preDriveNotes: preDriveNotes.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to issue gate pass.");
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
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-normal text-neutral-950">
                Digital Showroom Gate Pass
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Vehicle Rollout & Custody Slip
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

        {/* Vehicle & Customer Banner */}
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
              {vehicle.registrationNumber && (
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-600 bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                  {vehicle.registrationNumber}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 font-mono block">DRIVER</span>
            <span className="font-semibold text-xs text-neutral-900 block">
              {testDrive.customerName}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* DL Input */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Government Driving License (DL) Number *
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                required
                value={drivingLicenseNumber}
                onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                placeholder="e.g. KA01 20180004921"
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-neutral-950"
              />
            </div>
          </div>

          {/* Verification Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 cursor-pointer">
            <input
              type="checkbox"
              checked={dlVerified}
              onChange={(e) => setDlVerified(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-emerald-400 text-emerald-700 focus:ring-emerald-500"
            />
            <span className="text-[11px] leading-relaxed">
              I certify that I have physically inspected the original Driving License of{" "}
              <strong>{testDrive.customerName}</strong> and confirmed validity for this category.
            </span>
          </label>

          {/* Odometer & Fuel Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Departure Odometer (km) *
              </label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="number"
                  required
                  min={0}
                  value={startOdometerKm}
                  onChange={(e) => setStartOdometerKm(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Fuel Gauge Level *
              </label>
              <div className="relative">
                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <select
                  value={startFuelLevel}
                  onChange={(e) => setStartFuelLevel(e.target.value as FuelLevel)}
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

          {/* Pre-Drive Inspection Notes */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Rollout Inspection / Scratch Checklist Notes
            </label>
            <textarea
              rows={2}
              value={preDriveNotes}
              onChange={(e) => setPreDriveNotes(e.target.value)}
              placeholder="e.g. Tires pressurized, no new scratches observed, dealer plates secured."
              className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            />
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
                  <span>Issuing Gate Pass...</span>
                </>
              ) : (
                <>
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Issue Gate Pass & Roll Out</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

