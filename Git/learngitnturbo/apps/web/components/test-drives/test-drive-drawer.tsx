"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  MessageCircle,
  Car,
  CheckCircle2,
  CheckCheck,
  Star,
  Fuel,
  Gauge,
  User,
  ExternalLink,
  Ban,
} from "lucide-react";
import type { TestDriveItem } from "../../app/dashboard/test-drives/actions";
import { TestDriveStatusBadge, InterestTierBadge } from "./test-drive-status-badge";
import { Can } from "../permissions/can";

interface TestDriveDrawerProps {
  testDrive: TestDriveItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenGatePass: (item: TestDriveItem) => void;
  onOpenCheckin: (item: TestDriveItem) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}

export function TestDriveDrawer({
  testDrive,
  isOpen,
  onClose,
  onOpenGatePass,
  onOpenCheckin,
  onConfirm,
  onCancel,
}: TestDriveDrawerProps) {
  if (!isOpen || !testDrive) return null;

  const { vehicle } = testDrive;

  const cleanPhone = testDrive.customerPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${testDrive.customerName}, regarding your test drive for the ${vehicle.brand} ${vehicle.model} at Apex Motors.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-neutral-200 flex flex-col justify-between">
          {/* ─── Drawer Header ─── */}
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-neutral-400">
                  TEST DRIVE DOSSIER
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-[10px] font-mono text-neutral-500">
                  #{testDrive.id.slice(0, 8)}
                </span>
              </div>
              <h2 className="font-serif text-xl font-normal text-neutral-950 mt-0.5">
                {testDrive.customerName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <TestDriveStatusBadge status={testDrive.status} size="sm" />
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ─── Drawer Scrollable Body ─── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs scrollbar-none">
            {/* Vehicle Card */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3.5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-20 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200">
                  <Image
                    src={vehicle.heroImage}
                    alt={vehicle.model}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-neutral-900 truncate">
                      {vehicle.manufacturingYear} {vehicle.brand} {vehicle.model}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {vehicle.variant || "Showroom Stock"}
                  </p>
                  <p className="text-xs font-semibold text-neutral-900 mt-1">
                    {vehicle.formattedPrice}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60 text-[11px]">
                <div>
                  <span className="text-neutral-400 block font-mono">REGISTRATION</span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {vehicle.registrationNumber || "Certified"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono">ODOMETER</span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {vehicle.kilometers.toLocaleString("en-IN")} km
                  </span>
                </div>
              </div>
            </div>

            {/* Prospect Information */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-neutral-400">
                Customer & Compliance
              </h4>
              <div className="rounded-xl border border-neutral-200 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium text-neutral-900">
                      {testDrive.customerName}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Staff: {testDrive.assignedStaffName || "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span>{testDrive.customerPhone}</span>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                  >
                    <MessageCircle className="w-3 h-3 fill-emerald-500 text-white" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {testDrive.customerEmail && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span>{testDrive.customerEmail}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-neutral-600 pt-2 border-t border-neutral-100">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span className="font-mono font-medium text-neutral-900">
                    DL: {testDrive.drivingLicenseNumber || "Pending verification"}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment & Gate Pass Details */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-neutral-400">
                Gate Pass & Custody Log
              </h4>

              <div className="rounded-xl border border-neutral-200 p-3 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Schedule:</span>
                  </div>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {testDrive.formattedSchedule} ({testDrive.durationMinutes}m)
                  </span>
                </div>

                {/* Departure details */}
                {testDrive.startedAt && (
                  <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Departure Odometer:</span>
                      <span className="font-mono font-semibold text-neutral-900">
                        {testDrive.startOdometerKm?.toLocaleString("en-IN")} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Departure Fuel:</span>
                      <span className="font-mono text-neutral-800 capitalize">
                        {testDrive.startFuelLevel || "N/A"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Return details */}
                {testDrive.completedAt && (
                  <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Return Odometer:</span>
                      <span className="font-mono font-semibold text-neutral-900">
                        {testDrive.endOdometerKm?.toLocaleString("en-IN")} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Total Distance Driven:</span>
                      <span className="font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        +{testDrive.distanceDrivenKm} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Return Fuel:</span>
                      <span className="font-mono text-neutral-800 capitalize">
                        {testDrive.endFuelLevel || "N/A"}
                      </span>
                    </div>
                  </div>
                )}

                {testDrive.preDriveNotes && (
                  <div className="pt-2 border-t border-neutral-100 text-[11px]">
                    <span className="text-neutral-400 block font-mono mb-0.5">NOTES</span>
                    <p className="text-neutral-700 italic">"{testDrive.preDriveNotes}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Post-Drive Feedback (If completed) */}
            {testDrive.status === "completed" && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-neutral-400">
                  Post-Drive Evaluation
                </h4>

                <div className="rounded-xl border border-neutral-200 p-3 space-y-2.5 bg-neutral-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{testDrive.customerRating}.0 / 5.0 Rating</span>
                    </div>
                    <InterestTierBadge tier={testDrive.interestTier} />
                  </div>

                  {testDrive.customerFeedback && (
                    <p className="text-xs text-neutral-700 italic bg-white p-2.5 rounded-lg border border-neutral-200">
                      "{testDrive.customerFeedback}"
                    </p>
                  )}

                  {testDrive.nextStepAction && (
                    <div className="text-[11px] text-neutral-600 font-mono pt-1">
                      Next Step: <strong className="text-neutral-900">{testDrive.nextStepAction}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── Drawer Action Footer (Gated by test_drives:complete) ─── */}
          <Can permission="test_drives:complete">
            <div className="p-4 border-t border-neutral-100 bg-white flex items-center justify-between gap-2">
              {testDrive.status !== "completed" && testDrive.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => onCancel(testDrive.id)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition text-xs font-medium flex items-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {testDrive.status === "scheduled" && (
                  <button
                    type="button"
                    onClick={() => onConfirm(testDrive.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Appointment</span>
                  </button>
                )}

                {testDrive.status === "confirmed" && (
                  <button
                    type="button"
                    onClick={() => onOpenGatePass(testDrive)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-2xs"
                  >
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Issue Gate Pass</span>
                  </button>
                )}

                {testDrive.status === "in_progress" && (
                  <button
                    type="button"
                    onClick={() => onOpenCheckin(testDrive)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-2xs"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Check-in Vehicle</span>
                  </button>
                )}
              </div>
            </div>
          </Can>
        </div>
      </div>
    </div>
  );
}

