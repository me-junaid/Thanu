"use client";

import { MapPin, Navigation, Building, Check } from "lucide-react";
import {
  INDIAN_STATES,
  type LotCapacity,
  type OnboardingData,
} from "./types";

interface StepLocationProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}

const CAPACITY_OPTIONS: { id: LotCapacity; title: string; desc: string; icon: string }[] = [
  {
    id: "boutique",
    title: "Boutique Studio",
    desc: "1 – 15 curated vehicles",
    icon: "🏎️",
  },
  {
    id: "medium",
    title: "Standard Showroom",
    desc: "15 – 40 vehicles",
    icon: "🏢",
  },
  {
    id: "large",
    title: "Multi-Bay Stockyard",
    desc: "40+ vehicle fleet",
    icon: "🏛️",
  },
];

export function StepLocation({ data, onChange, errors }: StepLocationProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-800">
          <MapPin className="h-3.5 w-3.5 text-neutral-900" />
          <span>Step 2 of 4 • Primary Showroom Location</span>
        </div>
        <h2 className="mt-3 font-serif text-2xl sm:text-3xl text-neutral-950 font-normal tracking-tight">
          Where is your primary showroom?
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-light">
          Car buyers look for verified physical showroom addresses before scheduling test drives.
        </p>
      </div>

      <div className="space-y-4">
        {/* Street Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-xs font-semibold text-neutral-800 mb-1.5"
          >
            Showroom Physical Address <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            placeholder="e.g. #42, 100ft Road, 4th Block"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:outline-none transition ${
              errors.address
                ? "border-red-500 focus:border-red-600 ring-2 ring-red-100"
                : "border-neutral-200/90 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-950/5"
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-[11px] font-medium text-red-600">{errors.address}</p>
          )}
        </div>

        {/* City, State, PIN Code Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-xs font-semibold text-neutral-800 mb-1.5"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              type="text"
              placeholder="e.g. Bengaluru"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:outline-none transition ${
                errors.city
                  ? "border-red-500 focus:border-red-600 ring-2 ring-red-100"
                  : "border-neutral-200/90 focus:border-neutral-900"
              }`}
            />
            {errors.city && (
              <p className="mt-1 text-[11px] font-medium text-red-600">{errors.city}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label
              htmlFor="state"
              className="block text-xs font-semibold text-neutral-800 mb-1.5"
            >
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
              className="w-full rounded-2xl border border-neutral-200/90 bg-white px-3.5 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:border-neutral-900 focus:outline-none transition"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* PIN Code */}
          <div>
            <label
              htmlFor="pincode"
              className="block text-xs font-semibold text-neutral-800 mb-1.5"
            >
              PIN Code <span className="text-red-500">*</span>
            </label>
            <input
              id="pincode"
              type="text"
              maxLength={6}
              placeholder="e.g. 560034"
              value={data.pincode}
              onChange={(e) =>
                onChange({ pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6) })
              }
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:outline-none transition ${
                errors.pincode
                  ? "border-red-500 focus:border-red-600 ring-2 ring-red-100"
                  : "border-neutral-200/90 focus:border-neutral-900"
              }`}
            />
            {errors.pincode && (
              <p className="mt-1 text-[11px] font-medium text-red-600">{errors.pincode}</p>
            )}
          </div>
        </div>

        {/* Google Maps Landmark URL */}
        <div>
          <label
            htmlFor="mapsUrl"
            className="block text-xs font-semibold text-neutral-800 mb-1.5"
          >
            Google Maps Direction Link (Optional)
          </label>
          <div className="relative">
            <input
              id="mapsUrl"
              type="url"
              placeholder="e.g. https://maps.google.com/?q=..."
              value={data.mapsUrl}
              onChange={(e) => onChange({ mapsUrl: e.target.value })}
              className="w-full rounded-2xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:border-neutral-900 focus:outline-none transition"
            />
            <Navigation className="absolute right-4 top-3.5 h-4 w-4 text-neutral-400" />
          </div>
          <p className="mt-1 text-[11px] text-neutral-400 font-light">
            Enables one-click "Showroom Directions" navigation on your live website.
          </p>
        </div>

        {/* Lot Capacity */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-neutral-800 mb-2">
            Lot / Display Capacity
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CAPACITY_OPTIONS.map((cap) => {
              const isSelected = data.lotCapacity === cap.id;
              return (
                <button
                  key={cap.id}
                  type="button"
                  onClick={() => onChange({ lotCapacity: cap.id })}
                  className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition active:scale-98 ${
                    isSelected
                      ? "border-neutral-950 bg-neutral-50/80 shadow-xs ring-2 ring-neutral-950/10"
                      : "border-neutral-200/90 bg-white hover:border-neutral-400"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xl">{cap.icon}</span>
                    {isSelected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-white text-[10px]">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-bold text-neutral-900">{cap.title}</p>
                  <p className="text-[11px] text-neutral-500 font-light">{cap.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

