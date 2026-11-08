import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Gauge,
  Fuel,
  TrendingUp,
  DollarSign,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Trash2,
} from "lucide-react";
import { VehicleStatusBadge } from "./vehicle-status-badge";
import type { InventoryVehicle } from "../../app/dashboard/inventory/actions";
import { Can } from "../permissions/can";

interface VehicleDrawerProps {
  vehicle: InventoryVehicle | null;
  onClose: () => void;
  onUpdateStatus: (
    vehicleId: string,
    status: InventoryVehicle["status"]
  ) => Promise<void>;
  onDeleteVehicle: (vehicleId: string) => Promise<void>;
}

export function VehicleDrawer({
  vehicle,
  onClose,
  onUpdateStatus,
  onDeleteVehicle,
}: VehicleDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!vehicle) return null;

  const handleStatusChange = async (newStatus: InventoryVehicle["status"]) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(vehicle.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete this ${vehicle.brand} ${vehicle.model}? This cannot be undone.`
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDeleteVehicle(vehicle.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* ─── Header ─── */}
        <div>
          <div className="flex items-center justify-between p-5 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                Vehicle ID: {vehicle.id.slice(0, 8)}
              </span>
              <span className="text-neutral-300">•</span>
              <VehicleStatusBadge status={vehicle.status} size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/inventory"
                target="_blank"
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
              >
                <span>Storefront</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ─── Hero Image & Gallery ─── */}
          <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100">
            <Image
              src={vehicle.heroImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-cover"
              sizes="600px"
            />
            {vehicle.certified && (
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  150-Point Certified Inspection
                </span>
              </div>
            )}
          </div>

          {/* ─── Vehicle Identity & Pricing ─── */}
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  {vehicle.manufacturingYear} • {vehicle.brand}
                </p>
                <h2 className="font-serif text-2xl font-bold text-neutral-950 mt-0.5">
                  {vehicle.model}
                </h2>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  {vehicle.variant || "Standard Trim"} • Reg: {vehicle.registrationNumber || "Unregistered"}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  Asking Price
                </span>
                <span className="font-mono text-2xl font-bold text-neutral-950 block">
                  {vehicle.formattedPrice}
                </span>
              </div>
            </div>

            {/* Quick Status Control Bar (Gated by inventory:edit) */}
            <Can permission="inventory:edit">
              <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-100 space-y-2.5">
                <span className="text-[11px] font-semibold text-neutral-800 block">
                  Update Showroom Status:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {(["available", "reserved", "in_refurbishment", "sold"] as const).map((s) => {
                    const isCurrent = vehicle.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={isUpdating || isCurrent}
                        onClick={() => handleStatusChange(s)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-98 capitalize ${
                          isCurrent
                            ? "bg-neutral-950 text-white shadow-xs"
                            : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Can>

            {/* Private Dealership Economics (Gated by inventory:view_financials) */}
            <Can permission="inventory:view_financials">
              <div className="rounded-2xl border border-neutral-200/90 bg-[#FDFBF7] p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80">
                  <span className="text-xs font-bold text-neutral-900 font-serif">
                    Unit Economics & Gross Margin
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Restricted to Owner / Finance
                  </span>
                </div>

                {vehicle.formattedPurchasePrice ? (
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                        Acquisition Cost
                      </span>
                      <span className="font-mono font-semibold text-neutral-900 mt-0.5 block">
                        {vehicle.formattedPurchasePrice}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                        Refurbishment
                      </span>
                      <span className="font-mono font-semibold text-neutral-900 mt-0.5 block">
                        ₹{(vehicle.refurbishmentCost || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-emerald-700 block text-[10px] uppercase font-mono font-semibold">
                        Gross Margin
                      </span>
                      <span className="font-mono font-bold text-emerald-800 mt-0.5 block">
                        +₹{(vehicle.estimatedMargin || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono">
                        {vehicle.marginPercentage}% return
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic">
                    Financial figures are hidden for your staff role.
                  </p>
                )}
              </div>
            </Can>

            {/* Technical Specifications Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-neutral-100 p-2.5 bg-neutral-50/50">
                  <span className="text-[10px] text-neutral-400 block font-mono">Odometer</span>
                  <span className="font-semibold text-neutral-900">{vehicle.kilometers.toLocaleString("en-IN")} km</span>
                </div>
                <div className="rounded-xl border border-neutral-100 p-2.5 bg-neutral-50/50">
                  <span className="text-[10px] text-neutral-400 block font-mono">Fuel Type</span>
                  <span className="font-semibold text-neutral-900 capitalize">{vehicle.fuelType}</span>
                </div>
                <div className="rounded-xl border border-neutral-100 p-2.5 bg-neutral-50/50">
                  <span className="text-[10px] text-neutral-400 block font-mono">Transmission</span>
                  <span className="font-semibold text-neutral-900 capitalize">{vehicle.transmission.replace("_", " ")}</span>
                </div>
                <div className="rounded-xl border border-neutral-100 p-2.5 bg-neutral-50/50">
                  <span className="text-[10px] text-neutral-400 block font-mono">Ownership</span>
                  <span className="font-semibold text-neutral-900">{vehicle.ownershipCount === 1 ? "1st Owner" : `${vehicle.ownershipCount} Owners`}</span>
                </div>
                <div className="rounded-xl border border-neutral-100 p-2.5 bg-neutral-50/50">
                  <span className="text-[10px] text-neutral-400 block font-mono">Exterior</span>
                  <span className="font-semibold text-neutral-900 truncate block">{vehicle.exteriorColor || "Factory Finish"}</span>
                </div>
                <div className="rounded-xl border border-neutral-100 p-2.5 bg-neutral-50/50">
                  <span className="text-[10px] text-neutral-400 block font-mono">Body Type</span>
                  <span className="font-semibold text-neutral-900 capitalize">{vehicle.bodyType}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Inspection & Showroom Notes
                </h4>
                <p className="text-xs text-neutral-600 font-light leading-relaxed">
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Footer: Delete Action (Gated by inventory:delete) ─── */}
        <div className="p-5 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <span className="text-[11px] text-neutral-400 font-mono">
            Acquired {vehicle.daysInStock} days ago
          </span>

          <Can permission="inventory:delete">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition active:scale-98"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isDeleting ? "Deleting..." : "Delete Listing"}</span>
            </button>
          </Can>
        </div>
      </div>
    </div>
  );
}

