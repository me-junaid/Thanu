export default function TeamLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* ── Top Header Skeleton ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div className="space-y-2">
          <div className="h-8 w-48 sm:w-64 rounded-xl bg-neutral-200/80" />
          <div className="h-4 w-60 sm:w-80 rounded-lg bg-neutral-200/60" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-neutral-200/80 self-start sm:self-auto" />
      </div>

      {/* ── 4 Stat Cards Skeleton ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-neutral-200/60" />
              <div className="h-8 w-8 rounded-xl bg-neutral-200/70" />
            </div>
            <div className="h-7 w-14 rounded-lg bg-neutral-200/80" />
            <div className="h-2.5 w-24 rounded bg-neutral-200/50" />
          </div>
        ))}
      </div>

      {/* ── Filter Toolbar Skeleton ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-neutral-200/80 bg-white">
        <div className="h-10 w-full sm:w-72 rounded-xl bg-neutral-200/70" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-xl bg-neutral-200/60" />
          <div className="h-9 w-28 rounded-xl bg-neutral-200/60" />
        </div>
      </div>

      {/* ── Roster Table Skeleton ── */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-neutral-200/70" />
          <div className="h-4 w-20 rounded bg-neutral-200/60" />
        </div>

        <div className="divide-y divide-neutral-100">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 sm:p-5 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-full bg-neutral-200/80 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 sm:w-40 rounded bg-neutral-200/80" />
                  <div className="h-3 w-24 sm:w-32 rounded bg-neutral-200/50" />
                </div>
              </div>

              <div className="hidden sm:block h-6 w-28 rounded-lg bg-neutral-200/60" />
              <div className="hidden md:block h-5 w-16 rounded-full bg-neutral-200/60" />
              <div className="hidden lg:block h-3 w-28 rounded bg-neutral-200/50" />
              <div className="h-8 w-8 rounded-lg bg-neutral-200/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

