import React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Calendar,
  Gauge,
  Fuel,
  TrendingUp,
  MoreVertical,
  ArrowUpRight,
} from "lucide-react";
import { VehicleStatusBadge } from "./vehicle-status-badge";
import type { InventoryVehicle } from "../../app/dashboard/inventory/actions";
import { Can } from "../permissions/can";

interface InventoryGridProps {
  vehicles: InventoryVehicle[];
  onSelectVehicle: (vehicle: InventoryVehicle) => void;
}

export function InventoryGrid({
  vehicles,
  onSelectVehicle,
}: InventoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {vehicles.map((v) => (
        <div
          key={v.id}
          onClick={() => onSelectVehicle(v)}
          className="group rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            {/* ─── Hero Image Container ─── */}
            <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100">
              <Image
                src={v.heroImage}
                alt={`${v.brand} ${v.model}`}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <VehicleStatusBadge status={v.status} size="sm" />
                {v.certified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    Certified
                  </span>
                )}
              </div>

              {/* Days in stock counter */}
              <div className="absolute bottom-2.5 left-3">
                <span className="rounded-md bg-black/50 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-medium text-white">
                  {v.daysInStock} Days on Floor
                </span>
              </div>
            </div>

            {/* ─── Card Content ─── */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {v.manufacturingYear} • {v.brand}
                  </span>
                  <span className="text-xs font-semibold text-neutral-900 font-mono">
                    {v.registrationNumber || "Unregistered"}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-neutral-950 mt-0.5 leading-snug group-hover:text-neutral-700 transition">
                  {v.model}
                </h3>
                <p className="text-xs text-neutral-500 font-light truncate">
                  {v.variant || "Standard Trim"}
                </p>
              </div>

              {/* Spec Pills */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-100 text-[11px] text-neutral-600">
                <div>
                  <span className="text-neutral-400 block text-[9px] uppercase font-mono">Mileage</span>
                  <span className="font-semibold text-neutral-900">{v.kilometers.toLocaleString("en-IN")} km</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[9px] uppercase font-mono">Fuel / Trans</span>
                  <span className="font-semibold text-neutral-900 capitalize truncate block">
                    {v.fuelType}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[9px] uppercase font-mono">Ownership</span>
                  <span className="font-semibold text-neutral-900">
                    {v.ownershipCount === 1 ? "1st Owner" : `${v.ownershipCount} Owners`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Card Footer: Asking Price & Margin ─── */}
          <div className="p-4 pt-0">
            <div className="flex items-center justify-between rounded-xl bg-[#FDFBF7] p-2.5 border border-neutral-100">
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-400 block">
                  Public Asking Price
                </span>
                <span className="font-serif text-base font-bold text-neutral-950">
                  {v.formattedPrice}
                </span>
              </div>

              <Can
                permission="inventory:view_financials"
                fallback={
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-md px-2 py-0.5 font-medium block">
                      Certified Lot
                    </span>
                  </div>
                }
              >
                {v.estimatedMargin !== null && v.estimatedMargin !== undefined ? (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-emerald-700 font-semibold block">
                      +{v.marginPercentage}% Gross Margin
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-800">
                      +₹{v.estimatedMargin.toLocaleString("en-IN")}
                    </span>
                  </div>
                ) : null}
              </Can>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

