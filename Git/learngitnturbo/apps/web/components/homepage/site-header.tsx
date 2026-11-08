"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Home,
  Building2,
  Car,
  LayoutGrid,
  CreditCard,
  HelpCircle,
} from "lucide-react";

export const SITE_NAV_ITEMS = [
  { num: "01", label: "Home", href: "/", icon: Home },
  { num: "02", label: "About", href: "/about", icon: Building2 },
  { num: "03", label: "Inventory", href: "/inventory", icon: Car },
  { num: "04", label: "Workspace", href: "/workspace", icon: LayoutGrid },
  { num: "05", label: "Pricing", href: "/pricing", icon: CreditCard },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      {/* ─── DESKTOP HEADER (Identical across Home & About) ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/70 bg-[#FDFBF7]/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Left Brand: Clean emblem only */}
          <Link
            href="/"
            aria-label="Home"
            className="flex items-center gap-2 group z-10"
          >
            <div className="flex h-12 items-center justify-center rounded-xl p-1 transition group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Orgetise"
                width={36}
                height={36}
                priority
                unoptimized
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          {/* Desktop Center Navigation: Mathematically centered */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8 lg:gap-10">
            {SITE_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/about"
                  ? pathname === "/about"
                  : item.href === "/inventory"
                  ? pathname === "/inventory"
                  : item.href === "/workspace"
                  ? pathname === "/workspace"
                  : item.href === "/pricing"
                  ? pathname === "/pricing"
                  : false;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-baseline gap-1.5 text-xs tracking-tight transition ${
                    isActive
                      ? "font-semibold text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-950 font-medium"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 z-10">
            <Link
              href="/login"
              className="hidden sm:inline-block text-xs font-semibold text-neutral-600 transition hover:text-neutral-950 px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 hover:shadow-md active:scale-98"
            >
              <span>Launch your dealership</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MOBILE APPLE-STYLE FROSTED GLASS DOCK (Identical across Home & About) ─── */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92%] max-w-[390px]"
      >
        <div className="flex items-center justify-around rounded-full bg-white/70 px-3 py-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] backdrop-blur-xl border border-white/40 ring-1 ring-black/5">
          {SITE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/about"
                ? pathname === "/about"
                : item.href === "/inventory"
                ? pathname === "/inventory"
                : item.href === "/workspace"
                ? pathname === "/workspace"
                : item.href === "/pricing"
                ? pathname === "/pricing"
                : false;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 transition active:scale-90 ${
                  isActive
                    ? "text-neutral-950 font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-xs"
                      : "text-neutral-600"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[9px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
