"use client";

import { Car, Sparkles, ShieldCheck, Check } from "lucide-react";
import type { InventorySize, OnboardingData } from "./types";

interface StepFleetProfileProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}

const VEHICLE_SEGMENTS = [
  "Luxury Sports & Supercars",
  "Executive Sedans & SUVs",
  "EV & Hybrid Performance",
  "Certified Family & Commuter",
  "Vintage & Modern Classics",
  "Commercial Fleets",
];

const INVENTORY_VOLUMES: { id: InventorySize; label: string; desc: string }[] = [
  { id: "under-20", label: "Boutique (Under 20 cars)", desc: "Curated high-turnover lot" },
  { id: "20-50", label: "Medium (20 – 50 cars)", desc: "Standard multi-category dealership" },
  { id: "50-100", label: "High Volume (50 – 100 cars)", desc: "Multi-branch regional dealer" },
  { id: "100-plus", label: "Enterprise (100+ cars)", desc: "Multi-city dealership network" },
];

export function StepFleetProfile({ data, onChange, errors }: StepFleetProfileProps) {
  const toggleSegment = (segment: string) => {
    const current = new Set(data.segments);
    if (current.has(segment)) {
      current.delete(segment);
    } else {
      current.add(segment);
    }
    onChange({ segments: Array.from(current) });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-800">
          <Car className="h-3.5 w-3.5 text-neutral-900" />
          <span>Step 4 of 4 • Fleet Profile & Launch</span>
        </div>
        <h2 className="mt-3 font-serif text-2xl sm:text-3xl text-neutral-950 font-normal tracking-tight">
          Configure your fleet & launch
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-light">
          Set up your primary car segments, inventory size, and choose whether to preload starter vehicles.
        </p>
      </div>

      <div className="space-y-5">
        {/* Vehicle Segments */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-2">
            Primary Vehicle Categories (Select all that apply) <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_SEGMENTS.map((segment) => {
              const isSelected = data.segments.includes(segment);
              return (
                <button
                  key={segment}
                  type="button"
                  onClick={() => toggleSegment(segment)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition active:scale-95 ${
                    isSelected
                      ? "bg-neutral-950 text-white shadow-xs"
                      : "bg-white text-neutral-700 border border-neutral-200/90 hover:border-neutral-400 hover:text-neutral-950"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                  <span>{segment}</span>
                </button>
              );
            })}
          </div>
          {errors.segments && (
            <p className="mt-1 text-[11px] font-medium text-red-600">{errors.segments}</p>
          )}
        </div>

        {/* Inventory Size */}
        <div>
          <label
            htmlFor="inventorySize"
            className="block text-xs font-semibold text-neutral-800 mb-1.5"
          >
            Average Active Fleet Size
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {INVENTORY_VOLUMES.map((vol) => {
              const isSelected = data.inventorySize === vol.id;
              return (
                <button
                  key={vol.id}
                  type="button"
                  onClick={() => onChange({ inventorySize: vol.id })}
                  className={`flex flex-col items-start rounded-2xl border p-3 text-left transition active:scale-98 ${
                    isSelected
                      ? "border-neutral-950 bg-neutral-50/80 shadow-xs ring-2 ring-neutral-950/10"
                      : "border-neutral-200/90 bg-white hover:border-neutral-400"
                  }`}
                >
                  <p className="text-xs font-bold text-neutral-900">{vol.label}</p>
                  <p className="text-[10px] text-neutral-400 font-light mt-0.5">{vol.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preload Demo Fleet Card (Toggle) */}
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.preloadSampleCars}
              onChange={(e) => onChange({ preloadSampleCars: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 accent-neutral-950"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-900">
                  Pre-populate with 6 certified demo vehicles
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">
                  <Sparkles className="h-2.5 w-2.5" /> Recommended
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                Loads high-resolution verified inventory listings (Porsche 911, AMG GT, BMW M4) in Indian Rupees so your public storefront looks complete immediately. You can delete or edit them anytime.
              </p>
            </div>
          </label>
        </div>

        {/* Tenant Policy & Terms Agreement */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.agreeTerms}
              onChange={(e) => onChange({ agreeTerms: e.target.checked })}
              className={`mt-1 h-4 w-4 rounded text-neutral-950 focus:ring-neutral-950 accent-neutral-950 ${
                errors.agreeTerms ? "ring-2 ring-red-500" : "border-neutral-300"
              }`}
            />
            <div>
              <p className="text-xs font-medium text-neutral-800">
                I agree to the Orgetise Multi-Tenant Platform Agreement & Isolated Data Policy.
              </p>
              <p className="text-[10px] text-neutral-400 font-light mt-0.5 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>
                  Your dealership records, leads, and financials are isolated via PostgreSQL Row-Level Security and will never be shared with competing dealerships.
                </span>
              </p>
            </div>
          </label>
          {errors.agreeTerms && (
            <p className="mt-1.5 text-[11px] font-medium text-red-600 pl-7">
              {errors.agreeTerms}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

