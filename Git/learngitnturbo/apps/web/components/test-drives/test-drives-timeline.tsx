"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getLocalDateString } from "../../lib/date";
import type { TestDriveItem } from "../../app/dashboard/test-drives/actions";
import {
  Clock,
  ShieldCheck,
  Car,
  CheckCircle2,
  CheckCheck,
  Plus,
  Minus,
  RotateCcw,
  Star,
  Fuel,
  Gauge,
  User,
} from "lucide-react";

interface TestDrivesTimelineProps {
  testDrives: TestDriveItem[];
  isLoading?: boolean;
  selectedDate: string; // YYYY-MM-DD or "all"
  onSelect: (item: TestDriveItem) => void;
  onOpenScheduleModal: (preselectedVehicleId?: string) => void;
}

const START_HOUR = 9; // 09:00 AM

function formatTimeOnly(d: Date): string {
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

function formatTimeRange(isoString: string, durationMinutes: number): string {
  const start = new Date(isoString);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return `${formatTimeOnly(start)} – ${formatTimeOnly(end)}`;
}

export function TestDrivesTimeline({
  testDrives,
  isLoading = false,
  selectedDate,
  onSelect,
  onOpenScheduleModal,
}: TestDrivesTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // 1. Group drives by vehicle
  const vehiclesMap = useMemo(() => {
    const map = new Map<
      string,
      { vehicle: TestDriveItem["vehicle"]; drives: TestDriveItem[] }
    >();

    for (const drive of testDrives) {
      if (!map.has(drive.vehicleId)) {
        map.set(drive.vehicleId, {
          vehicle: drive.vehicle,
          drives: [],
        });
      }
      map.get(drive.vehicleId)!.drives.push(drive);
    }

    return Array.from(map.values());
  }, [testDrives]);

  // 2. Dynamically determine end hour so late appointments (e.g. 7:00 PM – 8:20 PM) are fully captured
  const END_HOUR = useMemo(() => {
    let maxHour = 21; // at least 9:00 PM (21:00)
    for (const drive of testDrives) {
      const dt = new Date(drive.scheduledAt);
      const endHourDecimal =
        dt.getHours() + (dt.getMinutes() + drive.durationMinutes) / 60;
      if (endHourDecimal > maxHour) {
        maxHour = Math.ceil(endHourDecimal);
      }
    }
    return Math.max(21, maxHour);
  }, [testDrives]);

  const TOTAL_HOURS = END_HOUR - START_HOUR;

  const HOURS = useMemo(() => {
    const list: number[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      list.push(h);
    }
    return list;
  }, [END_HOUR]);

  // 3. Dynamically adjust hour width according to booked cards so content is never squished
  const autoHourWidth = useMemo(() => {
    if (testDrives.length === 0) return 260;
    // Find shortest booked appointment duration
    const durations = testDrives
      .filter((d) => d.durationMinutes && d.durationMinutes > 0)
      .map((d) => d.durationMinutes);
    const shortestMinutes = durations.length > 0 ? Math.min(...durations) : 45;

    // Line 2 "4:30 pm – 5:15 pm" requires ~145px min card width to never truncate or wrap
    // Line 3 "[30m] + Status" requires ~140px min card width
    const targetCardWidth = 150;
    const durationFraction = shortestMinutes / 60;
    const neededHourWidth = Math.ceil(targetCardWidth / durationFraction);

    // Keep hour width in a comfortable aesthetic range [240px, 360px]
    return Math.min(360, Math.max(240, neededHourWidth));
  }, [testDrives]);

  // User zoom scale control
  const [zoomHourWidth, setZoomHourWidth] = useState<number | null>(null);
  const hourWidth = zoomHourWidth ?? autoHourWidth;
  const TOTAL_TRACK_WIDTH = TOTAL_HOURS * hourWidth;

  // Current time position (if viewing today)
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);
  const todayStr = getLocalDateString(now);
  const isViewingToday = selectedDate === todayStr || selectedDate === "all";

  const currentTimeLeftPx = useMemo(() => {
    if (!isViewingToday) return null;
    const currentHourDecimal =
      now.getHours() + (now.getMinutes() + now.getSeconds() / 60) / 60;
    if (currentHourDecimal < START_HOUR || currentHourDecimal > END_HOUR) {
      return null;
    }
    return (currentHourDecimal - START_HOUR) * hourWidth;
  }, [isViewingToday, now, hourWidth, END_HOUR]);

  const handleZoomIn = () => {
    setZoomHourWidth((prev) => Math.min(420, (prev ?? hourWidth) + 30));
  };

  const handleZoomOut = () => {
    setZoomHourWidth((prev) => Math.max(160, (prev ?? hourWidth) - 30));
  };

  const handleResetZoom = () => {
    setZoomHourWidth(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
      {/* ─── Timeline Controls Bar (Scale & Zoom) ─── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200/70 bg-neutral-50/60 text-xs">
        <div className="flex items-center gap-2 text-neutral-500">
          <span className="font-mono text-[11px] font-semibold text-neutral-700">
            SHOWROOM SCHEDULE
          </span>
          <span className="text-neutral-300">•</span>
          <span className="font-mono text-[11px]">
            {START_HOUR > 12 ? `${START_HOUR - 12} PM` : `${START_HOUR} AM`} –{" "}
            {END_HOUR > 12 ? `${END_HOUR - 12} PM` : `${END_HOUR} AM`}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          {zoomHourWidth !== null && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-neutral-600 hover:text-neutral-950 bg-neutral-200/60 hover:bg-neutral-200 transition"
              title="Reset to Auto-Fit"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Auto</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={hourWidth <= 160}
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition disabled:opacity-30 active:scale-95"
            title="Zoom Out (Compact scale)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={hourWidth >= 380}
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition disabled:opacity-30 active:scale-95"
            title="Zoom In (Spacious scale)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Scrollable Timeline Track ─── */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-none relative"
      >
        <div style={{ width: `${240 + TOTAL_TRACK_WIDTH}px` }}>
          {/* ─── Header: Vehicle Column Label & Hourly Ticks ─── */}
          <div className="flex border-b border-neutral-200/80 bg-neutral-50/80 select-none">
            {/* Sticky Fleet Column Header */}
            <div className="w-60 shrink-0 p-3 text-xs font-semibold text-neutral-700 font-mono border-r border-neutral-200/80 uppercase tracking-wider sticky left-0 z-40 bg-neutral-50 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.06)] flex items-center justify-between">
              <span>Showroom Fleet</span>
              <span className="text-[10px] text-neutral-400 font-normal">
                {vehiclesMap.length} {vehiclesMap.length === 1 ? "unit" : "units"}
              </span>
            </div>

            {/* Hourly Labels with Quarter-Hour Subdivisions */}
            <div
              className="flex"
              style={{ width: `${TOTAL_TRACK_WIDTH}px` }}
            >
              {HOURS.map((h) => {
                const hourFormatted =
                  h === 12
                    ? "12:00 PM"
                    : h > 12
                    ? `${h - 12}:00 PM`
                    : `${h < 10 ? `0${h}` : h}:00 AM`;
                return (
                  <div
                    key={h}
                    style={{ width: `${hourWidth}px` }}
                    className="shrink-0 py-2 border-r border-neutral-200/90 relative"
                  >
                    {/* Hour Title */}
                    <div className="text-center text-[11px] font-mono font-semibold text-neutral-700">
                      {hourFormatted}
                    </div>

                    {/* Quarter-Hour Sub-Labels (:15, :30, :45) */}
                    <div className="flex justify-between px-2 pt-1 text-[9px] font-mono text-neutral-400">
                      <span className="w-1/4 text-center">:15</span>
                      <span className="w-1/4 text-center font-medium text-neutral-500">:30</span>
                      <span className="w-1/4 text-center">:45</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Vehicle Rows & Appointments ─── */}
          <div className="relative divide-y divide-neutral-100">
            {/* Live Current Time Marker Line (z-15 stays above cards z-10, but below sticky columns z-30/z-40) */}
            {currentTimeLeftPx !== null && (
              <div
                className="absolute top-0 bottom-0 z-15 pointer-events-none flex flex-col items-center -translate-x-1/2"
                style={{
                  left: `${240 + currentTimeLeftPx}px`,
                }}
              >
                <div className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold font-mono tracking-wider shadow-xs -translate-y-1 whitespace-nowrap">
                  {formatTimeOnly(now)}
                </div>
                <div className="w-[1.5px] h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              </div>
            )}

            {isLoading && vehiclesMap.length === 0 ? (
              <div
                className="sticky left-0 py-4 px-2 space-y-3"
                style={{
                  width: containerWidth ? `${containerWidth}px` : "100%",
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex h-24 rounded-2xl border border-neutral-200/80 bg-white p-3 items-center gap-4 animate-pulse shadow-2xs"
                  >
                    <div className="h-16 w-24 bg-neutral-200 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-44 bg-neutral-200 rounded" />
                      <div className="h-3 w-32 bg-neutral-100 rounded" />
                    </div>
                    <div className="h-12 w-48 bg-neutral-100 rounded-xl mr-8" />
                  </div>
                ))}
              </div>
            ) : vehiclesMap.length === 0 ? (
              <div
                className="sticky left-0 py-16 px-4 flex flex-col items-center justify-center text-center bg-white"
                style={{
                  width: containerWidth ? `${containerWidth}px` : "100%",
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-400 mb-3 shadow-2xs">
                  <Clock className="w-6 h-6 stroke-[1.5] text-neutral-500" />
                </div>
                <p className="text-sm font-semibold text-neutral-900 tracking-tight">
                  No test drives scheduled for this date
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  Select a different date or schedule a drive from certified inventory.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenScheduleModal()}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Test Drive</span>
                </button>
              </div>
            ) : (
              vehiclesMap.map(({ vehicle, drives }) => (
                <div
                  key={vehicle.id}
                  className="flex h-28 hover:bg-neutral-50/40 transition group relative"
                >
                  {/* Sticky Vehicle Identity Column */}
                  <div className="w-60 shrink-0 p-3 border-r border-neutral-200/80 flex items-center gap-3 bg-white group-hover:bg-neutral-50 sticky left-0 z-30 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.06)]">
                    <div className="relative h-14 w-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      <Image
                        src={vehicle.heroImage}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-900 truncate">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {vehicle.variant || "Showroom Lot"}
                      </p>
                      {vehicle.registrationNumber ? (
                        <span className="inline-block mt-1 text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded border border-neutral-200">
                          {vehicle.registrationNumber}
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-[9px] font-mono text-neutral-400">
                          Certified Unit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hourly Grid Track */}
                  <div
                    className="relative h-full"
                    style={{ width: `${TOTAL_TRACK_WIDTH}px` }}
                  >
                    {/* Hour Vertical Grid Lines & Quarter Ticks */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {HOURS.map((h) => (
                        <div
                          key={h}
                          style={{ width: `${hourWidth}px` }}
                          className="border-r border-neutral-200/90 h-full relative shrink-0 flex"
                        >
                          {/* Quarter 15m line */}
                          <div className="w-1/4 h-full border-r border-dotted border-neutral-100" />
                          {/* Half 30m line */}
                          <div className="w-1/4 h-full border-r border-dashed border-neutral-200/80" />
                          {/* Quarter 45m line */}
                          <div className="w-1/4 h-full border-r border-dotted border-neutral-100" />
                          <div className="w-1/4 h-full" />
                        </div>
                      ))}
                    </div>

                    {/* Drive Appointment Cards (Strict 1:1 Timeline Start & End Alignment) */}
                    <div className="relative h-full w-full">
                      {drives.map((drive) => {
                        const driveDate = new Date(drive.scheduledAt);
                        const startHourDecimal =
                          driveDate.getHours() + driveDate.getMinutes() / 60;
                        const durationHours = drive.durationMinutes / 60;

                        // ─── Mathematical Timeline Alignment ───
                        // Start point aligns exactly to the scheduled minute:
                        const leftPx =
                          (startHourDecimal - START_HOUR) * hourWidth;
                        // Card width corresponds EXACTLY to the booked duration (e.g. 80m, 45m, 30m):
                        const cardWidthPx = durationHours * hourWidth;

                        // Status Color Schemes
                        let cardTheme =
                          "bg-amber-50/95 border-amber-300 text-amber-950 shadow-xs ring-1 ring-amber-300/40 hover:border-amber-400";
                        let statusChip = (
                          <span className="inline-flex items-center gap-1 text-[7px] font-medium text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-full shrink-0">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            <span>Scheduled</span>
                          </span>
                        );

                        if (drive.status === "in_progress") {
                          cardTheme =
                            "bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-xs ring-1 ring-emerald-400/40 hover:border-emerald-500";
                          statusChip = (
                            <span className="inline-flex items-center gap-1 text-[7px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full shrink-0">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
                              </span>
                              <span>On Road</span>
                            </span>
                          );
                        } else if (drive.status === "confirmed") {
                          cardTheme =
                            "bg-sky-50/95 border-sky-300 text-sky-950 shadow-xs ring-1 ring-sky-300/40 hover:border-sky-400";
                          statusChip = (
                            <span className="inline-flex items-center gap-1 text-[7px] font-medium text-sky-800 bg-sky-100/90 px-1.5 py-0.5 rounded-full shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5 text-sky-600" />
                              <span>Confirmed</span>
                            </span>
                          );
                        } else if (drive.status === "completed") {
                          cardTheme =
                            "bg-neutral-50/95 border-neutral-300 text-neutral-900 shadow-xs hover:border-neutral-400";
                          statusChip = (
                            <span className="inline-flex items-center gap-1 text-[7px] font-medium text-neutral-700 bg-neutral-200/80 px-1.5 py-0.5 rounded-full shrink-0">
                              <CheckCheck className="w-2.5 h-2.5 text-neutral-600" />
                              <span>Completed</span>
                            </span>
                          );
                        } else if (drive.status === "cancelled") {
                          cardTheme =
                            "bg-rose-50/95 border-rose-300 text-rose-950 shadow-xs hover:border-rose-400";
                          statusChip = (
                            <span className="inline-flex items-center gap-1 text-[7px] font-medium text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded-full shrink-0">
                              <span>Cancelled</span>
                            </span>
                          );
                        }

                        const timeRangeStr = formatTimeRange(
                          drive.scheduledAt,
                          drive.durationMinutes
                        );

                        return (
                          <div
                            key={drive.id}
                            onClick={() => onSelect(drive)}
                            style={{
                              left: `${leftPx}px`,
                              width: `${cardWidthPx}px`,
                            }}
                            className={`absolute top-1/2 -translate-y-1/2 h-19.5 rounded-xl border px-2.5 py-2 cursor-pointer transition-all duration-150 flex flex-col justify-between overflow-hidden z-10 hover:shadow-md hover:ring-2 hover:ring-neutral-400/30 ${cardTheme}`}
                            title={`Click to view dossier: ${drive.customerName} • ${drive.vehicle.brand} ${drive.vehicle.model} (${timeRangeStr})`}
                          >
                            {/* Line 1: Name */}
                            <div className="font-semibold text-xs text-neutral-900 truncate tracking-tight leading-tight">
                              {drive.customerName}
                            </div>

                            {/* Line 2: start time to end time */}
                            <div className="font-mono text-[8px] text-neutral-600 font-medium whitespace-nowrap leading-tight">
                              {timeRangeStr}
                            </div>

                            {/* Line 3: [Duration] + Status */}
                            <div className="flex items-center gap-1.5 text-[8px] min-w-0 pt-1 border-t border-black/5 overflow-hidden leading-tight">
                              <span className="font-mono font-medium px-1.5 py-0.5 rounded bg-black/5 text-neutral-700 shrink-0">
                                {drive.durationMinutes}m
                              </span>

                              {statusChip}

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
