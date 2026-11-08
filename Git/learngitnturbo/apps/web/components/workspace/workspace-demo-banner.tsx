import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Globe2 } from "lucide-react";

export function WorkspaceDemoBanner() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-xs">
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-950">
                Interactive Command Center Demo
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-light mt-0.5 flex items-center gap-1">
              Currently simulating: <strong className="font-semibold text-neutral-800">Apex Motors</strong> •{" "}
              <Globe2 className="h-3 w-3 text-neutral-400 inline" /> apexperformance.in
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 active:scale-98 w-full sm:w-auto"
          >
            <span>Launch Your Dealership</span>
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

