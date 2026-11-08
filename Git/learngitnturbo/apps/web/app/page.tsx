import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Car,
  ShieldCheck,
  TrendingUp,
  Award,
  Globe,
  Target,
  KeyRound,
  Users,
} from "lucide-react";
import {
  AutoNationLogo,
  CarMaxLogo,
  CarvanaLogo,
  DriveTimeLogo,
  CazooLogo,
  Cars24Logo,
} from "../components/brand-logos";
import { SiteHeader } from "../components/homepage/site-header";
import { ShapeGrid } from "../components/ui/shape-grid";
import { Topography } from "../components/ui/topography";
import { InventoryPreviewSection } from "../components/inventory-preview/inventory-preview-section";
import { AdminPreviewSection } from "../components/homepage/admin-preview-section";
import { PricingSection } from "../components/homepage/pricing-section";
import { FaqSection } from "../components/homepage/faq-section";
import { SiteFooter } from "../components/homepage/site-footer";

const DEALERSHIP_SHOWCASES = [
  {
    name: "Apex Performance",
    subdomain: "apex.dealers.io",
    customDomain: "apexperformance.com",
    tagline: "Track-ready Sports & Exotics",
    stats: "48 vehicles listed • 99.9% uptime",
    image:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=85",
    tags: ["Custom Domain", "SSL Verified", "Multi-Staff"],
  },
  {
    name: "Silverstone Heritage",
    subdomain: "silverstone.dealers.io",
    customDomain: "silverstoneheritage.co.uk",
    tagline: "Rare British Classics & Icons",
    stats: "32 vehicles listed • Custom theme",
    image:
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85",
    tags: ["VIN Decoder", "Dynamic SEO", "Lead Capture"],
  },
  {
    name: "Nordic Motorhaus",
    subdomain: "nordic.dealers.io",
    customDomain: "nordicmotorhaus.se",
    tagline: "EVs & Modern Performance",
    stats: "64 vehicles listed • Instant reservation",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85",
    tags: ["Private Database", "Instant Load Speed", "Fast CDN"],
  },
  {
    name: "Monaco Prestige",
    subdomain: "monaco.dealers.io",
    customDomain: "monacoprestige.mc",
    tagline: "Supercars & Hypercars",
    stats: "21 exclusive allocations",
    image:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=85",
    tags: ["VIP Inquiries", "Media Suite", "Staff Permissions"],
  },
  {
    name: "Vanguard Motors",
    subdomain: "vanguard.dealers.io",
    customDomain: "vanguardfleet.de",
    tagline: "Executive Sedans & SUVs",
    stats: "85 certified vehicles in stock",
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=85",
    tags: ["Live Pricing", "Multi-Branch Ready", "Auto Backups"],
  },
];

const DEALERSHIP_STATS = [
  { value: "100%", label: "Data Privacy", sublabel: "Zero lead or margin sharing" },
  { value: "<60s", label: "Setup Time", sublabel: "From signup to live website" },
  { value: "4.8x", label: "Lead Conversion", sublabel: "Faster inquiry follow-ups" },
  { value: "24/7", label: "Edge Availability", sublabel: "Automated custom domain SSL" },
];

