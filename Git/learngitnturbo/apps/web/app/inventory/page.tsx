import type { Metadata } from "next";
import { SiteHeader } from "../../components/homepage/site-header";
import { SiteFooter } from "../../components/homepage/site-footer";
import { StorefrontHeader } from "../../components/inventory-page/storefront-header";
import { InventoryBrowser } from "../../components/inventory-page/inventory-browser";
import { FinancingCalculator } from "../../components/inventory-page/financing-calculator";
import { BuyingProcess } from "../../components/inventory-page/buying-process";

export const metadata: Metadata = {
  title: "Certified Luxury Pre-Owned Inventory | Apex Motors • Orgetise",
  description:
    "Browse certified pre-owned luxury sports cars, executive sedans, and performance SUVs at Apex Motors. Transparent pricing in INR, 150+ point inspection, and instant test drive booking.",
};

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans antialiased selection:bg-neutral-950 selection:text-white pb-24 md:pb-0">
      {/* ─── SHARED NAVIGATION & MOBILE DOCK ─── */}
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 lg:px-12 pt-8 pb-12 sm:pt-12 sm:pb-16">
        {/* ─── 01 DEALERSHIP STOREFRONT BANNER ─── */}
        <StorefrontHeader />

        {/* ─── 02 MULTI-FACET FILTER & VEHICLE GRID ─── */}
        <InventoryBrowser />

        {/* ─── 03 SHOWROOM FINANCING & EMI ESTIMATOR ─── */}
        <FinancingCalculator />

        {/* ─── 04 3-STEP CERTIFIED BUYING PROCESS & SHOWROOM VISIT ─── */}
        <BuyingProcess />
      </main>

      {/* ─── SHARED SITE FOOTER ─── */}
      <SiteFooter className="mt-12 sm:mt-16" />
    </div>
  );
}
