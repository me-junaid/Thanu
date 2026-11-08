import type { Metadata } from "next";
import { Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "../../components/homepage/site-header";
import { SiteFooter } from "../../components/homepage/site-footer";
import { SoftAurora } from "../../components/ui/soft-aurora";
import { PricingTiers } from "../../components/pricing/pricing-tiers";
import { PricingRoiCalculator } from "../../components/pricing/pricing-roi-calculator";
import { PricingComparisonTable } from "../../components/pricing/pricing-comparison-table";
import { PricingMigrationBanner } from "../../components/pricing/pricing-migration-banner";
import { PricingFaq } from "../../components/pricing/pricing-faq";

export const metadata: Metadata = {
  title: "Pricing Plans & ROI Calculator | Orgetise Dealership SaaS",
  description:
    "Transparent, flat software pricing for pre-owned automobile dealerships in India. Zero commission on car sales, custom domain with SSL, and multi-branch inventory management.",
};

const TRUST_BADGES = [
  "No credit card required for 14-day trial",
  "GST invoice with ITC credit for Indian businesses",
  "Zero commission or percentage cuts on vehicle sales",
  "Cancel, upgrade, or pause your plan at any time",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans antialiased selection:bg-neutral-950 selection:text-white pb-24 md:pb-0">
      {/* ─── UNIFIED HEADER & MOBILE DOCK ─── */}
      <SiteHeader />

      <main className="relative mx-auto  px-6 lg:px-12 pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Ambient Soft Aurora Atmosphere */}
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-full h-[560px] overflow-hidden -z-0 opacity-75 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]">
          <SoftAurora
            speed={0.6}
    scale={1.5}
    brightness={1.2}
    color1="#f7f7f7"
    color2="#e100ff"
    bandHeight={0.5}
    bandSpread={0.55}
    enableMouseInteraction
    mouseInfluence={0.25}
    noiseFrequency={1.5}
    opacity={0.7}
    lightMode={true}
            className="w-full h-full"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* ─── 01 HERO SECTION ─── */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-neutral-950" />
            <span>Transparent Dealership Pricing — Zero Commission on Sales</span>
          </div>

          <h1 className="mt-8 font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-neutral-950 leading-[1.12]">
            Predictable software pricing.{" "}
            <span className="block mt-1 sm:mt-2 italic font-light text-neutral-850">
              Zero cuts from your car margins.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-600 font-light leading-relaxed">
            Stop paying classified portals high listing fees or watching aggregators resell your buyer leads to rival showrooms. Orgetise equips your dealership with an independent digital operating system for a flat, predictable subscription.
          </p>

          {/* Quick Trust Strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500 font-medium">
            {TRUST_BADGES.map((badge) => (
              <div key={badge} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 02 PRICING TIERS & BILLING TOGGLE ─── */}
        <div className="mt-16">
          <PricingTiers />
        </div>

        {/* ─── 03 INTERACTIVE ROI / MARGIN PROTECTION CALCULATOR ─── */}
        <div className="mt-28">
          <PricingRoiCalculator />
        </div>

        {/* ─── 04 SIDE-BY-SIDE FEATURE COMPARISON MATRIX ─── */}
        <PricingComparisonTable />

        {/* ─── 05 WHITE-GLOVE FLEET MIGRATION BANNER ─── */}
        <PricingMigrationBanner />

        {/* ─── 06 DEALERSHIP FAQ ACCORDION ─── */}
        <PricingFaq />
      </main>

      {/* ─── SITE FOOTER ─── */}
      <SiteFooter />
    </div>
  );
}

