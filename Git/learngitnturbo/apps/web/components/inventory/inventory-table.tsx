import React from "react";
import Image from "next/image";
import {
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Gauge,
  Sparkles,
} from "lucide-react";
import { VehicleStatusBadge } from "./vehicle-status-badge";
import type { InventoryVehicle } from "../../app/dashboard/inventory/actions";
import { usePermissions } from "../../lib/permissions";

interface InventoryTableProps {
  vehicles: InventoryVehicle[];
  isLoading?: boolean;
  onSelectVehicle: (vehicle: InventoryVehicle) => void;
  onUpdateStatus: (
    vehicleId: string,
    status: InventoryVehicle["status"]
  ) => void;
}

export function InventoryTable({
  vehicles,
  isLoading = false,
  onSelectVehicle,
  onUpdateStatus,
}: InventoryTableProps) {
  const { can } = usePermissions();
  const canViewFinancials = can("inventory:view_financials");

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold font-mono uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-4">Vehicle Details</th>
              <th className="py-3.5 px-4">Specifications</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Asking Price</th>
              {canViewFinancials && (
                <>
                  <th className="py-3.5 px-4 text-right">Procurement Cost</th>
                  <th className="py-3.5 px-4 text-right">Projected Margin</th>
                </>
              )}
              <th className="py-3.5 px-4 text-center">Days in Lot</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 bg-neutral-200 rounded-lg shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-36 bg-neutral-200 rounded" />
                        <div className="h-3 w-24 bg-neutral-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 bg-neutral-200 rounded" />
                      <div className="h-3 w-20 bg-neutral-100 rounded" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-6 w-20 bg-neutral-200 rounded-full" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-4 w-20 bg-neutral-200 rounded ml-auto" />
                  </td>
                  {canViewFinancials && (
                    <>
                      <td className="py-3 px-4 text-right">
                        <div className="h-4 w-20 bg-neutral-100 rounded ml-auto" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="h-4 w-16 bg-neutral-100 rounded ml-auto" />
                      </td>
                    </>
                  )}
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-12 bg-neutral-100 rounded mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-8 w-8 bg-neutral-100 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))
            ) : (
              vehicles.map((v) => (
              <tr
                key={v.id}
                onClick={() => onSelectVehicle(v)}
                className="group hover:bg-neutral-50/80 transition cursor-pointer"
              >
                {/* 1. Vehicle Brand, Model & Photo */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 shadow-2xs">
                      <Image
                        src={v.heroImage}
                        alt={`${v.brand} ${v.model}`}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-950 font-serif text-sm">
                          {v.brand} {v.model}
                        </span>
                        {v.certified && (
                          <span title="Certified by Orgetise" className="inline-flex">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                        {v.variant || `${v.manufacturingYear} Edition`} • {v.registrationNumber || "Unregistered"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. Specs (Km, Fuel, Transmission, Ownership) */}
                <td className="py-3 px-4 text-neutral-600">
                  <p className="font-medium text-neutral-900">
                    {v.kilometers.toLocaleString("en-IN")} km
                  </p>
                  <p className="text-[11px] text-neutral-500 capitalize">
                    {v.fuelType} • {v.transmission.replace("_", " ")} • {v.ownershipCount === 1 ? "1st Owner" : `${v.ownershipCount} Owners`}
                  </p>
                </td>

                {/* 3. Status Badge */}
                <td className="py-3 px-4 text-center">
                  <VehicleStatusBadge status={v.status} size="sm" />
                </td>

                {/* 4. Asking Price */}
                <td className="py-3 px-4 text-right">
                  <p className="font-mono text-sm font-bold text-neutral-950">
                    {v.formattedPrice}
                  </p>
                </td>

                {/* 5. Procurement Cost & 6. Projected Margin (Gated by inventory:view_financials) */}
                {canViewFinancials && (
                  <>
                    <td className="py-3 px-4 text-right">
                      {v.formattedPurchasePrice ? (
                        <div>
                          <p className="font-mono text-neutral-700 font-medium">
                            {v.formattedPurchasePrice}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            +₹{(v.refurbishmentCost || 0).toLocaleString("en-IN")} refurb
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {v.estimatedMargin !== null && v.estimatedMargin !== undefined ? (
                        <div>
                          <span className="font-mono font-semibold text-emerald-700">
                            +₹{v.estimatedMargin.toLocaleString("en-IN")}
                          </span>
                          <p className="text-[10px] font-mono text-emerald-600">
                            {v.marginPercentage}% margin
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">—</span>
                      )}
                    </td>
                  </>
                )}

                {/* 7. Days on Lot */}
                <td className="py-3 px-4 text-center font-mono text-neutral-600">
                  <span className="inline-flex items-center gap-1">
                    <span>{v.daysInStock}d</span>
                  </span>
                </td>

                {/* 8. Quick Actions */}
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVehicle(v);
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-neutral-200/90 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 shadow-2xs"
                  >
                    View
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
