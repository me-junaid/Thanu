"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  ctaText: string;
  ctaHref: string;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For independent dealers digitizing their first showroom.",
    monthlyPrice: 2999,
    annualPrice: 2399,
    features: [
      "1 Showroom location",
      "Up to 25 cars listed",
      "Website: dealer.orgetise.com",
      "Customer inquiry forms",
      "Mobile-friendly showroom",
    ],
    ctaText: "Start 14-Day Free Trial",
    ctaHref: "/signup?plan=starter",
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    badge: "Most Popular",
    tagline: "For growing dealers wanting their own website domain & WhatsApp CRM.",
    monthlyPrice: 5999,
    annualPrice: 4799,
    features: [
      "Up to 3 Showroom locations",
      "Up to 75 cars listed",
      "Your own website domain (yourbrand.in)",
      "Direct WhatsApp chat button",
      "Sales team & staff logins",
      "Priority phone & chat support",
    ],
    ctaText: "Start 14-Day Free Trial",
    ctaHref: "/signup?plan=growth",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "Multi-Branch",
    tagline: "For multi-lot auto groups with multiple showrooms.",
    monthlyPrice: 11999,
    annualPrice: 9599,
    features: [
      "Unlimited locations & cars",
      "Multiple website domains",
      "Hidden purchase costs & profit tracker",
      "Transfer cars between branches",
      "Free 24-hr inventory import from Excel",
      "Dedicated account manager",
    ],
    ctaText: "Contact Enterprise Sales",
    ctaHref: "/signup?plan=enterprise",
    popular: false,
  },
];

export function PricingTiers() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <div className="w-full">
      {/* ─── BILLING FREQUENCY TOGGLE ─── */}
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="inline-flex items-center rounded-full bg-neutral-100 p-1 border border-neutral-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-white text-neutral-950 shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`relative rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            <span>Annual billing</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                billingCycle === "annual"
                  ? "bg-emerald-400 text-neutral-950"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              Save 20%
            </span>
          </button>
        </div>

        <p className="text-xs text-neutral-500 font-normal">
          {billingCycle === "annual"
            ? "Billed annually • Equivalent to 2 months free every year"
            : "Billed monthly • Cancel or upgrade your plan anytime"}
        </p>
      </div>

      {/* ─── 3-TIER PRICING CARDS ─── */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const currentPrice =
            billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-white border-2 border-neutral-950 shadow-xl ring-4 ring-neutral-950/5 lg:-translate-y-2"
                  : "bg-white/80 border border-neutral-200/90 shadow-sm hover:shadow-md hover:border-neutral-300"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3.5 py-1 text-[11px] font-semibold text-white shadow-md">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-normal text-neutral-950">
                    {plan.name}
                  </h3>
                  {!plan.popular && plan.badge && (
                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-medium text-neutral-700">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-neutral-600 font-light leading-relaxed min-h-[36px]">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1 border-b border-neutral-100 pb-6">
                  <span className="text-sm font-semibold text-neutral-900">₹</span>
                  <span className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-neutral-950">
                    {currentPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">
                    /month
                  </span>
                </div>

                {billingCycle === "annual" && (
                  <p className="mt-2 text-[11px] text-emerald-700 font-medium">
                    ₹{(currentPrice * 12).toLocaleString("en-IN")} billed annually (Save ₹
                    {((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString("en-IN")})
                  </p>
                )}

                {/* Simple Features List */}
                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                    Features included
                  </p>
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-xs text-neutral-800 font-normal leading-snug"
                      >
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Call to Action Button */}
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <Link
                  href={plan.ctaHref}
                  className={`group flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-xs font-semibold transition-all duration-200 active:scale-98 ${
                    plan.popular
                      ? "bg-neutral-950 text-white shadow-md hover:bg-neutral-800 hover:shadow-lg"
                      : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
                <p className="mt-2 text-center text-[10px] text-neutral-400">
                  14-day free trial • No card required
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
