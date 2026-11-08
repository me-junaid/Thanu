"use client";

import React from "react";
import Image from "next/image";
import {
  Clock,
  ShieldCheck,
  MessageCircle,
  Car,
  CheckCircle2,
  CheckCheck,
  ChevronRight,
  Star,
  User,
} from "lucide-react";
import type { TestDriveItem } from "../../app/dashboard/test-drives/actions";
import { TestDriveStatusBadge, InterestTierBadge } from "./test-drive-status-badge";

interface TestDriveCardProps {
  testDrive: TestDriveItem;
  onSelect: (item: TestDriveItem) => void;
  onOpenGatePass: (item: TestDriveItem) => void;
  onOpenCheckin: (item: TestDriveItem) => void;
  onConfirm: (id: string) => void;
}

export function TestDriveCard({
  testDrive,
  onSelect,
  onOpenGatePass,
  onOpenCheckin,
  onConfirm,
}: TestDriveCardProps) {
  const {
    vehicle,
    customerName,
    customerPhone,
    drivingLicenseNumber,
    status,
    formattedSchedule,
    durationMinutes,
    assignedStaffName,
    startedAt,
    distanceDrivenKm,
    customerRating,
    interestTier,
  } = testDrive;

  // Calculate elapsed time if on road
  const getElapsedMinutes = () => {
    if (!startedAt) return null;
    const diffMs = Date.now() - new Date(startedAt).getTime();
    return Math.max(1, Math.round(diffMs / (1000 * 60)));
  };

  const elapsed = status === "in_progress" ? getElapsedMinutes() : null;

  // Professional Host / Sales Staff Name & Initials
  const staffDisplayName =
    !assignedStaffName || assignedStaffName.toLowerCase() === "user"
      ? "Apex Host"
      : assignedStaffName;

  const staffInitials =
    staffDisplayName
      .replace(/\(.*\)/, "")
      .trim()
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AH";

  // WhatsApp click-to-chat url
  const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${customerName}, regards from Apex Motors. Your test drive for the ${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber || "Certified"}) is scheduled for ${formattedSchedule}. Looking forward to hosting you.`
  )}`;

  return (
    <div
      onClick={() => onSelect(testDrive)}
      className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer overflow-hidden space-y-3"
    >
      <div>
        {/* ─── Top Meta Row: Status Badge & WhatsApp ─── */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-neutral-100">
          <TestDriveStatusBadge status={status} size="sm" />

          <div className="flex items-center gap-1.5 shrink-0">
            {interestTier && <InterestTierBadge tier={interestTier} />}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-full transition shadow-2xs"
              title="Chat with customer on WhatsApp"
            >
              <MessageCircle className="w-3 h-3 fill-emerald-600 text-white" />
              <span className="text-[10px]">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* ─── Vehicle Header & Hero Thumbnail ─── */}
        <div className="flex items-center gap-3 pt-2.5">
          <div className="relative h-14 w-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 shadow-2xs">
            <Image
              src={vehicle.heroImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
              sizes="64px"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs sm:text-sm text-neutral-950 tracking-tight leading-tight truncate">
              {vehicle.manufacturingYear} {vehicle.brand} {vehicle.model}
            </h4>
            <p className="text-[11px] text-neutral-500 font-normal truncate mt-0.5">
              {vehicle.variant || "Showroom Lot Unit"}
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              {vehicle.registrationNumber ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 bg-neutral-100 text-neutral-800 rounded border border-neutral-200 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                  {vehicle.registrationNumber}
                </span>
              ) : null}
              <span className="text-[10.5px] font-mono font-semibold text-neutral-600">
                {vehicle.formattedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Customer, Schedule & DL Verification ─── */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 space-y-2">
          {/* Customer Name & Phone */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-semibold text-neutral-900 truncate">
                {customerName}
              </span>
            </div>
            <span className="font-mono text-[10.5px] text-neutral-500 shrink-0">
              {customerPhone}
            </span>
          </div>

          {/* Schedule & Duration Pill */}
          <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-2.5 py-1.5 border border-neutral-200/60 text-[11px]">
            <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{formattedSchedule}</span>
            </div>
            <span className="font-mono font-semibold text-[10px] text-neutral-600 bg-white px-1.5 py-0.5 rounded border border-neutral-200 shadow-2xs">
              {durationMinutes}m
            </span>
          </div>

          {/* Driving License Verification Badge */}
          {drivingLicenseNumber && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 px-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-neutral-500 text-[10.5px]">DL:</span>
              <span className="font-mono font-semibold text-[10.5px] text-neutral-800 tracking-wide">
                {drivingLicenseNumber}
              </span>
              <span className="ml-auto text-[9.5px] font-semibold text-sky-700 bg-sky-50 border border-sky-200/80 px-1.5 py-0.2 rounded">
                Verified
              </span>
            </div>
          )}

          {/* Live elapsed counter when on road */}
          {status === "in_progress" && elapsed !== null && (
            <div className="flex items-center justify-between gap-1.5 text-[11px] font-medium text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <Car className="w-3.5 h-3.5 text-emerald-700" />
                <span>Out on road</span>
              </div>
              <span className="font-mono font-bold text-emerald-800">~{elapsed} mins</span>
            </div>
          )}

          {/* Customer Rating & Distance driven if completed */}
          {status === "completed" && (
            <div className="flex items-center justify-between gap-2 pt-0.5">
              {customerRating ? (
                <div className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{customerRating}.0</span>
                  {distanceDrivenKm && (
                    <span className="text-[10px] text-neutral-500 font-mono font-normal ml-1">
                      (+{distanceDrivenKm} km)
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-neutral-400 italic">No rating recorded</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Footer: Host Avatar & Primary Action Button ─── */}
      <div className="mt-2 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
        {/* Sales Host Avatar Pill */}
        <div className="flex items-center gap-1.5 min-w-0 text-[11px]">
          <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200/90 flex items-center justify-center text-[9px] font-bold text-neutral-700 shrink-0">
            {staffInitials}
          </div>
          <span className="truncate text-neutral-600 font-medium text-[11px]">
            {staffDisplayName}
          </span>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {status === "scheduled" && (
            <button
              type="button"
              onClick={() => onConfirm(testDrive.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 px-3 py-1.5 rounded-xl transition shadow-2xs active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-600" />
              <span>Confirm</span>
            </button>
          )}

          {status === "confirmed" && (
            <button
              type="button"
              onClick={() => onOpenGatePass(testDrive)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-800 px-3.5 py-1.5 rounded-xl transition shadow-2xs active:scale-95"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Gate Pass</span>
            </button>
          )}

          {status === "in_progress" && (
            <button
              type="button"
              onClick={() => onOpenCheckin(testDrive)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200/80 border border-emerald-300 px-3 py-1.5 rounded-xl transition shadow-2xs active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span>Check-in</span>
            </button>
          )}

          {status === "completed" && (
            <button
              type="button"
              onClick={() => onSelect(testDrive)}
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-950 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 px-2.5 py-1.5 rounded-xl transition"
            >
              <span>Dossier</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
