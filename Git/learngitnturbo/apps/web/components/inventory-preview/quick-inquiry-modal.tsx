"use client";

import { useState } from "react";
import Image from "next/image";
import { X, CheckCircle2, ShieldCheck, Calendar, Phone, Mail, User } from "lucide-react";
import type { Vehicle } from "../../lib/mock-inventory";

interface QuickInquiryModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function QuickInquiryModal({ vehicle, onClose }: QuickInquiryModalProps) {
  const [submitted, setSubmitted] = useState(false);

  if (!vehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl z-10 border border-neutral-200">
        {/* Header banner */}
        <div className="relative aspect-[16/7] w-full bg-neutral-900">
          <Image
            src={vehicle.image}
            alt={vehicle.model}
            fill
            className="object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Vehicle info in header */}
          <div className="absolute bottom-3 left-5 right-5 text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
              {vehicle.brand} • {vehicle.year}
            </span>
            <h3 className="text-xl font-bold leading-tight">
              {vehicle.model} <span className="font-light text-sm">({vehicle.variant})</span>
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">
              {vehicle.formattedPrice} • {vehicle.mileage}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900">
                Test Drive Request Sent!
              </h4>
              <p className="text-xs text-neutral-600 max-w-xs mx-auto leading-relaxed">
                Your enquiry has been instantly forwarded to the dealership CRM. A sales executive
                will reach out via WhatsApp / phone within 15 minutes.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded-xl bg-neutral-900 px-6 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                Close preview
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200/60">
                <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                <span>
                  Demo Mode: Simulating direct customer lead capture to the dealership dashboard.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    placeholder="Marcus Vance"
                    defaultValue="Alex Morgan"
                    className="block w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                  />
                  <User className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">
                    Phone / WhatsApp
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      defaultValue="+1 (555) 234-5678"
                      className="block w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                    />
                    <Phone className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">
                    Preferred Date
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="date"
                      required
                      defaultValue="2026-11-05"
                      className="block w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                    <Calendar className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-neutral-950 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-850"
              >
                Confirm Test Drive Booking
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

