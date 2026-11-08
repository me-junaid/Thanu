"use client";

import { MessageCircle, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";
import type { OnboardingData } from "./types";

interface StepContactProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
}

export function StepContact({ data, onChange, errors }: StepContactProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-800">
          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span>Step 3 of 4 • Inquiries & WhatsApp Desk</span>
        </div>
        <h2 className="mt-3 font-serif text-2xl sm:text-3xl text-neutral-950 font-normal tracking-tight">
          How should buyers reach your desk?
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-light">
          Configure direct communication channels for fast customer follow-ups and test drive bookings.
        </p>
      </div>

      <div className="space-y-4">
        {/* WhatsApp Business Number (Featured) */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="whatsappNumber"
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-950"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>Official WhatsApp Business Number <span className="text-red-500">*</span></span>
            </label>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 font-mono">
              Direct Lead Channel
            </span>
          </div>

          <div className="flex items-center rounded-xl border border-emerald-300/80 bg-white px-3.5 py-2.5 shadow-2xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10">
            <span className="font-mono text-xs font-bold text-neutral-500 select-none pr-2 border-r border-neutral-200">
              🇮🇳 +91
            </span>
            <input
              id="whatsappNumber"
              type="tel"
              maxLength={10}
              placeholder="7736850015"
              value={data.whatsappNumber}
              onChange={(e) =>
                onChange({
                  whatsappNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                })
              }
              className="flex-1 pl-3 font-mono text-sm font-semibold text-neutral-950 focus:outline-none"
            />
          </div>

          {errors.whatsappNumber ? (
            <p className="text-[11px] font-medium text-red-600">
              {errors.whatsappNumber}
            </p>
          ) : (
            <p className="text-[11px] text-emerald-800/80 font-light">
              All "Book Test Drive" and "Inquire on WhatsApp" buttons on your live website will directly ping this number with the vehicle name and buyer info.
            </p>
          )}
        </div>

        {/* Showroom Desk Phone */}
        <div>
          <label
            htmlFor="deskPhone"
            className="block text-xs font-semibold text-neutral-800 mb-1.5"
          >
            Showroom Call Desk (Landline or Secondary Mobile)
          </label>
          <div className="relative">
            <input
              id="deskPhone"
              type="tel"
              placeholder="e.g. 080 4123 4567 or +91 98450 12345"
              value={data.deskPhone}
              onChange={(e) => onChange({ deskPhone: e.target.value })}
              className="w-full rounded-2xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:border-neutral-900 focus:outline-none transition"
            />
            <Phone className="absolute right-4 top-3.5 h-4 w-4 text-neutral-400" />
          </div>
          <p className="mt-1 text-[11px] text-neutral-400 font-light">
            Displayed on your website header and contact page for direct voice calls.
          </p>
        </div>

        {/* Sales Inquiry Email */}
        <div>
          <label
            htmlFor="salesEmail"
            className="block text-xs font-semibold text-neutral-800 mb-1.5"
          >
            Sales & Support Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="salesEmail"
              type="email"
              placeholder="e.g. sales@apexmotors.in"
              value={data.salesEmail}
              onChange={(e) => onChange({ salesEmail: e.target.value.trim() })}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-neutral-950 shadow-2xs focus:outline-none transition ${
                errors.salesEmail
                  ? "border-red-500 focus:border-red-600 ring-2 ring-red-100"
                  : "border-neutral-200/90 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-950/5"
              }`}
            />
            <Mail className="absolute right-4 top-3.5 h-4 w-4 text-neutral-400" />
          </div>
          {errors.salesEmail && (
            <p className="mt-1 text-[11px] font-medium text-red-600">{errors.salesEmail}</p>
          )}
        </div>

        {/* GSTIN (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="gstin"
              className="block text-xs font-semibold text-neutral-800"
            >
              GSTIN Number (Optional)
            </label>
            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              For Tax Invoices
            </span>
          </div>
          <div className="relative">
            <input
              id="gstin"
              type="text"
              maxLength={15}
              placeholder="e.g. 29AAAAA0000A1Z5"
              value={data.gstin}
              onChange={(e) =>
                onChange({ gstin: e.target.value.toUpperCase().slice(0, 15) })
              }
              className="w-full rounded-2xl border border-neutral-200/90 bg-white px-4 py-3 font-mono text-sm uppercase text-neutral-950 shadow-2xs focus:border-neutral-900 focus:outline-none transition"
            />
            <FileText className="absolute right-4 top-3.5 h-4 w-4 text-neutral-400" />
          </div>
          <p className="mt-1 text-[11px] text-neutral-400 font-light flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Adds a "GST Registered Certified Dealer" trust mark to your storefront.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

