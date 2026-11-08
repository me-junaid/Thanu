"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Car,
  User,
  Phone,
  CreditCard,
  Building2,
  Lock,
  Plus,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { createSalesDealAction } from "../../../app/dashboard/accounting/actions";
import { formatINR } from "../../../lib/currency";
import { computeGstMarginScheme } from "../../../lib/accounting/margin-calculator";

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (dealNumber?: string) => void;
  availableInventory: {
    id: string;
    brand: string;
    model: string;
    variant: string | null;
    registrationNumber: string | null;
    askingPrice: number;
    formattedPrice: string;
    heroImage: string;
    purchasePrice?: number;
  }[];
  salesStaff: {
    id: string;
    name: string;
    role: string;
  }[];
}

export function CreateDealModal({
  isOpen,
  onClose,
  onSuccess,
  availableInventory,
  salesStaff,
}: CreateDealModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [vehicleId, setVehicleId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPan, setCustomerPan] = useState("");

  const [agreedSellingPrice, setAgreedSellingPrice] = useState<number>(0);
  const [rtoTransferCharges, setRtoTransferCharges] = useState<number>(35000);
  const [insuranceCharges, setInsuranceCharges] = useState<number>(120000);
  const [extendedWarrantyFee, setExtendedWarrantyFee] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [tokenAmount, setTokenAmount] = useState<number>(100000);
  const [isTokenRefundable, setIsTokenRefundable] = useState(false);

  const [isFinanced, setIsFinanced] = useState(false);
  const [financierName, setFinancierName] = useState("HDFC Bank Auto Loans");
  const [loanSanctionedAmount, setLoanSanctionedAmount] = useState<number>(0);

  const [hasExchange, setHasExchange] = useState(false);
  const [exchangeAllowance, setExchangeAllowance] = useState<number>(0);

  const [salesRepId, setSalesRepId] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // Select first car on open
  useEffect(() => {
    if (isOpen && availableInventory.length > 0 && !vehicleId && availableInventory[0]) {
      const firstCar = availableInventory[0];
      setVehicleId(firstCar.id);
      setAgreedSellingPrice(firstCar.askingPrice);
      if (salesStaff.length > 0 && salesStaff[0]) {
        setSalesRepId(salesStaff[0].id);
      }
    }
  }, [isOpen, availableInventory, vehicleId, salesStaff]);

  // When vehicle changes, update default price
  const handleVehicleChange = (id: string) => {
    setVehicleId(id);
    const car = availableInventory.find((c) => c.id === id);
    if (car) {
      setAgreedSellingPrice(car.askingPrice);
    }
  };

  const selectedCar = availableInventory.find((c) => c.id === vehicleId);

  // Computed Totals
  const totalDealAmount = Math.max(
    0,
    agreedSellingPrice +
      rtoTransferCharges +
      insuranceCharges +
      extendedWarrantyFee -
      discountAmount
  );

  const gstPreview = selectedCar?.purchasePrice
    ? computeGstMarginScheme({
        sellingPrice: agreedSellingPrice,
        purchasePrice: selectedCar.purchasePrice,
      })
    : null;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError("Please select a vehicle from inventory.");
      return;
    }
    if (!customerName.trim()) {
      setError("Customer full name is required.");
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      setError("Valid customer phone number is required.");
      return;
    }
    if (agreedSellingPrice <= 0) {
      setError("Agreed selling price must be greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSalesDealAction({
        vehicleId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        customerAddress: customerAddress.trim() || null,
        customerPan: customerPan.trim().toUpperCase() || null,
        agreedSellingPrice,
        rtoTransferCharges,
        insuranceCharges,
        extendedWarrantyFee,
        accessoriesCharges: 0,
        discountAmount,
        tokenAmount,
        isTokenRefundable,
        isFinanced,
        financierName: isFinanced ? financierName : null,
        loanSanctionedAmount: isFinanced ? loanSanctionedAmount : 0,
        hasExchange,
        exchangeAllowance: hasExchange ? exchangeAllowance : 0,
        salesCommissionAmount: 0,
        salesRepId: salesRepId || null,
        internalNotes: internalNotes.trim() || null,
      });

      if (res.success) {
        onSuccess(res.dealNumber);
        onClose();
      } else {
        setError(res.error || "Failed to create sales deal.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Sales Contract
              </span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span className="text-xs text-neutral-600 font-mono">Deal Sheet Creator</span>
            </div>
            <h2 className="font-serif text-lg font-normal text-neutral-900 mt-0.5">
              Draft New Sales Agreement
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Vehicle Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">
              1. Select Inventory Stock Unit *
            </label>

            {availableInventory.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                No available vehicles currently in inventory. Add a vehicle in Fleet Inventory first.
              </p>
            ) : (
              <select
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              >
                {availableInventory.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.brand} {car.model} ({car.registrationNumber || "Unregistered"}) — Asking: {car.formattedPrice}
                  </option>
                ))}
              </select>
            )}

            {selectedCar && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                  <Image
                    src={selectedCar.heroImage}
                    alt={selectedCar.model}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-neutral-900 block truncate">
                    {selectedCar.brand} {selectedCar.model}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Listing Price: {selectedCar.formattedPrice}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Customer Dossier */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">
              2. Buyer Particulars *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Full Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98450 11223"
                  className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs font-mono text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@domain.com"
                  className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Customer PAN Number
                </label>
                <input
                  type="text"
                  value={customerPan}
                  onChange={(e) => setCustomerPan(e.target.value)}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs font-mono uppercase text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                Registered Residence / Office Address
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Indiranagar 100ft Road, Bengaluru, Karnataka"
                className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 3. Deal Commercials */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">
              3. Commercial Pricing Structure (INR ₹) *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Agreed Vehicle Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={10000}
                  step="any"
                  value={agreedSellingPrice || ""}
                  onChange={(e) => setAgreedSellingPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs font-semibold text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  RTO Title Transfer Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={rtoTransferCharges || ""}
                  onChange={(e) => setRtoTransferCharges(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Insurance Charges (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={insuranceCharges || ""}
                  onChange={(e) => setInsuranceCharges(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Warranty / Accessories (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={extendedWarrantyFee || ""}
                  onChange={(e) => setExtendedWarrantyFee(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Total Contracted Box */}
            <div className="rounded-xl bg-neutral-950 p-4 text-white flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-mono uppercase text-neutral-400">Total Deal Agreement</span>
                <span className="text-xl font-serif font-bold text-white">
                  {formatINR(totalDealAmount)}
                </span>
              </div>
              {gstPreview && (
                <div className="text-right text-[11px] font-mono text-neutral-300">
                  <span className="block text-amber-400">
                    GST on Margin ({gstPreview.gstRatePercent}%): {formatINR(gstPreview.totalGstAmount)}
                  </span>
                  <span className="text-neutral-400 text-[10px]">
                    Margin Spread: {formatINR(gstPreview.marginAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Token & Financing Setup */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">
              4. Booking Token & Financing Parameters
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1 font-mono">
                  Initial Booking Token (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={tokenAmount || ""}
                  onChange={(e) => setTokenAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-xs font-mono font-medium text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Assigned Sales Representative
                </label>
                <select
                  value={salesRepId}
                  onChange={(e) => setSalesRepId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                >
                  {salesStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Financing Option Toggle */}
            <div className="rounded-xl border border-neutral-200/90 p-3 bg-neutral-50/50 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={isFinanced}
                  onChange={(e) => setIsFinanced(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
                <span>Customer is availing Bank Auto Loan / Financing</span>
              </label>

              {isFinanced && (
                <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">Financier / Bank Name</label>
                    <input
                      type="text"
                      value={financierName}
                      onChange={(e) => setFinancierName(e.target.value)}
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">Sanctioned Loan Amount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={loanSanctionedAmount || ""}
                      onChange={(e) => setLoanSanctionedAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Drafting Deal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Create Deal Sheet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
