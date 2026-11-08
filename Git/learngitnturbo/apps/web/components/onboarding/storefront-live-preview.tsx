"use client";

import Image from "next/image";
import {
  Globe2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  Car,
} from "lucide-react";
import { THEME_CONFIG, type OnboardingData } from "./types";

interface StorefrontLivePreviewProps {
  data: OnboardingData;
}

export function StorefrontLivePreview({ data }: StorefrontLivePreviewProps) {
  const theme = THEME_CONFIG[data.theme];
  const displayName = data.dealershipName.trim() || "Your Dealership";
  const displaySlug = data.slug.trim() || "yourshowroom";
  const displayAddress = data.address.trim() || "Showroom Address";
  const displayCity = data.city.trim() || "City";
  const displayState = data.state.trim() || "State";
  const displayPincode = data.pincode.trim() || "PIN";
  const displayWhatsApp = data.whatsappNumber.trim() || "XXXXXXXXXX";

  return (
    <div className="sticky top-8 rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-lg space-y-4">
      {/* ── Top Chrome Header ── */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 font-mono text-[10px] text-neutral-400 truncate max-w-[170px]">
            {displaySlug}.dealers.io
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
          <Sparkles className="h-3 w-3" /> Live Preview
        </span>
      </div>

      {/* ── Storefront Hero Banner (Theme Dynamic) ── */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.headerGradient} p-5 text-white shadow-md transition-all duration-500`}
      >
        {/* Scrim pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

        <div className="relative z-10 space-y-3">
          {/* Subdomain pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-mono text-white/90 backdrop-blur-md border border-white/10">
            <Globe2 className="h-3 w-3 text-emerald-400" />
            <span>https://{displaySlug}.dealers.io</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center font-serif font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <h3 className="font-serif text-xl font-normal tracking-tight text-white line-clamp-1">
                {displayName}
              </h3>
            </div>
            <p className="text-[11px] text-white/70 font-light mt-1 line-clamp-1">
              {data.tagline || "Certified Pre-Owned Luxury & Performance"}
            </p>
          </div>

          {/* Location snippet */}
          <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-light pt-1 border-t border-white/10">
            <MapPin className="h-3 w-3 text-white/60 shrink-0" />
            <span className="truncate">
              {displayAddress}, {displayCity}, {displayState} {displayPincode}
            </span>
          </div>

          {/* Action button preview */}
          <div className="pt-2 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-semibold text-white shadow-xs">
              <MessageCircle className="h-3 w-3" />
              <span>WhatsApp: +91 {displayWhatsApp}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-md">
              <Phone className="h-3 w-3 text-white/80" />
              <span>Call Desk</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Badges Strip ── */}
      <div className="grid grid-cols-2 gap-2 text-neutral-800">
        <div className="flex items-center gap-2 rounded-xl bg-neutral-50 p-2.5 border border-neutral-100">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="text-[10px] font-semibold">150+ Pt Certified Inspection</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-neutral-50 p-2.5 border border-neutral-100">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="text-[10px] font-semibold">Clear Title & Verified RC</span>
        </div>
      </div>

      {/* ── Sample Car Card on Storefront ── */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-3 space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
          Catalog Item Preview
        </p>
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
            <Image
              src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=400&q=80"
              alt="Porsche 911 preview"
              fill
              className="object-cover"
              sizes="80px"
            />
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[8px] font-bold text-white">
              ₹1.85 Cr
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-neutral-900 truncate">
              2023 Porsche 911 Carrera S
            </p>
            <p className="text-[10px] text-neutral-500 font-light truncate">
              Coupe • 12,400 km • Petrol PDK
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                <Car className="h-2.5 w-2.5" />
                <span>Showroom Floor</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-1">
        <p className="text-[10px] text-neutral-400 font-light">
          Your customer-facing website will automatically sync with this configuration.
        </p>
      </div>
    </div>
  );
}

