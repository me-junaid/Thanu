"use client";

import { Building2, Globe2, Sparkles, Check } from "lucide-react";
import {
  THEME_CONFIG,
  type BrandTheme,
  type OnboardingData,
} from "./types";

interface StepDealershipIdentityProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}

export function StepDealershipIdentity({
  data,
  onChange,
  errors,
}: StepDealershipIdentityProps) {
  const handleNameChange = (name: string) => {
    // Automatically generate clean slug if user hasn't explicitly customized it
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 24);

    onChange({
      dealershipName: name,
      slug: generatedSlug,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-800">
          <Sparkles className="h-3.5 w-3.5 text-neutral-900" />
          <span>Step 1 of 4 • Identity & Brand</span>
        </div>
        <h2 className="mt-3 font-serif text-2xl sm:text-3xl text-neutral-950 font-normal tracking-tight">
          What is your dealership called?
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-light">
          This name and branding will power your public storefront, search indexing, and customer invoices.
        </p>
      </div>

      <div className="space-y-4">
        {/* Dealership Name */}
        <div>
          <label
            htmlFor="dealershipName"
            className="block text-xs font-semibold text-neutral-800 mb-1.5"
          >
            Dealership Trade Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="dealershipName"
              type="text"
              placeholder="e.g. Apex Motors, Royal Drive"
              value={data.dealershipName}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:outline-none transition ${
                errors.dealershipName
                  ? "border-red-500 focus:border-red-600 ring-2 ring-red-100"
                  : "border-neutral-200/90 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-950/5"
              }`}
            />
            <Building2 className="absolute right-4 top-3.5 h-4 w-4 text-neutral-400" />
          </div>
          {errors.dealershipName ? (
            <p className="mt-1 text-[11px] font-medium text-red-600">
              {errors.dealershipName}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-neutral-400 font-light">
              Enter the consumer-facing brand name of your pre-owned car business.
            </p>
          )}
        </div>

        {/* Subdomain Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-xs font-semibold text-neutral-800 mb-1.5"
          >
            Subdomain & Storefront URL <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center rounded-2xl border border-neutral-200/90 bg-white px-3.5 py-2.5 shadow-2xs focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-950/5">
            <span className="font-mono text-xs text-neutral-400 select-none pr-1">
              https://
            </span>
            <input
              id="slug"
              type="text"
              placeholder="apexmotors"
              value={data.slug}
              onChange={(e) =>
                onChange({
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                })
              }
              className="flex-1 font-mono text-xs font-semibold text-neutral-900 focus:outline-none"
            />
            <span className="font-mono text-xs text-neutral-400 select-none pl-1">
              .dealers.io
            </span>
          </div>
          {errors.slug && (
            <p className="mt-1 text-[11px] font-medium text-red-600">{errors.slug}</p>
          )}
        </div>

        {/* Custom Domain (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="customDomain"
              className="block text-xs font-semibold text-neutral-800"
            >
              Custom Domain (Optional)
            </label>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Auto SSL Included
            </span>
          </div>
          <div className="relative">
            <input
              id="customDomain"
              type="text"
              placeholder="e.g. apexmotors.in or luxurycars.com"
              value={data.customDomain}
              onChange={(e) => onChange({ customDomain: e.target.value.toLowerCase().trim() })}
              className="w-full rounded-2xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:border-neutral-900 focus:outline-none transition"
            />
            <Globe2 className="absolute right-4 top-3.5 h-4 w-4 text-neutral-400" />
          </div>
          <p className="mt-1 text-[11px] text-neutral-400 font-light">
            You can connect your own domain anytime later via DNS verification.
          </p>
        </div>

        {/* Tagline */}
        <div>
          <label
            htmlFor="tagline"
            className="block text-xs font-semibold text-neutral-800 mb-1.5"
          >
            Showroom Tagline / Motto
          </label>
          <input
            id="tagline"
            type="text"
            placeholder="e.g. Certified Pre-Owned Luxury & Performance"
            value={data.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            className="w-full rounded-2xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:border-neutral-900 focus:outline-none transition"
          />
        </div>

        {/* Brand Theme Presets */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-neutral-800 mb-2">
            Showroom Brand Theme Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(THEME_CONFIG) as BrandTheme[]).map((themeKey) => {
              const theme = THEME_CONFIG[themeKey];
              const isSelected = data.theme === themeKey;

              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => onChange({ theme: themeKey })}
                  className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition active:scale-98 ${
                    isSelected
                      ? `border-neutral-950 bg-neutral-50/80 shadow-xs ring-2 ring-neutral-950/10`
                      : `border-neutral-200/90 bg-white hover:border-neutral-400`
                  }`}
                >
                  <div
                    className={`h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br ${theme.headerGradient} flex items-center justify-center text-white shadow-2xs`}
                  >
                    {isSelected ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white/60" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{theme.name}</p>
                    <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                      {theme.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

