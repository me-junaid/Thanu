import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Lock,
  Globe2,
  Sparkles,
  Layers,
  TrendingUp,
  Globe,
  Car,
  Target,
  KeyRound,
  Users,
} from "lucide-react";
import { SiteHeader } from "../../components/homepage/site-header";
import { SiteFooter } from "../../components/homepage/site-footer";
import { Hyperspeed } from "../../components/ui/hyperspeed";

export const metadata: Metadata = {
  title: "About Us | Orgetise Dealership SaaS",
  description:
    "Learn about Orgetise: the commercial multi-tenant SaaS engineered for independent pre-owned automobile dealerships.",
};

const VALUES = [
  {
    icon: Lock,
    title: "Complete Data Isolation",
    description:
      "Every dealership operates with an autonomous, isolated database. Your customer contacts, buyer inquiries, sales records, and vehicle purchase margins are 100% private and never shared with other dealerships.",
  },
  {
    icon: Globe2,
    title: "Branded Digital Independence",
    description:
      "We believe dealerships should build equity in their own brand. Connect your custom domain with auto-provisioned edge SSL instead of being a commodity listing on car classifieds.",
  },
  {
    icon: TrendingUp,
    title: "Direct Inquiries & Zero Commission",
    description:
      "Unlike marketplaces that take commission cuts or resell buyer leads to competing dealerships, 100% of your leads, profit margins, and customer relationships remain yours.",
  },
  {
    icon: Layers,
    title: "Single-Showroom Operational Focus",
    description:
      "Engineered specifically for independent dealerships operating a dedicated showroom lot. All inventory, sales staff, customer relationships, and deal pipelines live in a focused, high-velocity workspace.",
  },
];

const DEALERSHIP_MODULES = [
  {
    icon: Globe,
    title: "Branded Website Storefront",
    badge: "Custom Domain",
    metric: "Instant Auto-SSL",
    description:
      "Every dealership gets an autonomous public website connected to their own custom domain. Optimized for lightning-fast mobile discovery with structured vehicle schema, dynamic SEO, and real-time inventory synchronization.",
    accent: "text-blue-600 bg-blue-50/90 border-blue-200/70",
  },
  {
    icon: Car,
    title: "Vehicle Inventory Management",
    badge: "360° Media Suite",
    metric: "High-Velocity Catalog",
    description:
      "Manage vehicle lifecycle from draft and acquisition to active listing, reservation, and sold. Support for multi-angle photo ordering, cover image curation, VIN decoding, and private cost tracking.",
    accent: "text-amber-600 bg-amber-50/90 border-amber-200/70",
  },
  {
    icon: Target,
    title: "Lead Management & CRM",
    badge: "Zero-Leak Pipeline",
    metric: "WhatsApp Direct",
    description:
      "All public vehicle inquiries and test drive requests flow directly into your private CRM. Track status progression from new to contacted, test drive scheduled, negotiation, and conversion without lead leaks.",
    accent: "text-emerald-600 bg-emerald-50/90 border-emerald-200/70",
  },
  {
    icon: KeyRound,
    title: "Test Drive Management",
    badge: "Live Calendar",
    metric: "Slot Conflict Guard",
    description:
      "Real-time showroom slot scheduler preventing double-booked vehicles. Enables sales representatives to schedule, verify driver credentials, and record customer feedback on each drive.",
    accent: "text-violet-600 bg-violet-50/90 border-violet-200/70",
  },
  {
    icon: TrendingUp,
    title: "Sales & Purchase Ledger",
    badge: "Margin Protection",
    metric: "100% Margin Retention",
    description:
      "Full financial boundary tracking. Record acquisition prices, refurbishment expenses, customer booking deposits, final selling prices, and net dealer profit margins within strict database transactions.",
    accent: "text-rose-600 bg-rose-50/90 border-rose-200/70",
  },
  {
    icon: Users,
    title: "Staff & Role-Based Access",
    badge: "Granular RBAC",
    metric: "Bank-Grade Isolation",
    description:
      "Equip your sales team with targeted workspace access. Enforce granular permissions ensuring sales executives manage assigned leads without seeing dealership financial overheads or subscription billing.",
    accent: "text-indigo-600 bg-indigo-50/90 border-indigo-200/70",
  },
];

