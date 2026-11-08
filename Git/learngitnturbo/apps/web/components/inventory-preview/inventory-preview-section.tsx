"use client";

import { useState, useMemo } from "react";
import { MOCK_VEHICLES, type Vehicle } from "../../lib/mock-inventory";
import { VehicleCard } from "./vehicle-card";
import { QuickInquiryModal } from "./quick-inquiry-modal";
import { Sparkles, SlidersHorizontal, Globe2 } from "lucide-react";

const BRANDS = ["All", "Porsche", "BMW", "Mercedes-AMG", "Audi", "Aston Martin"];
const BODY_TYPES = ["All", "Coupe", "Sedan", "SUV", "Wagon"];

export function InventoryPreviewSection() {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedBodyType, setSelectedBodyType] = useState("All");
  const [activeModalVehicle, setActiveModalVehicle] = useState<Vehicle | null>(null);

  // Filter vehicles dynamically based on selection
  const filteredVehicles = useMemo(() => {
    return MOCK_VEHICLES.filter((vehicle) => {
      const matchBrand =
        selectedBrand === "All" || vehicle.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchBody =
        selectedBodyType === "All" ||
        vehicle.bodyType.toLowerCase() === selectedBodyType.toLowerCase();
      return matchBrand && matchBody;
    });
  }, [selectedBrand, selectedBodyType]);

  return (
    <section id="inventory" className="mx-auto mt-24 max-w-7xl px-6 lg:px-10">
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-neutral-200/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-neutral-900" />
            <span>Customer-Facing Discovery Engine</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-neutral-950 font-normal tracking-tight">
            Live Inventory Experience
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-xl font-light">
            How your buyers discover, filter, and schedule test drives directly on your dealership’s
            branded custom domain.
          </p>
        </div>

        {/* Tenant branding badge preview */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white/80 p-2.5 px-4 shadow-2xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-white text-[11px] font-bold">
            A
          </div>
          <div className="text-left text-xs">
            <p className="font-semibold text-neutral-900">Apex Motors</p>
            <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
              <Globe2 className="h-3 w-3" /> apexperformance.com
            </p>
          </div>
        </div>
      </div>

      {/* ── Interactive Filter Controls Bar ── */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        {/* Brand selection chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition active:scale-95 ${
                selectedBrand === brand
                  ? "bg-neutral-950 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200/90 hover:border-neutral-400 hover:text-neutral-950"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Body Type Selection */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400 font-mono text-[11px] flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Body:
          </span>
          <select
            value={selectedBodyType}
            onChange={(e) => setSelectedBodyType(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs focus:border-neutral-900 focus:outline-none"
          >
            {BODY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Result Count Bar ── */}
      <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 font-mono">
        <span>
          Showing {filteredVehicles.length} of {MOCK_VEHICLES.length} available vehicles
        </span>
      </div>

      {/* ── Vehicles Grid ── */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onInquire={(car) => setActiveModalVehicle(car)}
          />
        ))}
      </div>

      {/* ── Quick Inquire / Test Drive Modal ── */}
      <QuickInquiryModal
        vehicle={activeModalVehicle}
        onClose={() => setActiveModalVehicle(null)}
      />
    </section>
  );
}

