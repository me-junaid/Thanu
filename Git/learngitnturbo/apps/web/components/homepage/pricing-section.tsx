"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    description: "For independent dealers digitizing their first showroom.",
    monthlyPrice: "₹2,999",
    annualPrice: "₹2,399",
    features: [
      "1 Showroom location",
      "Up to 25 cars listed",
      "Website: dealer.orgetise.com",
      "Customer inquiry forms",
      "Mobile-friendly showroom",
    ],
    cta: "Start 14-Day Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    description: "For growing dealers wanting their own website domain & WhatsApp CRM.",
    monthlyPrice: "₹5,999",
    annualPrice: "₹4,799",
    features: [
      "Up to 3 Showroom locations",
      "Up to 75 cars listed",
      "Your own website domain (yourbrand.in)",
      "Direct WhatsApp chat button",
      "Sales team & staff logins",
      "Priority phone & chat support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For multi-lot auto groups with multiple showrooms.",
    monthlyPrice: "₹11,999",
    annualPrice: "₹9,599",
    features: [
      "Unlimited locations & cars",
      "Multiple website domains",
      "Hidden purchase costs & profit tracker",
      "Transfer cars between branches",
      "Free 24-hr inventory import from Excel",
      "Dedicated account manager",
    ],
    cta: "Contact Enterprise Sales",
    popular: false,
  },
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <section id="pricing" className="mx-auto mt-28 max-w-7xl px-6 lg:px-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-neutral-900" />
          <span>Transparent Dealer Subscriptions</span>
        </div>
        <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-neutral-950 font-normal tracking-tight">
          Fair, predictable pricing. Zero car sale commissions.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
          Unlike listing aggregator apps that take a commission cut on every car you sell, you keep 100% of your profits.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white p-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              billingCycle === "monthly"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              billingCycle === "annual"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>Annual billing</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
        {PLANS.map((plan) => {
          const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-[2.25rem] p-8 shadow-xs transition duration-300 hover:shadow-xl ${
                plan.popular
                  ? "bg-neutral-950 text-white shadow-xl scale-[1.02] border-2 border-neutral-900"
                  : "bg-white text-neutral-900 border border-neutral-200/90"
              }`}
            >
              {plan.popular && (
                <div className="absolute text-center -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 border border-neutral-700 px-4 py-1 text-[10px] font-bold tracking-wider uppercase text-emerald-400 shadow-md">
                  Most Popular For Dealerships
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold tracking-tight">{plan.name}</h3>
                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    plan.popular ? "text-neutral-300" : "text-neutral-500"
                  }`}
                >
                  {plan.description}
                </p>

                {/* Price formatted in INR */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold">{price}</span>
                  <span
                    className={`text-xs font-mono ${
                      plan.popular ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    /month
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-1 ${
                    plan.popular ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  {billingCycle === "annual"
                    ? "Billed annually (excl. GST)"
                    : "Billed monthly (excl. GST)"}
                </p>

                {/* Features List */}
                <div
                  className={`mt-8 space-y-3 pt-6 border-t ${
                    plan.popular ? "border-neutral-800" : "border-neutral-100"
                  }`}
                >
                  <p
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      plan.popular ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    Included in plan:
                  </p>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-xs">
                      <Check
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          plan.popular ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <Link
                  href="/signup"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-semibold transition active:scale-98 ${
                    plan.popular
                      ? "bg-white text-neutral-950 hover:bg-neutral-100 shadow-md"
                      : "bg-neutral-950 text-white hover:bg-neutral-850 shadow-xs"
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
