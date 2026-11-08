import Image from "next/image";
import { ShieldCheck, Gauge, Fuel, Calendar, ArrowUpRight } from "lucide-react";
import type { Vehicle } from "../../lib/mock-inventory";

interface VehicleCardProps {
  vehicle: Vehicle;
  onInquire: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, onInquire }: VehicleCardProps) {
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-2xs transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl">
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
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Brand & Model */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {vehicle.brand}
              </p>
              <h3 className="text-base font-bold text-neutral-950 leading-tight">
                {vehicle.year} {vehicle.model}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                {vehicle.variant}
              </p>
            </div>
          </div>

          {/* Core Specs Grid */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-y border-neutral-100 py-3 text-center">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Gauge className="h-3 w-3" /> Mileage
              </span>
              <span className="text-xs font-semibold text-neutral-800 mt-0.5">
                {vehicle.mileage}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center border-x border-neutral-100">
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Fuel className="h-3 w-3" /> Fuel
              </span>
              <span className="text-xs font-semibold text-neutral-800 mt-0.5">
                {vehicle.fuelType}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Trans
              </span>
              <span className="text-xs font-semibold text-neutral-800 mt-0.5">
                {vehicle.transmission}
              </span>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="mt-4 pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onInquire(vehicle)}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-neutral-950 py-2.5 px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-850 active:scale-98"
          >
            <span>Book Test Drive</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

