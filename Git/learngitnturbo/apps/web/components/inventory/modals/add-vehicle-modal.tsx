import React, { useState } from "react";
import { X, Plus, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { createVehicleAction } from "../../../app/dashboard/inventory/actions";
import type { VehicleCreateInput } from "../../../lib/schemas/vehicle";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddVehicleModal({
  isOpen,
  onClose,
  onSuccess,
}: AddVehicleModalProps) {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<VehicleCreateInput>({
    brand: "",
    model: "",
    variant: "",
    manufacturingYear: currentYear - 1,
    registrationYear: currentYear - 1,
    registrationNumber: "",
    vin: "",
    fuelType: "petrol",
    transmission: "automatic",
    bodyType: "sedan",
    kilometers: 15000,
    ownershipCount: 1,
    exteriorColor: "",
    interiorColor: "",
    askingPrice: 2500000,
    purchasePrice: 2100000,
    refurbishmentCost: 50000,
    minimumFloorPrice: 2400000,
    status: "available",
    certified: true,
    featured: false,
    heroImageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await createVehicleAction(formData);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add vehicle.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-neutral-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="font-serif text-xl font-bold text-neutral-950">
              Procure & Add Vehicle
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Enter vehicle specifications and internal unit economics.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Vehicle Identity */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              1. Brand & Specification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Brand / Make *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Porsche, BMW, Mercedes"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 911 Carrera S, M4 Competition"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Variant / Trim
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coupe (992), xDrive G82"
                  value={formData.variant || ""}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. KA 01 MJ 9999"
                  value={formData.registrationNumber || ""}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Mfg. Year / Reg. Year
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={1990}
                    max={currentYear + 1}
                    value={formData.manufacturingYear}
                    onChange={(e) => setFormData({ ...formData, manufacturingYear: Number(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                  <input
                    type="number"
                    min={1990}
                    max={currentYear + 1}
                    value={formData.registrationYear}
                    onChange={(e) => setFormData({ ...formData, registrationYear: Number(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Odometer (Kilometers) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.kilometers}
                  onChange={(e) => setFormData({ ...formData, kilometers: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Fuel Type
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Transmission
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                >
                  <option value="automatic">Automatic</option>
                  <option value="dual_clutch">Dual Clutch</option>
                  <option value="pdk">PDK</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Financials & Economics */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              2. Unit Economics (INR)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Public Asking Price *
                </label>
                <input
                  type="number"
                  required
                  step={10000}
                  value={formData.askingPrice}
                  onChange={(e) => setFormData({ ...formData, askingPrice: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono font-bold text-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Purchase / Cost Price
                </label>
                <input
                  type="number"
                  step={10000}
                  value={formData.purchasePrice || 0}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono text-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Refurbishment Cost
                </label>
                <input
                  type="number"
                  step={5000}
                  value={formData.refurbishmentCost || 0}
                  onChange={(e) => setFormData({ ...formData, refurbishmentCost: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono text-neutral-700"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Media & Certification */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              3. Media & Inspection
            </h4>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Hero Image URL
              </label>
              <input
                type="url"
                value={formData.heroImageUrl || ""}
                onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={formData.certified}
                  onChange={(e) => setFormData({ ...formData, certified: e.target.checked })}
                  className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                />
                <span>150-Point Certified Pre-Owned</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                />
                <span>Feature on Storefront Homepage</span>
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? "Procuring..." : "Add to Showroom Floor"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
