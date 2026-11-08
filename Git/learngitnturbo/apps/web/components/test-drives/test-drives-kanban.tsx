"use client";

import React from "react";
import type { TestDriveItem } from "../../app/dashboard/test-drives/actions";
import { TestDriveCard } from "./test-drive-card";
import { Clock, CheckCircle2, Car, CheckCheck, CalendarX2 } from "lucide-react";

interface TestDrivesKanbanProps {
  testDrives: TestDriveItem[];
  isLoading?: boolean;
  onSelect: (item: TestDriveItem) => void;
  onOpenGatePass: (item: TestDriveItem) => void;
  onOpenCheckin: (item: TestDriveItem) => void;
  onConfirm: (id: string) => void;
}

interface ColumnDef {
  id: string;
  title: string;
  icon: typeof Clock;
  filter: (item: TestDriveItem) => boolean;
  accentColor: string;
  bgHeader: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: "scheduled",
    title: "Scheduled",
    icon: Clock,
    filter: (item) => item.status === "scheduled",
    accentColor: "text-amber-700",
    bgHeader: "bg-amber-100/60 border-amber-200/80",
  },
  {
    id: "confirmed",
    title: "Confirmed & Ready",
    icon: CheckCircle2,
    filter: (item) => item.status === "confirmed",
    accentColor: "text-sky-700",
    bgHeader: "bg-sky-100/60 border-sky-200/80",
  },
  {
    id: "in_progress",
    title: "Active On Road",
    icon: Car,
    filter: (item) => item.status === "in_progress",
    accentColor: "text-emerald-800",
    bgHeader: "bg-emerald-100/70 border-emerald-300/80",
  },
  {
    id: "completed",
    title: "Completed",
    icon: CheckCheck,
    filter: (item) => item.status === "completed",
    accentColor: "text-neutral-700",
    bgHeader: "bg-neutral-100 border-neutral-200",
  },
];

export function TestDrivesKanban({
  testDrives,
  isLoading = false,
  onSelect,
  onOpenGatePass,
  onOpenCheckin,
  onConfirm,
}: TestDrivesKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-none min-h-137.5">
      {COLUMNS.map((col) => {
        const Icon = col.icon;
        const columnItems = testDrives.filter(col.filter);

        return (
          <div
            key={col.id}
            className="flex flex-col w-78.75 sm:w-82.5 h-[calc(100vh-240px)] shrink-0 bg-neutral-50/80 rounded-2xl border border-neutral-200/70 p-3"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-neutral-200/60 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg ${col.bgHeader} ${col.accentColor}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="font-semibold text-xs text-neutral-900 tracking-tight">
                  {col.title}
                </span>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-600 shadow-2xs">
                {columnItems.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-none">
              {columnItems.length === 0 ? (
                isLoading ? (
                  <div className="space-y-3 pt-1">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-neutral-200/80 bg-white p-4 space-y-3 animate-pulse shadow-2xs"
                      >
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-28 bg-neutral-200 rounded" />
                          <div className="h-4 w-12 bg-neutral-100 rounded-full" />
                        </div>
                        <div className="h-3.5 w-36 bg-neutral-200 rounded" />
                        <div className="h-3 w-24 bg-neutral-100 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-neutral-200 rounded-xl bg-white/50 text-neutral-400 mt-2">
                    <CalendarX2 className="w-6 h-6 mb-1 text-neutral-300 stroke-[1.5]" />
                    <p className="text-xs font-medium text-neutral-500">No appointments</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Nothing in this stage</p>
                  </div>
                )
              ) : (
                columnItems.map((drive) => (
                  <TestDriveCard
                    key={drive.id}
                    testDrive={drive}
                    onSelect={onSelect}
                    onOpenGatePass={onOpenGatePass}
                    onOpenCheckin={onOpenCheckin}
                    onConfirm={onConfirm}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

