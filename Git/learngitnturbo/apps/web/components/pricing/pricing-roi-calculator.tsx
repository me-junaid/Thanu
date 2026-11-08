"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, ShieldCheck, DollarSign, Sparkles } from "lucide-react";

export function PricingRoiCalculator() {
  const [carsSoldPerMonth, setCarsSoldPerMonth] = useState<number>(15);
  const [avgCarPriceLakhs, setAvgCarPriceLakhs] = useState<number>(8); // in Lakhs (₹8,00,000)

  // Calculations:
  // Typical aggregator/marketplace lead fee or commission is ~1% of car value or ~₹4,000 per closed vehicle.
  const aggregatorFeePerSale = Math.max(3500, Math.round(avgCarPriceLakhs * 100000 * 0.0075));
  const aggregatorMonthlyCost = carsSoldPerMonth * aggregatorFeePerSale;
  const orgetiseMonthlyCost = 4799; // Growth Plan Annual equivalent

  const monthlySavings = Math.max(0, aggregatorMonthlyCost - orgetiseMonthlyCost);
  const annualSavings = monthlySavings * 12;

  // Payoff: How many cars does it take to cover 1 year of Orgetise Growth (₹57,588)?
  // Typical gross margin on a used car in India is ₹40,000 - ₹80,000.
  const estimatedMarginPerCar = Math.round(avgCarPriceLakhs * 100000 * 0.08); // 8% gross profit
  const annualOrgetiseCost = orgetiseMonthlyCost * 12; // ₹57,588
  const carsToCoverYear = (annualOrgetiseCost / estimatedMarginPerCar).toFixed(1);

  return (
    <section className="rounded-3xl bg-neutral-900 text-white p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-semibold text-neutral-200 backdrop-blur-md">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          <span>Interactive Margin Protection Calculator</span>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Inputs & Sliders */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
                Calculate your dealership savings
              </h2>
              <p className="mt-3 text-sm text-neutral-300 font-light leading-relaxed">
                Aggregator classifieds charge listing fees and lead commissions, while reselling your customer inquiries to 3 other dealers. With Orgetise, you pay a flat SaaS rate and keep 100% of your margins.
              </p>
            </div>

            {/* Slider 1: Cars Sold per Month */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="cars-slider"
                  className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono"
                >
                  Vehicles Sold per Month
                </label>
                <span className="font-serif text-2xl font-normal text-emerald-400">
                  {carsSoldPerMonth} cars
                </span>
              </div>
              <input
                id="cars-slider"
                type="range"
                min="3"
                max="60"
                step="1"
                value={carsSoldPerMonth}
                onChange={(e) => setCarsSoldPerMonth(Number(e.target.value))}
                className="mt-4 w-full accent-emerald-400 cursor-pointer h-2 bg-neutral-700 rounded-lg"
              />
              <div className="mt-2 flex justify-between text-[11px] text-neutral-400 font-mono">
                <span>3 cars/mo</span>
                <span>30 cars/mo</span>
                <span>60+ cars/mo</span>
              </div>
            </div>

            {/* Slider 2: Average Vehicle Price */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="price-slider"
                  className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono"
                >
                  Average Vehicle Price
                </label>
                <span className="font-serif text-2xl font-normal text-amber-300">
                  ₹{avgCarPriceLakhs} Lakhs
                </span>
              </div>
              <input
                id="price-slider"
                type="range"
                min="3"
                max="35"
                step="1"
                value={avgCarPriceLakhs}
                onChange={(e) => setAvgCarPriceLakhs(Number(e.target.value))}
                className="mt-4 w-full accent-amber-300 cursor-pointer h-2 bg-neutral-700 rounded-lg"
              />
              <div className="mt-2 flex justify-between text-[11px] text-neutral-400 font-mono">
                <span>₹3 Lakhs (Budget)</span>
                <span>₹15 Lakhs (Mid-tier)</span>
                <span>₹35+ Lakhs (Luxury)</span>
              </div>
            </div>
          </div>

          {/* Right: Results Display Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-white p-7 sm:p-9 text-neutral-950 shadow-2xl border border-neutral-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Projected Annual Impact
              </span>

              {/* Huge Savings Metric */}
              <div className="mt-4 pb-6 border-b border-neutral-100">
                <p className="text-xs font-semibold text-neutral-500">
                  Annual profit retained in your dealership:
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-semibold text-neutral-900">₹</span>
                  <span className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-neutral-950">
                    {annualSavings.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ml-2">
                    Saved / year
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
                  <p className="text-[11px] text-neutral-500 font-medium">Aggregator / Portal Fee</p>
                  <p className="mt-1 font-serif text-xl font-normal text-rose-600">
                    ₹{aggregatorMonthlyCost.toLocaleString("en-IN")}<span className="text-xs text-neutral-400">/mo</span>
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Based on ~₹{aggregatorFeePerSale.toLocaleString("en-IN")} cut per car</p>
                </div>

                <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100">
                  <p className="text-[11px] text-emerald-900 font-medium">Orgetise Growth SaaS</p>
                  <p className="mt-1 font-serif text-xl font-normal text-emerald-950">
                    ₹{orgetiseMonthlyCost.toLocaleString("en-IN")}<span className="text-xs text-neutral-500">/mo</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Fixed flat rate • Zero cuts</p>
                </div>
              </div>

              {/* Breakeven highlight */}
              <div className="mt-6 rounded-2xl bg-neutral-900 p-4 text-white flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    Instant Breakeven Guarantee
                  </p>
                  <p className="text-[11px] text-neutral-300 font-light mt-0.5">
                    Selling just <strong className="text-white">{carsToCoverYear} car</strong> covers your entire year of software subscription. Every extra sale is 100% pure profit.
                  </p>
                </div>
              </div>

              {/* CTA Link */}
              <div className="mt-6 pt-4 text-center">
                <Link
                  href="/signup?plan=growth"
                  className="group inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-neutral-950 py-3.5 px-6 text-xs font-semibold text-white shadow-md hover:bg-neutral-800 transition active:scale-98"
                >
                  <span>Claim Your Dealership Independence</span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

