"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Users2,
  CalendarCheck2,
  TrendingUp,
  Plus,
  ArrowUpRight,
  MessageCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Phone,
} from "lucide-react";
import { MOCK_VEHICLES } from "../../lib/mock-inventory";
import {
  DashboardOverviewHeaderToggle,
  DashboardOverviewKpiWrapper,
} from "./dashboard-kpi-grid";

const KPI_CARDS = [
  {
    label: "Active Inventory",
    value: "34 Cars",
    subtext: "8 Reserved • 6 in Refurbishment",
    trend: "+3 this week",
    icon: Car,
    trendColor: "text-emerald-700 bg-emerald-50",
  },
  {
    label: "New Inquiries",
    value: "18 Leads",
    subtext: "+24% increase vs last week",
    trend: "High conversion",
    icon: Users2,
    trendColor: "text-emerald-700 bg-emerald-50",
  },
  {
    label: "Test Drives Scheduled",
    value: "5 Upcoming",
    subtext: "2 appointments confirmed today",
    trend: "2 Today",
    icon: CalendarCheck2,
    trendColor: "text-amber-800 bg-amber-50",
  },
  {
    label: "Total Fleet Valuation",
    value: "₹6.84 Crore",
    subtext: "Estimated Gross Margin: 16.4%",
    trend: "₹1.12 Cr Margin",
    icon: TrendingUp,
    trendColor: "text-emerald-700 bg-emerald-50",
  },
];

const RECENT_LEADS = [
  {
    id: "lead-1",
    name: "Vikram Malhotra",
    phone: "+91 77368 50015",
    car: "2023 Porsche 911 Carrera S",
    budget: "₹1.85 Cr",
    source: "Website Direct",
    time: "24 mins ago",
    status: "New Inquiry",
    statusColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    id: "lead-2",
    name: "Ananya Deshmukh",
    phone: "+91 77368 50015",
    car: "2022 Mercedes-AMG GT 63 S",
    budget: "₹1.60 Cr",
    source: "WhatsApp Direct",
    time: "2 hours ago",
    status: "Test Drive Scheduled",
    statusColor: "bg-blue-50 text-blue-800 border-blue-200",
  },
  {
    id: "lead-3",
    name: "Rohan Singhal",
    phone: "+91 77368 50015",
    car: "2024 BMW M4 Competition",
    budget: "₹1.30 Cr",
    source: "Koramangala Walk-in",
    time: "5 hours ago",
    status: "Negotiation",
    statusColor: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    id: "lead-4",
    name: "Karan Oberoi",
    phone: "+91 77368 50015",
    car: "2023 Audi RS6 Avant",
    budget: "₹1.75 Cr",
    source: "Website Direct",
    time: "Yesterday",
    status: "Token Received",
    statusColor: "bg-purple-50 text-purple-800 border-purple-200",
  },
];

interface DashboardOverviewViewProps {
  onboardingSuccess?: boolean;
}

