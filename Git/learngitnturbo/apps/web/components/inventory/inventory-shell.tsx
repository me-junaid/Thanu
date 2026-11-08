"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Plus } from "lucide-react";
import useSWR from "swr";
import { InventoryHeader } from "./inventory-header";
import { InventoryToolbar } from "./inventory-toolbar";
import { InventoryTable } from "./inventory-table";
import { InventoryGrid } from "./inventory-grid";
import { VehicleDrawer } from "./vehicle-drawer";
import { AddVehicleModal } from "./modals/add-vehicle-modal";
import {
  getInventoryAction,
  updateVehicleStatusAction,
  deleteVehicleAction,
  type InventoryVehicle,
  type InventoryStats,
} from "../../app/dashboard/inventory/actions";

interface InventoryShellProps {
  initialVehicles?: InventoryVehicle[];
  stats?: InventoryStats;
  dealershipName?: string;
}

export function InventoryShell({
  initialVehicles,
  stats: initialStats,
  dealershipName = "Apex Motors",
}: InventoryShellProps) {
  const router = useRouter();

  // SWR in-memory client cache with background revalidation
  const { data, isLoading, mutate } = useSWR(
    "dashboard-inventory-data",
    async () => {
      return await getInventoryAction();
    },
    {
      fallbackData:
        initialVehicles && initialStats
          ? { vehicles: initialVehicles, stats: initialStats }
          : undefined,
      dedupingInterval: 60000,
      revalidateOnFocus: false,
      revalidateIfStale: true,
      keepPreviousData: true,
    }
  );

  const vehicles = data?.vehicles ?? initialVehicles ?? [];
  const stats = data?.stats ?? initialStats ?? null;

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [selectedVehicle, setSelectedVehicle] = useState<InventoryVehicle | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Client-side filtering & sorting
  const filteredVehicles = vehicles
    .filter((v) => {
      // Status filter
      if (statusFilter !== "all" && v.status !== statusFilter) {
        return false;
      }
      // Fuel filter
      if (fuelFilter !== "all" && v.fuelType !== fuelFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.variant && v.variant.toLowerCase().includes(q)) ||
          (v.registrationNumber && v.registrationNumber.toLowerCase().includes(q)) ||
          (v.vin && v.vin.toLowerCase().includes(q));

        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_desc") return b.askingPrice - a.askingPrice;
      if (sortBy === "price_asc") return a.askingPrice - b.askingPrice;
      if (sortBy === "km_asc") return a.kilometers - b.kilometers;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Rapid status transition with optimistic SWR mutation
  const handleUpdateStatus = async (
    vehicleId: string,
    status: InventoryVehicle["status"]
  ) => {
    if (data) {
      mutate(
        {
          ...data,
          vehicles: data.vehicles.map((v) =>
            v.id === vehicleId ? { ...v, status } : v
          ),
        },
        false
      );
    }
    await updateVehicleStatusAction({ vehicleId, status });
    mutate();
    if (selectedVehicle?.id === vehicleId) {
      setSelectedVehicle((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Delete vehicle with optimistic SWR mutation
  const handleDeleteVehicle = async (vehicleId: string) => {
    if (data) {
      mutate(
        {
          ...data,
          vehicles: data.vehicles.filter((v) => v.id !== vehicleId),
        },
        false
      );
    }
    await deleteVehicleAction(vehicleId);
    mutate();
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Header & KPI Summary ─── */}
      <InventoryHeader
        stats={stats}
        isLoading={isLoading && !data}
        dealershipName={dealershipName}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* ─── Filtering & Search Toolbar ─── */}
      <InventoryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        fuelFilter={fuelFilter}
        onFuelChange={setFuelFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalFiltered={filteredVehicles.length}
      />

      {/* ─── Main Content Views ─── */}
      {isLoading && vehicles.length === 0 ? (
        <InventoryTable
          vehicles={[]}
          isLoading={true}
          onSelectVehicle={() => {}}
          onUpdateStatus={() => {}}
        />
      ) : filteredVehicles.length > 0 ? (
        viewMode === "table" ? (
          <InventoryTable
            vehicles={filteredVehicles}
            onSelectVehicle={setSelectedVehicle}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <InventoryGrid
            vehicles={filteredVehicles}
            onSelectVehicle={setSelectedVehicle}
          />
        )
      ) : (
        /* Empty Results State */
        <div className="rounded-3xl border border-dashed border-neutral-200/90 bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
            <Car className="h-7 w-7" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="font-serif text-lg font-bold text-neutral-950">
              No Vehicles Found
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-1">
              {searchQuery || statusFilter !== "all" || fuelFilter !== "all"
                ? "Try adjusting your search criteria or resetting the active filters."
                : "Your showroom floor is currently empty. Procure and add your first certified vehicle to launch your digital lot."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Procure First Car</span>
          </button>
        </div>
      )}

      {/* ─── Slide-over Vehicle Dossier Drawer ─── */}
      <VehicleDrawer
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteVehicle={handleDeleteVehicle}
      />

      {/* ─── Add Vehicle Modal ─── */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