const ARCHITECTURE_POINTS = [
  {
    label: "Lightning-Fast Storefronts",
    detail: "Sub-second vehicle load times and instant search filtering designed for buyers browsing on mobile devices.",
  },
  {
    label: "Private & Secure Records",
    detail: "Strict database isolation guarantees your private purchase costs and customer inquiries remain entirely confidential.",
  },
  {
    label: "High Availability & Backups",
    detail: "Cloud infrastructure backed by automated daily snapshots and 99.9% uptime for your digital showroom.",
  },
  {
    label: "Automated Media Acceleration",
    detail: "High-resolution car photo galleries are automatically compressed and delivered globally with zero lag.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans antialiased selection:bg-neutral-950 selection:text-white pb-24 md:pb-0">
      {/* ─── UNIFIED HEADER & MOBILE DOCK ─── */}
      <SiteHeader />

      {/* ─── ABOUT HERO SECTION ─── */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-20">
        <Hyperspeed
          theme="light"
          curve="winding"
    curvature={1}
    speed={.3}
    boost={3}
    fov={90}
    boostFov={130}
    lanes={3}
    roadWidth={6}
    medianWidth={2}
    density={40}
    trailLength={1}
    lightSize={1}
    poles={20}
    dust={100}
    glow={0.6}
    reflections={0.5}
    roadOpacity={0.1}
    steer={0.35}
    tailColors={['#d856bf', '#6750a2', '#c247ac']}
    headColors={['#03b3c3', '#0e5ea5', '#324555']}
    poleColors={['#03b3c3']}
    interactive
          className="absolute inset-0 w-full h-full"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center pointer-events-none">
          <div className="inline-flex items-center gap-2 rounded-full  px-3.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs backdrop-blur-md pointer-events-auto">
            <Building2 className="h-3.5 w-3.5 text-neutral-900" />
            <span>Built by Orgetise Technologies Pvt. Ltd.</span>
          </div>

          <h1 className="mt-8 font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-neutral-950 leading-[1.12]">
            Reimagining how independent dealerships{" "}
            <span className="block mt-1 sm:mt-2 italic font-light text-neutral-850">
              run, sell, and scale.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-600 font-light leading-relaxed">
            We are engineering the modern operating system for the pre-owned automobile industry.
            Our platform equips dealerships with autonomous branded websites, high-speed inventory
            management, and lead intelligence from a single, unified codebase.
          </p>
        </div>
      </section>


      {/* ─── MISSION & CORE PRINCIPLE ─── */}
      <section className="mx-auto max-w-6xl px-6 pt-0 lg:px-8 py-8">
        <div className="rounded-[2.5rem] bg-neutral-950 p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-mono text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Fundamental Product Principle</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight">
              One Platform. Multiple Dealerships. Complete Data Isolation.
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed pt-2">
              The automobile retail market has historically forced dealers to choose between fragile,
              costly custom agency websites or generic aggregator marketplaces where their identity is
              buried among thousands of competitors.
            </p>

            <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed">
              Orgetise offers the third way: an enterprise multi-tenant software foundation where each
              dealership operates its own branded storefront, manages its own vehicles and leads,
              and configures its own staff roles without ever compromising data privacy or scalability.
            </p>
          </div>
        </div>
      </section>

      {/* ─── THE 6 CORE DEALERSHIP OPERATING MODULES ─── */}
      <section className="mx-auto max-w-6xl px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/90 px-3.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>The Complete Operating System</span>
          </div>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl text-neutral-950 font-normal tracking-tight">
            Six unified engines powering your showroom
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
            From the initial public inquiry on your branded website to inventory media curation,
            lead CRM follow-ups, and sales margin accounting—everything operates in a single, unified database.
          </p>
        </div>

        {/* 6 Feature Engines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEALERSHIP_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="group relative rounded-3xl border border-neutral-200/90 bg-white p-7 text-left shadow-2xs transition duration-300 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${mod.accent} shadow-2xs transition group-hover:scale-105`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-950 tracking-tight group-hover:text-neutral-900">
                    {mod.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 4 CORE VALUE PILLARS ─── */}
      <section className="mx-auto max-w-6xl px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
            Engineering Values
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-neutral-950 font-normal">
            Why independent dealers choose our platform
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VALUES.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.title}
                className="rounded-3xl border border-neutral-200/90 bg-white p-8 shadow-2xs text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white mb-5 shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-950 tracking-tight">
                  {val.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── ARCHITECTURE DEEP DIVE ─── */}
      <section className="mx-auto max-w-6xl px-6 lg:px-8 py-12">
        <div className="rounded-[2.5rem] border border-neutral-200/80 bg-white p-8 sm:p-14 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4 text-left">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
                Platform Standards
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-950 font-normal tracking-tight">
                Enterprise reliability & privacy from Day 1.
              </h2>
              <p className="text-sm text-neutral-600 font-light leading-relaxed">
                We believe security, customer privacy, and speed should never be compromised.
                Our cloud infrastructure is engineered to keep your dealership showroom online
                24/7 with bank-grade isolation and zero lead sharing.
              </p>

              <div className="pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-850 transition"
                >
                  <span>Start with Orgetise</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-3">
              {ARCHITECTURE_POINTS.map((pt) => (
                <div
                  key={pt.label}
                  className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 text-left"
                >
                  <p className="text-xs font-bold text-neutral-950">{pt.label}</p>
                  <p className="text-xs text-neutral-600 mt-1 font-light leading-relaxed">
                    {pt.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <SiteFooter />
    </div>
  );
}
