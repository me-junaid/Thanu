import type { Metadata } from "next";
import { Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "../../components/homepage/site-header";
import { SiteFooter } from "../../components/homepage/site-footer";
import { WorkspaceDemoBanner } from "../../components/workspace/workspace-demo-banner";
import { WorkspaceShell } from "../../components/workspace/workspace-shell";

export const metadata: Metadata = {
  title: "Dealership Command Center & Workspace | Orgetise SaaS",
  description:
    "Interactive live preview of Orgetise: the complete operating system for pre-owned automobile dealerships. Manage fleet inventory, lead CRM, test drives, and profit margins.",
};

const WORKSPACE_BENEFITS = [
  "Multi-branch fleet synchronization",
  "Direct WhatsApp & web lead pipeline",
  "Private purchase cost & profit protection",
  "Role-based staff permissions",
];

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans antialiased selection:bg-neutral-950 selection:text-white pb-24 md:pb-0">
      {/* ─── UNIFIED HEADER & MOBILE DOCK ─── */}
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 lg:px-12 pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* ─── HERO HEADER ─── */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-neutral-950" />
            <span>Interactive Dealership Command Center</span>
          </div>

          <h1 className="mt-8 font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-neutral-950 leading-[1.12]">
            The operating system behind{" "}
            <span className="block mt-1 sm:mt-2 italic font-light text-neutral-850">
              modern automotive dealerships.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-600 font-light leading-relaxed">
            Test-drive the real dealership workspace. Switch between live stock inventory, incoming buyer leads, unit economics accounting, and multi-branch staff coordination.
          </p>

          {/* Quick Features List */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500 font-medium">
            {WORKSPACE_BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SIMULATION DEMO BANNER ─── */}
        <div className="mt-12">
          <WorkspaceDemoBanner />
        </div>

        {/* ─── INTERACTIVE WORKSPACE APPLICATION ─── */}
        <div className="mt-8">
          <WorkspaceShell />
        </div>
      </main>

      {/* ─── SITE FOOTER ─── */}
      <SiteFooter />
    </div>
  );
}

