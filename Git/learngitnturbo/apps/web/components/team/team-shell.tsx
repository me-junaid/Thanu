"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { getTeamRosterAction, type TeamRosterResponse } from "../../app/dashboard/team/actions";
import { TeamManagementClient } from "../../app/dashboard/team/team-management-client";
import { RefreshCw, ShieldAlert } from "lucide-react";

interface TeamShellProps {
  initialData?: TeamRosterResponse;
}

export function TeamShell({ initialData }: TeamShellProps) {
  // SWR: in-memory client cache with background revalidation
  const { data, error, isLoading, mutate } = useSWR<TeamRosterResponse>(
    "dashboard-team-roster-data",
    async () => {
      const res = await getTeamRosterAction();
      return res;
    },
    {
      fallbackData: initialData,
      dedupingInterval: 60000,
      revalidateOnFocus: false,
      revalidateIfStale: true,
      keepPreviousData: true,
    }
  );

  const roster = data ?? initialData;

  // 1. Loading Skeleton (first visit via instant SPA tab switch)
  if (isLoading && !roster) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/70">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-neutral-200/80 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-neutral-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-neutral-200/80 rounded-xl animate-pulse" />
        </div>

        {/* 4 Metric Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-neutral-200/80 bg-white p-4 space-y-3 animate-pulse"
            >
              <div className="h-4 w-20 bg-neutral-100 rounded" />
              <div className="h-7 w-12 bg-neutral-200/80 rounded" />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 space-y-4 animate-pulse">
          <div className="h-10 w-full bg-neutral-100 rounded-xl" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 w-full bg-neutral-50 rounded-xl flex items-center px-4 gap-3">
                <div className="h-9 w-9 rounded-full bg-neutral-200 shrink-0" />
                <div className="h-4 w-40 bg-neutral-200 rounded" />
                <div className="ml-auto h-6 w-24 bg-neutral-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || (roster && !roster.success)) {
    const errorMsg = error?.message || roster?.error || "Could not retrieve showroom team roster.";
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200/90 bg-white p-8 text-center shadow-xl shadow-neutral-900/5">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-neutral-950">
            Could Not Load Team Workspace
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
            {errorMsg}
          </p>

          <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            >
              Overview
            </Link>

            <button
              onClick={() => mutate()}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!roster) {
    return null;
  }

  return <TeamManagementClient initialData={roster} />;
}

