import React from "react";

export function AutoNationLogo({ className = "h-7" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-sans select-none ${className}`}>
      <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <span className="font-extrabold tracking-tight text-xs uppercase sm:text-sm">
        AutoNation<span className="text-neutral-400 font-normal">Direct</span>
      </span>
    </div>
  );
}

export function CarMaxLogo({ className = "h-7" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-black text-white">
        C
      </span>
      <span className="font-sans text-xs sm:text-sm font-black tracking-wider uppercase">
        CARMAX
      </span>
    </div>
  );
}

export function CarvanaLogo({ className = "h-7" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      <svg className="h-5 w-5 shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-5" />
      </svg>
      <span className="font-serif italic text-sm sm:text-base font-bold tracking-tight">
        carvana
      </span>
    </div>
  );
}

export function DriveTimeLogo({ className = "h-7" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="flex h-4 w-6 items-center justify-center rounded-full border border-current">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      </div>
      <span className="font-sans text-xs sm:text-sm font-bold tracking-tight">
        drive<span className="font-light">time</span>
      </span>
    </div>
  );
}

export function CazooLogo({ className = "h-7" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 select-none ${className}`}>
      <span className="font-mono text-sm sm:text-base font-black tracking-tighter">
        CAZOO
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mb-1" />
    </div>
  );
}

export function Cars24Logo({ className = "h-7" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      <span className="font-sans text-xs sm:text-sm font-black tracking-widest uppercase">
        CARS
      </span>
      <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
        24
      </span>
    </div>
  );
}

