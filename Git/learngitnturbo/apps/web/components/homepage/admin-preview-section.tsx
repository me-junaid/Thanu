"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Car,
  Users2,
  IndianRupee,
  ShieldCheck,
  Check,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";

export function AdminPreviewSection() {
  const [activeTab, setActiveTab] = useState<"inventory" | "crm" | "margins">("inventory");

  return (
    <section id="demo" className="mx-auto mt-28 max-w-7xl px-6 lg:px-10">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-neutral-900" />
          <span>Inside The Dealership Command Center</span>
        </div>
        <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-neutral-950 font-normal tracking-tight">
          One workspace to run inventory, leads & accounting.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
          Behind every branded storefront sits an enterprise-grade dashboard built specifically for
          used car sales managers, inventory leads, and dealership owners.
        </p>

        {/* Tab Controls */}
        <div className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-neutral-200/90 bg-neutral-100/80 p-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeTab === "inventory"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            <span>Vehicle Lifecycle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("crm")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeTab === "crm"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            <Users2 className="h-3.5 w-3.5" />
            <span>Lead & Test Drive CRM</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("margins")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeTab === "margins"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            <IndianRupee className="h-3.5 w-3.5" />
            <span>Cost & Profit Accounting</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Screen Showcase Frame */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-neutral-200/90 bg-white shadow-xl backdrop-blur-xs p-4 sm:p-8">
        {/* Browser Top Chrome */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            <span className="ml-2 font-mono text-[11px] text-neutral-400">
              admin.apexmotors.com/workspace
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3 w-3" /> Tenant Isolated
          </span>
        </div>

        {/* Tab 1: Vehicle Lifecycle */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Active Stock Management</h3>
                <p className="text-xs text-neutral-500">
                  Control availability status across web, mobile, and custom domain instantly.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-lg">
                48 Vehicles in Fleet
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-mono text-[10px] uppercase">
                    <th className="pb-3 font-semibold">Vehicle</th>
                    <th className="pb-3 font-semibold">VIN / Stock #</th>
                    <th className="pb-3 font-semibold">Branch</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Listed Price</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  <tr>
                    <td className="py-3.5 font-semibold text-neutral-900">
                      2023 Porsche 911 Carrera S
                    </td>
                    <td className="py-3.5 font-mono text-neutral-500">WP0AB2A97P... (STK-849)</td>
                    <td className="py-3.5 text-neutral-600">Main Showroom</td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-semibold">
                        Available
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-neutral-900">₹1,85,00,000</td>
                    <td className="py-3.5 text-right font-medium text-neutral-900 hover:underline cursor-pointer">
                      Edit specs →
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 font-semibold text-neutral-900">
                      2022 Mercedes-AMG GT 63 S
                    </td>
                    <td className="py-3.5 font-mono text-neutral-500">WDD2906891... (STK-812)</td>
                    <td className="py-3.5 text-neutral-600">Executive Wing</td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-semibold">
                        Reserved
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-neutral-900">₹1,62,00,000</td>
                    <td className="py-3.5 text-right font-medium text-neutral-900 hover:underline cursor-pointer">
                      Deposit view →
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 font-semibold text-neutral-900">
                      2024 BMW M4 Competition
                    </td>
                    <td className="py-3.5 font-mono text-neutral-500">WBA33AZ02R... (STK-790)</td>
                    <td className="py-3.5 text-neutral-600">Track Bay</td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-semibold">
                        Sold
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-neutral-900">₹1,28,00,000</td>
                    <td className="py-3.5 text-right font-medium text-neutral-900 hover:underline cursor-pointer">
                      Receipt →
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Lead CRM */}
        {activeTab === "crm" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Direct Customer Inquiries</h3>
                <p className="text-xs text-neutral-500">
                  Every public form submission routes straight into your team’s follow-up queue.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                12 New Inquiries Today
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/60 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-900 pb-2 border-b border-neutral-200">
                  <span>New Leads (4)</span>
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl bg-white p-3 shadow-2xs border border-neutral-200/60">
                    <p className="text-xs font-bold text-neutral-900">Alex Morgan</p>
                    <p className="text-[11px] text-neutral-500">Porsche 911 Carrera S</p>
                    <span className="mt-2 inline-block rounded bg-amber-100 text-amber-900 px-2 py-0.5 text-[9px] font-semibold">
                      Test Drive Requested
                    </span>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-2xs border border-neutral-200/60">
                    <p className="text-xs font-bold text-neutral-900">Julian Vance</p>
                    <p className="text-[11px] text-neutral-500">Audi RS6 Avant</p>
                    <span className="mt-2 inline-block rounded bg-neutral-100 text-neutral-700 px-2 py-0.5 text-[9px] font-semibold">
                      Trade-in Inquiry
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/60 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-900 pb-2 border-b border-neutral-200">
                  <span>Contacted / Scheduled (5)</span>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl bg-white p-3 shadow-2xs border border-neutral-200/60">
                    <p className="text-xs font-bold text-neutral-900">Elena Rostova</p>
                    <p className="text-[11px] text-neutral-500">Mercedes-AMG GT 63 S</p>
                    <span className="mt-2 inline-block rounded bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[9px] font-semibold">
                      Scheduled: Tomorrow 2 PM
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/60 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-900 pb-2 border-b border-neutral-200">
                  <span>Negotiation & Booked (3)</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl bg-white p-3 shadow-2xs border border-neutral-200/60">
                    <p className="text-xs font-bold text-neutral-900">David Sterling</p>
                    <p className="text-[11px] text-neutral-500">Aston Martin Vantage</p>
                    <span className="mt-2 inline-block rounded bg-purple-100 text-purple-900 px-2 py-0.5 text-[9px] font-semibold">
                      Deposit Received (₹5,00,000)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Margins & Cost Accounting */}
        {activeTab === "margins" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Private Margin Accounting</h3>
                <p className="text-xs text-neutral-500">
                  Strictly hidden from public APIs. Track purchase costs, refurbishment, and profit per vehicle.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                Avg. Margin: 14.8%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-[10px] text-neutral-400 uppercase font-mono">Acquisition Cost</p>
                <p className="font-serif text-xl font-bold text-neutral-900 mt-1">₹1,48,00,000</p>
                <p className="text-[11px] text-neutral-500 mt-1">Direct private purchase</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-[10px] text-neutral-400 uppercase font-mono">Refurb & Detail</p>
                <p className="font-serif text-xl font-bold text-neutral-900 mt-1">₹4,50,000</p>
                <p className="text-[11px] text-neutral-500 mt-1">Inspection & ceramic coat</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-[10px] text-neutral-400 uppercase font-mono">Public List Price</p>
                <p className="font-serif text-xl font-bold text-neutral-900 mt-1">₹1,85,00,000</p>
                <p className="text-[11px] text-neutral-500 mt-1">Published to custom domain</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <p className="text-[10px] text-emerald-700 uppercase font-mono font-semibold">
                  Net Expected Profit
                </p>
                <p className="font-serif text-xl font-bold text-emerald-800 mt-1">+₹32,50,000</p>
                <p className="text-[11px] text-emerald-700 mt-1">+17.5% ROI</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