const DEALERSHIP_MODULES = [
  {
    icon: Globe,
    title: "Branded Website",
    badge: "Custom Domain",
    description: "Autonomous customer storefront on your own domain with auto-SSL & dynamic SEO.",
    accent: "text-blue-600 bg-blue-50/80 border-blue-200/60",
  },
  {
    icon: Car,
    title: "Inventory Suite",
    badge: "360° Media",
    description: "High-velocity catalog management with HD vehicle galleries & stock lifecycle.",
    accent: "text-amber-600 bg-amber-50/80 border-amber-200/60",
  },
  {
    icon: Target,
    title: "Lead CRM",
    badge: "Zero-Leak",
    description: "Capture buyer inquiries from WhatsApp & web forms with automated follow-ups.",
    accent: "text-emerald-600 bg-emerald-50/80 border-emerald-200/60",
  },
  {
    icon: KeyRound,
    title: "Test Drive Suite",
    badge: "Live Calendar",
    description: "Real-time showroom slot booking, car availability checks, and driver verification.",
    accent: "text-violet-600 bg-violet-50/80 border-violet-200/60",
  },
  {
    icon: TrendingUp,
    title: "Sales & Deals",
    badge: "Margin Control",
    description: "Vehicle acquisition costs, buyer booking receipts, deal desks, and net margins.",
    accent: "text-rose-600 bg-rose-50/80 border-rose-200/60",
  },
  {
    icon: Users,
    title: "Staff Management",
    badge: "Granular RBAC",
    description: "Role-based controls for sales executives, inventory managers, and dealership owners.",
    accent: "text-indigo-600 bg-indigo-50/80 border-indigo-200/60",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 selection:bg-neutral-950 selection:text-white font-sans antialiased pb-24 md:pb-0">
      {/* ─── UNIFIED HEADER & MOBILE DOCK ─── */}
      <SiteHeader />

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24">
        {/* Architectural Perspective Blueprint Grid */}
        <ShapeGrid
          shape="square"
          direction="diagonal"
          lineColor="rgba(0, 0, 0, 0.04)"
          hoverColor="#91b894"
          hoverFillColor="#b45309"
          fillOpacity={0}
          cellSize={37}
          speed={0.3}
          tiltX={0}
          tiltY={0}
          rainbow={false}
          radius={2.5}
          trail={0.3}
          glow={0.75}
          twinkle={0.1}
          fade={0.45}
          intro={false}
          clickCascade={false}
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Headline, Narrative & Primary CTAs */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              {/* Editorial Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-semibold text-amber-900 shadow-2xs backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>The OS for Pre-Owned Dealerships</span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-neutral-950 leading-[1.12]">
                Power your dealership with a{" "}
                <span className="block mt-1 sm:mt-2 italic font-light text-neutral-850">
                  branded digital storefront.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                Operate your entire dealership catalog on your own custom domain.
                Equip sales staff with high-velocity inventory management, isolated database security,
                and real-time public synchronization from a single platform.
              </p>

              {/* Primary CTA Cluster */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-850 hover:shadow-lg w-full sm:w-auto"
                >
                  <span>Start 14-day free trial</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#inventory"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-800 shadow-2xs transition hover:bg-neutral-50 hover:border-neutral-400 w-full sm:w-auto"
                >
                  <span>Explore live demo</span>
                </Link>
              </div>

              {/* Social Proof Sub-bar */}
              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-neutral-500 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Custom domains
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Row-Level Security
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  No credit card required
                </span>
              </div>
            </div>

            {/* Right Column: Featured Dealership Operating Modules */}
            <div className="lg:col-span-6">
              <div className="rounded-[2.25rem]  p-5 sm:p-7   transition duration-300 hover:border-neutral-300">
                {/* 2x3 App Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEALERSHIP_MODULES.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <div
                        key={mod.title}
                        className="group relative backdrop-blur-md rounded-xl border border-neutral-200/70 p-3.5 text-left transition duration-200 hover:shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${mod.accent} shadow-2xs transition group-hover:scale-105`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                        </div>
                        <h3 className="text-xs font-bold tracking-tight text-neutral-900 group-hover:text-neutral-950">
                          {mod.title}
                        </h3>
                        <p className="text-[11px] text-neutral-500 font-light leading-relaxed mt-1">
                          {mod.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE TENANT SHOWCASE SLIDER ─── */}
      <section className="relative pt-6 pb-8">
        <div id="showcase" className="w-full overflow-x-auto pb-8 scrollbar-none px-4 sm:px-8">
          <div className="mx-auto flex w-max gap-5 sm:gap-6 justify-center">
            {DEALERSHIP_SHOWCASES.map((tenant) => (
              <div
                key={tenant.name}
                className="group relative h-[360px] w-[260px] sm:h-[420px] sm:w-[320px] shrink-0 overflow-hidden rounded-[2.25rem] bg-neutral-950 shadow-lg transition duration-300 hover:shadow-2xl border border-neutral-200/20"
              >
                {/* Background Automotive Visual */}
                <Image
                  src={tenant.image}
                  alt={tenant.name}
                  fill
                  sizes="(max-width: 640px) 260px, 320px"
                  className="object-cover object-center transition duration-700 group-hover:scale-105"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/30" />

                {/* Top Bar: Subdomain & Domain */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-mono text-emerald-400 backdrop-blur-md border border-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{tenant.customDomain}</span>
                  </div>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold text-white uppercase tracking-wider backdrop-blur-md">
                    Live
                  </span>
                </div>

                {/* Card Bottom Meta */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-lg font-bold tracking-tight text-white">
                    {tenant.name}
                  </p>
                  <p className="text-xs text-neutral-300 mt-0.5">{tenant.tagline}</p>
                  <p className="text-[11px] font-mono text-neutral-400 mt-1">
                    {tenant.stats}
                  </p>

                  {/* Feature Pills */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {tenant.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium text-neutral-100 backdrop-blur-md border border-white/15"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── DEALERSHIP INTRO / ABOUT SECTION ─── */}
        <div id="about" className="mx-auto mt-20 max-w-6xl px-6 lg:px-8">
          <div className="rounded-[2.5rem] border border-neutral-200/80 bg-white/90 p-8 sm:p-14 lg:p-16 shadow-xs backdrop-blur-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Mission & Narrative */}
              <div className="lg:col-span-7 text-left space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100/80 px-3 py-1 text-[11px] font-semibold text-neutral-800">
                  <Building2 className="h-3.5 w-3.5 text-neutral-700" />
                  <span>The Modern Dealership Operating Model</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl text-neutral-950 font-normal tracking-tight leading-[1.2]">
                  One unified platform. Multiple independent dealerships.{" "}
                  <span className="italic font-light text-neutral-700">
                    Complete data isolation.
                  </span>
                </h2>

                <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
                  We built this platform specifically for pre-owned automobile dealerships who want to
                  own their brand rather than being lost inside generic car classified marketplaces.
                  Every dealership receives its own branded customer-facing website, vehicle inventory pipeline,
                  lead management CRM, and role-based staff workspace.
                </p>

                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  From multi-branch vehicle transfers and customer test drives to purchase tracking
                  and profit accounting, our multi-tenant architecture keeps every dealership’s
                  customers, leads, and finances securely isolated using PostgreSQL Row-Level Security.
                </p>

                {/* 3 Value Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
                      <Car className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Custom Branding</p>
                      <p className="text-[11px] text-neutral-500">Your logo, domain, and colors</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Bank-Grade Isolation</p>
                      <p className="text-[11px] text-neutral-500">Strict PostgreSQL RLS</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Direct Inquiries</p>
                      <p className="text-[11px] text-neutral-500">Zero middleman commissions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Key Metrics & Architectural Card */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-3xl bg-neutral-950 p-6 sm:p-8 text-white text-left shadow-2xl border border-neutral-800/80 group">
                  {/* Topography 3D terrain canvas background */}
                  <Topography
                    color="#06b6d4"
                    lineCount={22}
                    lineWidth={1.2}
                    elevation={1.0}
                    tilt={34}
                    speed={0.2}
                    direction="forward"
                    glow={0.65}
                    depthOfField={0.5}
                    fog={0.35}
                    hoverEffect="lift"
                    clickEffect="pulse"
                    markers="dots"
                    className="absolute inset-0 w-full h-full opacity-45 transition-opacity duration-500 group-hover:opacity-60"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                  />

                  {/* Gradient scrim overlay for contrast & readability */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

                  {/* Content Container */}
                  <div className="relative z-10 pointer-events-none">
                    <div className="flex items-center justify-between pb-6 border-b border-white/10">
                      <div>
                        <p className="text-xs font-mono text-cyan-400">Dealership OS</p>
                        <p className="text-base font-bold text-white mt-0.5">Platform Metrics</p>
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-xs border border-white/10">
                        <Award className="h-4 w-4 text-cyan-400" />
                      </span>
                    </div>

                    {/* 2x2 Stats Grid */}
                    <div className="grid grid-cols-2 gap-5 pt-6">
                      {DEALERSHIP_STATS.map((stat) => (
                        <div key={stat.label}>
                          <p className="font-serif text-2xl sm:text-3xl font-normal text-white">
                            {stat.value}
                          </p>
                          <p className="text-xs font-semibold text-neutral-200 mt-1">
                            {stat.label}
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {stat.sublabel}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Call to action inside card */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-neutral-400">Ready to migrate your fleet?</span>
                      <Link
                        href="/signup"
                        className="pointer-events-auto inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-cyan-300 hover:underline underline-offset-4 transition-colors"
                      >
                        <span>Get started</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── INTERACTIVE VEHICLE INVENTORY PREVIEW SECTION ─── */}
        <InventoryPreviewSection />

        {/* ─── DEALERSHIP ADMIN WORKSPACE PREVIEW ─── */}
        <AdminPreviewSection />

        {/* ─── SUBSCRIPTION PRICING SECTION ─── */}
        <PricingSection />

        {/* ─── FREQUENTLY ASKED QUESTIONS (FAQ) ─── */}
        <FaqSection />

        {/* ─── PRE-OWNED CAR BRANDS & DEALERSHIP NETWORKS LOGO STRIP ─── */}
        <div className="mx-auto mt-28 max-w-7xl px-6 lg:px-8 border-t border-neutral-200/70 pt-14">
          <p className="text-center text-[11px] font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            Trusted by top pre-owned dealership brands & networks
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-neutral-800 opacity-60 transition duration-300 hover:opacity-100">
            <AutoNationLogo className="hover:text-neutral-950 transition-colors" />
            <CarMaxLogo className="hover:text-neutral-950 transition-colors" />
            <CarvanaLogo className="hover:text-neutral-950 transition-colors" />
            <DriveTimeLogo className="hover:text-neutral-950 transition-colors" />
            <CazooLogo className="hover:text-neutral-950 transition-colors" />
            <Cars24Logo className="hover:text-neutral-950 transition-colors" />
          </div>
        </div>
      </section>

      {/* ─── SITE FOOTER ─── */}
      <SiteFooter />
    </div>
  );
}
