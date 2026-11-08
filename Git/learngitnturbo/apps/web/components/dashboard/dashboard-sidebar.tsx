"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardLayout } from "./dashboard-shell";
import { usePermissions } from "../../lib/permissions";
import type { PermissionKey } from "../../lib/permissions/types";
import {
  LayoutDashboard,
  Car,
  Users2,
  CalendarCheck2,
  ReceiptText,
  Settings,
  ArrowUpRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  badgeColor?: string;
  permission?: PermissionKey;
  anyPermissions?: PermissionKey[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Fleet Inventory",
    href: "/dashboard/inventory",
    icon: Car,
    badge: "48",
    badgeColor: "bg-neutral-100 text-neutral-800",
    permission: "inventory:view",
  },
  {
    label: "Leads & Inquiries",
    href: "/dashboard/leads",
    icon: Users2,
    badge: "12",
    badgeColor: "bg-amber-100 text-amber-900",
    anyPermissions: ["leads:view_all", "leads:view_assigned_only"],
  },
  {
    label: "Test Drives",
    href: "/dashboard/test-drives",
    icon: CalendarCheck2,
    badge: "5",
    badgeColor: "bg-emerald-100 text-emerald-900",
    anyPermissions: ["test_drives:view_all", "test_drives:view_assigned"],
  },
  {
    label: "Sales & Accounting",
    href: "/dashboard/accounting",
    icon: ReceiptText,
    permission: "accounting:view_pnl",
  },
  {
    label: "Staff & Roles",
    href: "/dashboard/team",
    icon: Users2,
    permission: "staff:manage_roster",
  },
  {
    label: "Dealership Settings",
    href: "/dashboard/settings",
    icon: Settings,
    permission: "showroom:manage_settings",
  },
];

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function DashboardSidebar({
  isCollapsed = false,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { activePath, navigateTo } = useDashboardLayout();
  const { can, canAny } = usePermissions();

  const currentPath = activePath || pathname;

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.permission && !can(item.permission)) {
      return false;
    }
    if (item.anyPermissions && !canAny(...item.anyPermissions)) {
      return false;
    }
    return true;
  });

  return (
    <aside
      className={`hidden lg:flex fixed top-0 left-0 h-screen flex-col justify-between border-r border-neutral-200/80 bg-white z-30 overflow-y-auto transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20 p-3 items-center" : "w-64 p-5"
      }`}
    >
      <div className="space-y-6 w-full">
        {/* Dealership Logo & Emblem */}
        <div
          className={`flex items-center gap-3 w-full transition ${
            isCollapsed ? "justify-center px-0 cursor-pointer" : "px-2"
          }`}
          onClick={isCollapsed ? onToggle : undefined}
          aria-label={isCollapsed ? "Expand sidebar" : undefined}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden">
            <Image
              src="/logo.png"
              alt="Apex Motors"
              width={40}
              height={40}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden transition-opacity duration-200">
              <span className="font-serif text-lg font-normal text-neutral-950 tracking-tight block leading-tight truncate">
                Careduc
              </span>
              <span className="text-[8px] font-mono text-neutral-400 block truncate">
                Dealership OS
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 w-full">
          {!isCollapsed && (
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono transition-opacity duration-200">
              Navigation
            </p>
          )}
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <div key={item.href} className="relative group w-full">
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                      e.preventDefault();
                      navigateTo(item.href);
                    }
                  }}
                  className={`group flex items-center rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 ${
                    isCollapsed
                      ? "h-11 w-11 justify-center mx-auto px-0"
                      : "justify-between px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-xs"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                  }`}
                  aria-label={item.label}
                >
                  <div
                    className={`flex items-center ${
                      isCollapsed ? "justify-center" : "gap-2.5"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition ${
                        isActive
                          ? "text-white"
                          : "text-neutral-400 group-hover:text-neutral-700"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold shrink-0 ${
                        isActive ? "bg-white/20 text-white" : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 invisible opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-lg bg-neutral-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl whitespace-nowrap">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded-sm bg-white/20 px-1 text-[10px] font-mono">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom Infrastructure Card ── */}
      <div className="w-full">
        {isCollapsed ? (
          <div className="relative group flex justify-center w-full">
            <Link
              href="/inventory"
              target="_blank"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200/90 bg-[#FDFBF7] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 transition shadow-2xs"
              aria-label="View Public Storefront"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 invisible opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
              <div className="rounded-lg bg-neutral-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl whitespace-nowrap">
                View Public Storefront
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200/90 bg-[#FDFBF7] p-3.5 space-y-2">
            <Link
              href="/inventory"
              target="_blank"
              className="flex items-center justify-between text-[11px] font-semibold text-neutral-900 hover:underline"
            >
              <span>View Public Storefront</span>
              <ArrowUpRight className="h-3 w-3 text-neutral-400" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