export function DashboardOverviewView({ onboardingSuccess = false }: DashboardOverviewViewProps) {
  const previewFleet = MOCK_VEHICLES.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* ─── Celebratory Onboarding Banner ─── */}
      {onboardingSuccess && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 sm:p-5 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  Dealership Storefront Provisioned Successfully!
                </p>
                <p className="text-xs text-emerald-800 font-light mt-0.5">
                  Your primary showroom, official WhatsApp inquiry desk, and initial certified inventory are configured and ready.
                </p>
              </div>
            </div>
            <Link
              href="/inventory"
              target="_blank"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition"
            >
              <span>Visit Live Storefront</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ─── Top Greeting & Header Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-neutral-950 font-normal tracking-tight">
            Dealership Command Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-light">
            Apex Motors • Main Showroom, 100ft Road, Koramangala
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <DashboardOverviewHeaderToggle />

          <Link
            href="/inventory"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Vehicle</span>
          </Link>
        </div>
      </div>

      {/* ─── 4 Executive KPI Cards (Collapsible) ─── */}
      <DashboardOverviewKpiWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-2xs transition hover:shadow-md"
              >
                <div className="flex items-center justify-between pb-4">
                  <span className="text-xs font-medium text-neutral-500">{card.label}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-sans text-2xl sm:text-3xl font-normal text-neutral-950 tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-light">{card.subtext}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold font-mono ${card.trendColor}`}
                  >
                    {card.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardOverviewKpiWrapper>

      {/* ─── Urgent Action Queue: Recent Leads Table ─── */}
      <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold text-neutral-950">
                Urgent Lead Action Queue
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Prospective car buyers awaiting callback or test drive confirmation
            </p>
          </div>

          <a
            href="/dashboard/leads"
            className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
          >
            <span>Open Full CRM Pipeline</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        {/* Table of Leads */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                <th className="pb-3">Buyer Name</th>
                <th className="pb-3">Target Vehicle</th>
                <th className="pb-3">Budget</th>
                <th className="pb-3">Lead Source</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {RECENT_LEADS.map((lead) => {
                const whatsappText = encodeURIComponent(
                  `Hi ${lead.name}, this is Apex Motors Koramangala regarding your inquiry for the ${lead.car}. When would be convenient for a test drive?`
                );

                return (
                  <tr key={lead.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3.5 font-semibold text-neutral-900">
                      <div>
                        <span>{lead.name}</span>
                        <p className="text-[10px] text-neutral-400 font-mono font-normal">
                          {lead.time}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 text-neutral-800 font-medium">{lead.car}</td>
                    <td className="py-3.5 font-sans font-bold text-neutral-950">
                      {lead.budget}
                    </td>
                    <td className="py-3.5 text-neutral-500">{lead.source}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${lead.statusColor}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <a
                        href={`https://wa.me/917736850015?text=${whatsappText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs hover:bg-emerald-700 transition"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Showroom Fleet Snapshot & Private Margins ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fleet Preview (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-950">
                Showroom Lot Snapshot
              </h3>
              <p className="text-xs text-neutral-500">Live vehicles on floor at Koramangala</p>
            </div>
            <a
              href="/dashboard/inventory"
              className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
            >
              <span>Manage All 48 Cars</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          <div className="divide-y divide-neutral-100">
            {previewFleet.map((vehicle) => (
              <div
                key={vehicle.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-neutral-50/60 transition rounded-xl px-2"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.model}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      {vehicle.year} {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {vehicle.mileage} • {vehicle.fuelType} • {vehicle.transmission}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-sans text-sm font-bold text-neutral-950">
                    {vehicle.formattedPrice}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Private Cost & Profit Summary (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-950">Fleet Economics</h3>
              <p className="text-xs text-neutral-500">Restricted to Dealership Owner</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-mono text-neutral-700">
              <ShieldCheck className="h-3 w-3 text-neutral-500" /> RBAC
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="rounded-2xl bg-neutral-50 p-3.5 border border-neutral-100">
              <span className="text-[11px] text-neutral-500">Invested Capital</span>
              <p className="font-sans text-xl font-bold text-neutral-950 mt-0.5">
                ₹5.72 Crore
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">34 acquired vehicles</p>
            </div>

            <div className="rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-100">
              <span className="text-[11px] text-emerald-800 font-medium">
                Projected Gross Profit
              </span>
              <p className="font-sans text-xl font-bold text-emerald-950 mt-0.5">
                ₹1.12 Crore
              </p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Average margin: 16.4%</p>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-3.5 border border-neutral-100">
              <span className="text-[11px] text-neutral-500">Avg. Inventory Turnaround</span>
              <p className="font-sans text-xl font-bold text-neutral-950 mt-0.5">
                21 Days
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">From acquisition to delivery</p>
            </div>
          </div>

          <a
            href="/dashboard/accounting"
            className="flex items-center justify-center gap-1 w-full rounded-xl border border-neutral-200 bg-white py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition"
          >
            <span>View Unit Economics</span>
            <ArrowUpRight className="h-3 w-3 text-neutral-400" />
          </a>
        </div>
      </div>
    </div>
  );
}

