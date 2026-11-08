import Link from "next/link";
import { ArrowRight, FileSpreadsheet, ShieldCheck, Zap } from "lucide-react";

export function PricingMigrationBanner() {
  return (
    <section className="mt-20">
      <div className="relative overflow-hidden rounded-3xl bg-neutral-950 p-8 sm:p-12 text-white shadow-xl">
        {/* Glow */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-semibold text-neutral-200">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Free Concierge Fleet Migration</span>
            </div>

            <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-normal text-white tracking-tight leading-snug">
              Have 100+ vehicles on Excel or another dealer system?
            </h3>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              Don&apos;t spend days re-entering your stock. Email or upload your existing CSV, Excel file, or portal login, and our engineers will import your complete inventory, vehicle specs, and photo galleries within 24 hours — 100% free.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span>Zero downtime for active listings</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Encrypted data handling & NDA guarantee</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <Link
              href="/signup?ref=concierge-migration"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 px-6 text-xs font-semibold text-neutral-950 shadow-md hover:bg-neutral-100 transition active:scale-98"
            >
              <span>Request Free Migration</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
            <p className="text-center text-[10px] text-neutral-400">
              Includes complimentary WhatsApp training for your team
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

