"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck,
  Fuel,
  Gauge,
  Calendar,
  MessageCircle,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Car,
} from "lucide-react";
import { MOCK_VEHICLES, type Vehicle } from "../../lib/mock-inventory";
import { QuickInquiryModal } from "../inventory-preview/quick-inquiry-modal";

const BRANDS = ["All", "Porsche", "Mercedes-AMG", "BMW", "Audi", "Aston Martin", "Land Rover"];
const BODY_TYPES = ["All", "Coupe", "Sedan", "SUV", "Wagon"];
const PRICE_RANGES = [
  { label: "All Prices", value: "all" },
  { label: "Under ₹1.5 Crore", value: "under-1.5cr" },
  { label: "₹1.5 Cr – ₹2.0 Cr", value: "1.5cr-2cr" },
  { label: "Above ₹2.0 Crore", value: "above-2cr" },
];
const FUEL_TYPES = ["All", "Petrol", "Hybrid", "Electric"];

export function InventoryBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedBodyType, setSelectedBodyType] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [sortBy, setSortBy] = useState<"price-high" | "price-low" | "year-new" | "mileage-low">("price-high");

  // Test drive modal
  const [inquiryVehicle, setInquiryVehicle] = useState<Vehicle | null>(null);

  // Check if any filter is active
  const isFiltered =
    searchQuery !== "" ||
    selectedBrand !== "All" ||
    selectedBodyType !== "All" ||
    selectedPriceRange !== "all" ||
    selectedFuel !== "All";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("All");
    setSelectedBodyType("All");
    setSelectedPriceRange("all");
    setSelectedFuel("All");
    setSortBy("price-high");
  };

  // Filter & sort logic
  const filteredVehicles = useMemo(() => {
    return MOCK_VEHICLES.filter((vehicle) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        query === "" ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.brand.toLowerCase().includes(query) ||
        vehicle.variant.toLowerCase().includes(query) ||
        vehicle.year.toString().includes(query);

      // Brand
      const matchBrand = selectedBrand === "All" || vehicle.brand.toLowerCase() === selectedBrand.toLowerCase();

      // Body Type
      const matchBody = selectedBodyType === "All" || vehicle.bodyType.toLowerCase() === selectedBodyType.toLowerCase();

      // Fuel
      const matchFuel = selectedFuel === "All" || vehicle.fuelType.toLowerCase() === selectedFuel.toLowerCase();

      // Price Range
      let matchPrice = true;
      if (selectedPriceRange === "under-1.5cr") {
        matchPrice = vehicle.price < 15000000;
      } else if (selectedPriceRange === "1.5cr-2cr") {
        matchPrice = vehicle.price >= 15000000 && vehicle.price <= 20000000;
      } else if (selectedPriceRange === "above-2cr") {
        matchPrice = vehicle.price > 20000000;
      }

      return matchSearch && matchBrand && matchBody && matchFuel && matchPrice;
    }).sort((a, b) => {
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "year-new") return b.year - a.year;
      if (sortBy === "mileage-low") {
        const mileageA = parseInt(a.mileage.replace(/[^0-9]/g, ""), 10);
        const mileageB = parseInt(b.mileage.replace(/[^0-9]/g, ""), 10);
        return mileageA - mileageB;
      }
      return 0;
    });
  }, [searchQuery, selectedBrand, selectedBodyType, selectedPriceRange, selectedFuel, sortBy]);

  return (
    <div className="mt-8 space-y-8">
      {/* ─── MULTI-FACET FILTER CONTROLS ─── */}
      <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xs space-y-5">
        {/* Top Search Bar & Sort Dropdown */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by make, model, or year (e.g. 911, AMG, Defender)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/70 pl-10 pr-4 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:outline-none transition"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-neutral-500 whitespace-nowrap font-mono uppercase">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="year-new">Year: Newest First</option>
              <option value="mileage-low">Mileage: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Brand Filter Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Make & Brand
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setSelectedBrand(brand)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 cursor-pointer ${
                  selectedBrand === brand
                    ? "bg-neutral-950 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Dropdowns (Body Type, Budget, Fuel) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100">
          {/* Body Type */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono block mb-1">
              Body Type
            </label>
            <select
              value={selectedBodyType}
              onChange={(e) => setSelectedBodyType(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none cursor-pointer"
            >
              {BODY_TYPES.map((body) => (
                <option key={body} value={body}>
                  {body === "All" ? "All Body Styles" : body}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono block mb-1">
              Budget Range
            </label>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none cursor-pointer"
            >
              {PRICE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono block mb-1">
              Powertrain
            </label>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none cursor-pointer"
            >
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {fuel === "All" ? "All Powertrains" : fuel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Strip & Reset */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <p className="text-neutral-500 font-light">
            Showing <strong className="font-semibold text-neutral-900">{filteredVehicles.length}</strong> of{" "}
            {MOCK_VEHICLES.length} certified vehicles in stock
          </p>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 font-semibold text-neutral-900 hover:text-neutral-600 transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── VEHICLE CARDS GRID ─── */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredVehicles.map((vehicle) => {
            const whatsappMessage = encodeURIComponent(
              `Hi Apex Motors, I am interested in the ${vehicle.year} ${vehicle.brand} ${vehicle.model} (${vehicle.variant}) listed for ${vehicle.formattedPrice}. Is it available for inspection?`
            );

            return (
              <div
                key={vehicle.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-2xs transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl"
              >
                {/* ── Top Image Container ── */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={vehicle.image}
                    alt={`${vehicle.year} ${vehicle.brand} ${vehicle.model}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    {vehicle.certified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                        <ShieldCheck className="h-3 w-3" />
                        Certified Inspection
                      </span>
                    ) : (
                      <span />
                    )}

                    <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md border border-white/10">
                      {vehicle.ownership}
                    </span>
                  </div>

                  {/* Bottom Price Tag on Image */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-baseline justify-between">
                    <span className="rounded-full bg-black/65 px-3 py-1 font-serif text-sm font-semibold text-white backdrop-blur-md border border-white/15">
                      {vehicle.formattedPrice}
                    </span>
                    <span className="text-[10px] text-neutral-200 drop-shadow-sm font-mono">
                      {vehicle.location.split("•")[0]}
                    </span>
                  </div>
                </div>

                {/* ── Content & Spec Block ── */}
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div>
                    {/* Brand & Model */}
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      {vehicle.brand}
                    </p>
                    <h3 className="mt-0.5 font-serif text-lg font-bold text-neutral-950 group-hover:text-neutral-700 transition leading-snug">
                      {vehicle.year} {vehicle.model}
                    </h3>
                    <p className="text-xs text-neutral-500 font-light truncate">
                      {vehicle.variant}
                    </p>

                    {/* Spec Pill Strip */}
                    <div className="mt-4 grid grid-cols-3 gap-2 border-y border-neutral-100 py-3 text-center">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-mono uppercase">Mileage</span>
                        <span className="text-xs font-semibold text-neutral-800">{vehicle.mileage}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-mono uppercase">Fuel</span>
                        <span className="text-xs font-semibold text-neutral-800">{vehicle.fuelType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-mono uppercase">Trans</span>
                        <span className="text-xs font-semibold text-neutral-800">{vehicle.transmission}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Action CTAs */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInquiryVehicle(vehicle)}
                      className="flex-1 rounded-2xl bg-neutral-950 py-2.5 px-3 text-center text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 active:scale-98 cursor-pointer"
                    >
                      Book Test Drive
                    </button>

                    <a
                      href={`https://wa.me/917736850015?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition active:scale-95"
                      aria-label="Chat on WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── EMPTY STATE ─── */
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-12 text-center space-y-4 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <Car className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-normal text-neutral-950">
              No vehicles match your active filters
            </h3>
            <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto font-light">
              Try expanding your budget range, resetting brand filters, or search for another model.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear all filters</span>
          </button>
        </div>
      )}

      {/* ─── TEST DRIVE & BOOKING MODAL ─── */}
      <QuickInquiryModal
        vehicle={inquiryVehicle}
        onClose={() => setInquiryVehicle(null)}
      />
    </div>
  );
}

