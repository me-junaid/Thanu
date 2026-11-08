"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Calendar, Clock, Car, User, Phone, ShieldCheck, Loader2 } from "lucide-react";
import {
  scheduleTestDriveAction,
  getShowroomVehiclesAction,
} from "../../../app/dashboard/test-drives/actions";
import { type TestDriveScheduleInput } from "../../../lib/schemas/test-drive";
import { getLocalDateString } from "../../../lib/date";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialVehicleId?: string;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  initialVehicleId,
}: ScheduleModalProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [vehicleId, setVehicleId] = useState(initialVehicleId || "");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [date, setDate] = useState(() => getLocalDateString(new Date()));
  const [time, setTime] = useState("16:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [preDriveNotes, setPreDriveNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoadingVehicles(true);
      getShowroomVehiclesAction()
        .then((data) => {
          setVehicles(data);
          if (!vehicleId && data.length > 0 && data[0]) {
            setVehicleId(data[0].id);
          }
        })
        .finally(() => setLoadingVehicles(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError("Please select a showroom vehicle.");
      return;
    }
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!customerPhone.trim()) {
      setError("Customer phone number is required.");
      return;
    }

    try {
      setSubmitting(true);
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

      await scheduleTestDriveAction({
        vehicleId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        drivingLicenseNumber: drivingLicenseNumber.trim() || null,
        scheduledAt,
        durationMinutes,
        preDriveNotes: preDriveNotes.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to schedule test drive.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCar = vehicles.find((v) => v.id === vehicleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto scrollbar-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="font-serif text-xl font-normal text-neutral-950">
              Schedule Test Drive
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Reserve a certified vehicle on the showroom floor.
            </p>
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
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Vehicle Selector */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Select Certified Vehicle
            </label>
            {loadingVehicles ? (
              <div className="py-3 text-center text-neutral-400">Loading fleet...</div>
            ) : (
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-900 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-950"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.manufacturingYear} {v.brand} {v.model} ({v.registrationNumber || "Certified"}) — {v.formattedPrice}
                  </option>
                ))}
              </select>
            )}

            {/* Preview of selected car */}
            {selectedCar && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                  <Image
                    src={selectedCar.heroImage}
                    alt={selectedCar.model}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-neutral-900 truncate">
                    {selectedCar.brand} {selectedCar.model}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Odometer: {selectedCar.kilometers.toLocaleString("en-IN")} km
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98840 12345"
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Driving License Number
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                  placeholder="KA01 20180004921"
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Time Slot *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>
          </div>

          {/* Pre-Drive Notes */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Pre-Drive Requirements / Route Notes
            </label>
            <textarea
              rows={2}
              value={preDriveNotes}
              onChange={(e) => setPreDriveNotes(e.target.value)}
              placeholder="e.g. Prospect wants expressway speed check & launch control feel."
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
                  <span>Reserving...</span>
                </>
              ) : (
                <span>Confirm Appointment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
