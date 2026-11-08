"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  Users2,
  IndianRupee,
  Building2,
  Search,
  Filter,
  ShieldCheck,
  Check,
  Plus,
  ArrowRight,
  Sparkles,
  Phone,
  Calendar,
  Clock,
  ChevronDown,
  X,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  UserCheck,
} from "lucide-react";

interface FleetVehicle {
  id: string;
  name: string;
  brand: string;
  year: number;
  stockNumber: string;
  vin: string;
  branch: string;
  status: "Available" | "Reserved" | "Sold" | "Refurbishing";
  price: number;
  cost: number;
  refurbCost: number;
  image: string;
  mileage: string;
  fuel: string;
  transmission: string;
  views: number;
  inquiries: number;
}

const INITIAL_FLEET: FleetVehicle[] = [
  {
    id: "stk-01",
    name: "Porsche 911 Carrera S",
    brand: "Porsche",
    year: 2023,
    stockNumber: "STK-849",
    vin: "WP0AB2A97PS284910",
    branch: "Showroom Floor",
    status: "Available",
    price: 18500000,
    cost: 14800000,
    refurbCost: 450000,
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80",
    mileage: "12,400 km",
    fuel: "Petrol",
    transmission: "PDK",
    views: 412,
    inquiries: 7,
  },
  {
    id: "stk-02",
    name: "Mercedes-AMG GT 63 S",
    brand: "Mercedes-AMG",
    year: 2022,
    stockNumber: "STK-812",
    vin: "WDD2906891A812409",
    branch: "Showroom Floor",
    status: "Reserved",
    price: 16200000,
    cost: 13200000,
    refurbCost: 380000,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
    mileage: "18,200 km",
    fuel: "Petrol",
    transmission: "Dual-Clutch",
    views: 340,
    inquiries: 5,
  },
  {
    id: "stk-03",
    name: "BMW M4 Competition",
    brand: "BMW",
    year: 2024,
    stockNumber: "STK-790",
    vin: "WBA33AZ02RCP79014",
    branch: "Showroom Floor",
    status: "Sold",
    price: 12800000,
    cost: 10400000,
    refurbCost: 260000,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80",
    mileage: "6,100 km",
    fuel: "Petrol",
    transmission: "Automatic",
    views: 520,
    inquiries: 11,
  },
  {
    id: "stk-04",
    name: "Audi RS6 Avant Quattro",
    brand: "Audi",
    year: 2023,
    stockNumber: "STK-855",
    vin: "WAUZZZF23PN855012",
    branch: "Showroom Floor",
    status: "Available",
    price: 17500000,
    cost: 14200000,
    refurbCost: 400000,
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80",
    mileage: "14,800 km",
    fuel: "Hybrid",
    transmission: "Automatic",
    views: 289,
    inquiries: 4,
  },
  {
    id: "stk-05",
    name: "Aston Martin Vantage V8",
    brand: "Aston Martin",
    year: 2021,
    stockNumber: "STK-710",
    vin: "SCFRFAEY5MGA71049",
    branch: "Showroom Floor",
    status: "Reserved",
    price: 21000000,
    cost: 17100000,
    refurbCost: 650000,
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80",
    mileage: "21,500 km",
    fuel: "Petrol",
    transmission: "Automatic",
    views: 610,
    inquiries: 9,
  },
  {
    id: "stk-06",
    name: "Porsche Taycan Turbo S",
    brand: "Porsche",
    year: 2023,
    stockNumber: "STK-880",
    vin: "WP0AA2Y13PSA88014",
    branch: "Showroom Floor",
    status: "Refurbishing",
    price: 19500000,
    cost: 15900000,
    refurbCost: 520000,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    mileage: "11,000 km",
    fuel: "Electric",
    transmission: "Automatic",
    views: 195,
    inquiries: 3,
  },
];

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  car: string;
  budget: string;
  source: "Website Direct" | "WhatsApp" | "Referral";
  stage: "new" | "test_drive" | "token" | "delivered";
  salesperson: string;
  date: string;
  note: string;
}

const INITIAL_LEADS: LeadItem[] = [
  {
    id: "lead-01",
    name: "Rajesh Malhotra",
    phone: "+91 77368 50015",
    car: "2023 Porsche 911 Carrera S",
    budget: "₹1.85 Cr",
    source: "Website Direct",
    stage: "new",
    salesperson: "Vikram Sen",
    date: "Today, 11:30 AM",
    note: "Requested video walkaround before showroom visit.",
  },
  {
    id: "lead-02",
    name: "Sunita Reddy",
    phone: "+91 97412 88402",
    car: "2023 Audi RS6 Avant",
    budget: "₹1.75 Cr",
    source: "WhatsApp",
    stage: "new",
    salesperson: "Ananya Roy",
    date: "Today, 09:15 AM",
    note: "Trade-in inquiry for 2020 BMW 530d.",
  },
  {
    id: "lead-03",
    name: "Karan Johar",
    phone: "+91 99001 54219",
    car: "2022 Mercedes-AMG GT 63 S",
    budget: "₹1.60 Cr",
    source: "Website Direct",
    stage: "test_drive",
    salesperson: "Vikram Sen",
    date: "Tomorrow, 3:00 PM",
    note: "Test drive scheduled at Koramangala showroom.",
  },
  {
    id: "lead-04",
    name: "Naveen Jindal",
    phone: "+91 98860 99401",
    car: "2021 Aston Martin Vantage V8",
    budget: "₹2.05 Cr",
    source: "Referral",
    stage: "token",
    salesperson: "Rohan Varma (Owner)",
    date: "Token Received (₹5,00,000)",
    note: "RC transfer & paperwork initiated. Delivery Saturday.",
  },
  {
    id: "lead-05",
    name: "Aditya Birla Group (Corporate)",
    phone: "+91 98200 44102",
    car: "2024 BMW M4 Competition",
    budget: "₹1.28 Cr",
    source: "Website Direct",
    stage: "delivered",
    salesperson: "Vikram Sen",
    date: "Delivered 2 days ago",
    note: "Full payment cleared via RTGS. Invoice #INV-2024-089.",
  },
];

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "Dealership Owner" | "Showroom Manager" | "Sales Executive" | "Accountant";
  department: string;
  activeLeads: number;
  status: "Active" | "Away";
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "stf-1",
    name: "Rohan Varma",
    email: "rohan@apexmotors.in",
    role: "Dealership Owner",
    department: "Executive Management",
    activeLeads: 4,
    status: "Active",
  },
  {
    id: "stf-2",
    name: "Vikram Sen",
    email: "vikram@apexmotors.in",
    role: "Showroom Manager",
    department: "Showroom Operations",
    activeLeads: 14,
    status: "Active",
  },
  {
    id: "stf-3",
    name: "Ananya Roy",
    email: "ananya@apexmotors.in",
    role: "Sales Executive",
    department: "VIP & Performance Desk",
    activeLeads: 9,
    status: "Active",
  },
  {
    id: "stf-4",
    name: "Deepak Nair",
    email: "deepak@apexmotors.in",
    role: "Sales Executive",
    department: "Customer Test Drives",
    activeLeads: 7,
    status: "Active",
  },
  {
    id: "stf-5",
    name: "Pooja Hegde",
    email: "pooja@apexmotors.in",
    role: "Accountant",
    department: "Accounts & GST Filing",
    activeLeads: 0,
    status: "Active",
  },
];

export function WorkspaceShell() {
  const [activeTab, setActiveTab] = useState<"inventory" | "leads" | "accounting" | "team">("inventory");
  const [fleet] = useState<FleetVehicle[]>(INITIAL_FLEET);
  const [leads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  // Inventory Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [inspectVehicle, setInspectVehicle] = useState<FleetVehicle | null>(null);

  // Accounting Selection
  const [selectedCarForEconomics, setSelectedCarForEconomics] = useState<FleetVehicle>(INITIAL_FLEET[0]!);

  // Invite Staff Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffMember["role"]>("Sales Executive");
  const [inviteDepartment, setInviteDepartment] = useState("Executive Sales Desk");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Filtered inventory
  const filteredFleet = useMemo(() => {
    return fleet.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.stockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [fleet, searchQuery, statusFilter]);

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newStaff: StaffMember = {
      id: `stf-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      department: inviteDepartment,
      activeLeads: 0,
      status: "Active",
    };

    setStaff((prev) => [...prev, newStaff]);
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setIsInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
    }, 1200);
  };

  return (
    <div className="rounded-[2.5rem] border border-neutral-200/90 bg-white shadow-xl overflow-hidden">
      {/* ── Top Utility App Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-neutral-100 bg-neutral-50/70 px-6 py-3.5 gap-3">
        {/* Left: Dealership Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white font-bold text-xs">
            A
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-950">Apex Motors</span>
              <span className="text-[10px] text-neutral-400 font-mono">• Koramangala Showroom</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-light flex items-center gap-1">
              Role: <strong className="font-semibold text-neutral-700">Dealership Owner</strong>
              <span className="h-1 w-1 rounded-full bg-emerald-500 ml-1 inline-block" />
              <span className="text-emerald-700 font-medium">Online</span>
            </p>
          </div>
        </div>

        {/* Center/Right: Quick Switcher Bar */}
        <div className="flex items-center gap-2">
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
          >
            <span>Create Account</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ── Main Workspace Body with Navigation Tabs ── */}
      <div className="p-6 lg:p-8">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === "inventory"
                ? "bg-neutral-950 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200"
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            <span>Fleet Inventory (48)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === "leads"
                ? "bg-neutral-950 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200"
            }`}
          >
            <Users2 className="h-3.5 w-3.5" />
            <span>Lead CRM & Test Drives (12)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("accounting")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === "accounting"
                ? "bg-neutral-950 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200"
            }`}
          >
            <IndianRupee className="h-3.5 w-3.5" />
            <span>Cost & Profit Accounting</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === "team"
                ? "bg-neutral-950 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Showrooms & Staff Roles ({staff.length})</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* MODULE 1: FLEET INVENTORY MANAGEMENT                      */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "inventory" && (
          <div className="mt-6 space-y-6">
            {/* Key Fleet Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4">
                <p className="text-[10px] text-neutral-500 font-mono uppercase">Total Vehicles</p>
                <p className="font-serif text-2xl font-bold text-neutral-950 mt-1">48</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Across 2 showrooms</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <p className="text-[10px] text-emerald-800 font-mono uppercase">Available for Sale</p>
                <p className="font-serif text-2xl font-bold text-emerald-900 mt-1">34</p>
                <p className="text-[10px] text-emerald-700 mt-0.5">Live on custom domain</p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                <p className="text-[10px] text-amber-800 font-mono uppercase">Reserved / Tokens</p>
                <p className="font-serif text-2xl font-bold text-amber-900 mt-1">8</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Pending delivery</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-[10px] text-blue-800 font-mono uppercase">In Refurbishment</p>
                <p className="font-serif text-2xl font-bold text-blue-900 mt-1">6</p>
                <p className="text-[10px] text-blue-700 mt-0.5">Inspection & ceramic coat</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["All", "Available", "Reserved", "Sold"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      statusFilter === status
                        ? "bg-neutral-950 text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:text-neutral-950"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search model, brand, or STK #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-neutral-200 bg-neutral-50/60 pl-9 pr-4 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Stock Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-100">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    <th className="py-3 px-4">Vehicle Specs</th>
                    <th className="py-3 px-4">Stock & VIN</th>
                    <th className="py-3 px-4">Showroom Lot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">List Price (INR)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredFleet.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      onClick={() => setInspectVehicle(vehicle)}
                      className="hover:bg-neutral-50/70 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                            <Image
                              src={vehicle.image}
                              alt={vehicle.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-950 group-hover:text-neutral-700">
                              {vehicle.year} {vehicle.name}
                            </p>
                            <p className="text-[11px] text-neutral-500 font-light">
                              {vehicle.mileage} • {vehicle.fuel} • {vehicle.transmission}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-600">
                        <p className="font-semibold text-neutral-900">{vehicle.stockNumber}</p>
                        <p className="text-[10px] text-neutral-400">{vehicle.vin.slice(0, 10)}...</p>
                      </td>

                      <td className="py-3 px-4 text-neutral-600 font-light">
                        {vehicle.branch}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            vehicle.status === "Available"
                              ? "bg-emerald-100 text-emerald-800"
                              : vehicle.status === "Reserved"
                              ? "bg-amber-100 text-amber-800"
                              : vehicle.status === "Sold"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-serif font-bold text-neutral-950 text-sm">
                        ₹{vehicle.price.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50">
                          Inspect <ArrowRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* MODULE 2: LEAD CRM & TEST DRIVE SCHEDULER                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "leads" && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-950">Inquiry & Test Drive Pipeline</h3>
                <p className="text-xs text-neutral-500 font-light">
                  Direct customer leads captured through website forms and WhatsApp inquiries.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <Clock className="h-3.5 w-3.5" /> 12 Active Leads in Pipeline
              </span>
            </div>

            {/* 4-Stage Kanban Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stage 1: New Inquiries */}
              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 text-xs font-bold text-neutral-950">
                  <span>1. New Inquiries (2)</span>
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                {leads
                  .filter((l) => l.stage === "new")
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-neutral-200/70 bg-white p-3.5 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-bold text-xs text-neutral-950">{lead.name}</p>
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-mono text-neutral-600">
                          {lead.source}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-neutral-800">{lead.car}</p>
                      <p className="text-[11px] text-neutral-500 font-light leading-snug">{lead.note}</p>
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-700">{lead.budget}</span>
                        <a
                          href={`https://wa.me/917736850015?text=Hi%20${encodeURIComponent(lead.name)},%20regarding%20your%20inquiry%20for%20${encodeURIComponent(lead.car)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100"
                        >
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Stage 2: Test Drive Scheduled */}
              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 text-xs font-bold text-neutral-950">
                  <span>2. Test Drive (1)</span>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                </div>
                {leads
                  .filter((l) => l.stage === "test_drive")
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-amber-200/70 bg-white p-3.5 shadow-2xs space-y-2 ring-2 ring-amber-400/10"
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-bold text-xs text-neutral-950">{lead.name}</p>
                        <span className="rounded bg-amber-100 text-amber-900 px-1.5 py-0.5 text-[9px] font-semibold">
                          Scheduled
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-neutral-800">{lead.car}</p>
                      <div className="rounded-lg bg-amber-50 p-2 text-[10px] text-amber-900 flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3 w-3" /> {lead.date}
                      </div>
                      <p className="text-[11px] text-neutral-500 font-light">Assigned: {lead.salesperson}</p>
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-neutral-900">{lead.budget}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Confirmed</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Stage 3: Token Received */}
              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 text-xs font-bold text-neutral-950">
                  <span>3. Token / Booking (1)</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                {leads
                  .filter((l) => l.stage === "token")
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-emerald-200/70 bg-white p-3.5 shadow-2xs space-y-2 ring-2 ring-emerald-400/10"
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-bold text-xs text-neutral-950">{lead.name}</p>
                        <span className="rounded bg-emerald-100 text-emerald-900 px-1.5 py-0.5 text-[9px] font-semibold">
                          Deposit In
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-neutral-800">{lead.car}</p>
                      <div className="rounded-lg bg-emerald-50 p-2 text-[10px] text-emerald-900 font-semibold">
                        {lead.date}
                      </div>
                      <p className="text-[11px] text-neutral-500 font-light leading-snug">{lead.note}</p>
                    </div>
                  ))}
              </div>

              {/* Stage 4: Delivered */}
              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 text-xs font-bold text-neutral-950">
                  <span>4. Closed & Sold (1)</span>
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                </div>
                {leads
                  .filter((l) => l.stage === "delivered")
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs space-y-2 opacity-85"
                    >
                      <p className="font-bold text-xs text-neutral-950">{lead.name}</p>
                      <p className="text-xs font-semibold text-neutral-800">{lead.car}</p>
                      <p className="text-[10px] text-emerald-700 font-medium">✓ Delivery Completed</p>
                      <p className="text-[11px] text-neutral-500 font-light leading-snug">{lead.note}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* MODULE 3: PRIVATE COST & PROFIT ACCOUNTING                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "accounting" && (
          <div className="mt-6 space-y-6">
            {/* Owner-Only Security Banner */}
            <div className="rounded-2xl bg-neutral-950 p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Dealership Owner Protected View
                  </p>
                  <p className="text-[11px] text-neutral-400 font-light">
                    Acquisition costs and profit margins are strictly hidden from sales reps and public storefront APIs.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-mono font-semibold text-neutral-300">
                RBAC Level: Owner / Accountant
              </span>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  Total Fleet Capital Invested
                </p>
                <p className="font-serif text-3xl font-bold text-neutral-950 mt-1.5">
                  ₹6.84 Crore
                </p>
                <p className="text-[11px] text-neutral-500 font-light mt-1">
                  Across 48 certified inventory units
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-2xs">
                <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-800">
                  Estimated Gross Profit
                </p>
                <p className="font-serif text-3xl font-bold text-emerald-900 mt-1.5">
                  ₹1.12 Crore
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  Average gross margin: 16.4% per car
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  Average Inventory Holding Period
                </p>
                <p className="font-serif text-3xl font-bold text-neutral-950 mt-1.5">
                  21 Days
                </p>
                <p className="text-[11px] text-neutral-500 font-light mt-1">
                  From acquisition to final customer delivery
                </p>
              </div>
            </div>

            {/* Interactive Unit Economics Inspector */}
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-neutral-950">Unit Economics Calculator</h4>
                  <p className="text-xs text-neutral-500 font-light">
                    Select a vehicle to inspect purchase cost, refurbishing, and net dealership margin.
                  </p>
                </div>
                {/* Vehicle Selector Dropdown */}
                <select
                  value={selectedCarForEconomics.id}
                  onChange={(e) => {
                    const found = fleet.find((f) => f.id === e.target.value);
                    if (found) setSelectedCarForEconomics(found);
                  }}
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-2xs focus:outline-none"
                >
                  {fleet.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.year} {car.name} ({car.stockNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4 Steps Math Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white p-4 border border-neutral-200">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">1. Acquisition Price</p>
                  <p className="font-serif text-xl font-bold text-neutral-900 mt-1">
                    ₹{selectedCarForEconomics.cost.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Direct private purchase</p>
                </div>

                <div className="rounded-2xl bg-white p-4 border border-neutral-200">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">2. Refurb & Detailing</p>
                  <p className="font-serif text-xl font-bold text-neutral-900 mt-1">
                    ₹{selectedCarForEconomics.refurbCost.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Mechanical & ceramic coat</p>
                </div>

                <div className="rounded-2xl bg-white p-4 border border-neutral-200">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">3. Listed Retail Price</p>
                  <p className="font-serif text-xl font-bold text-neutral-900 mt-1">
                    ₹{selectedCarForEconomics.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Live on your website</p>
                </div>

                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-[10px] font-mono text-emerald-800 uppercase font-semibold">
                    4. Net Dealership Margin
                  </p>
                  <p className="font-serif text-xl font-bold text-emerald-900 mt-1">
                    +₹
                    {(
                      selectedCarForEconomics.price -
                      selectedCarForEconomics.cost -
                      selectedCarForEconomics.refurbCost
                    ).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    {(
                      ((selectedCarForEconomics.price -
                        selectedCarForEconomics.cost -
                        selectedCarForEconomics.refurbCost) /
                        selectedCarForEconomics.price) *
                      100
                    ).toFixed(1)}
                    % Net margin
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* MODULE 4: SHOWROOM STAFF & ROLES (SINGLE-SHOWROOM)        */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "team" && (
          <div className="mt-6 space-y-6">
            {/* Showroom Physical Presence (Single Showroom per Dealership) */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-950 text-white text-[10px]">
                    <Building2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-bold text-neutral-900">
                    Dedicated Showroom: Apex Motors Koramangala
                  </span>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[9px] font-semibold">
                  Single Account Showroom
                </span>
              </div>
              <p className="text-xs text-neutral-600 font-light">
                #42, 100ft Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034
              </p>
              <div className="flex items-center gap-4 text-[11px] text-neutral-500 font-mono pt-1">
                <span>48 Certified Vehicles on Floor</span>
                <span>•</span>
                <span>6 Showroom Staff Members</span>
                <span>•</span>
                <span>All Vehicles Under One Lot</span>
              </div>
            </div>

            {/* Staff Roster Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-950">Staff & Role-Based Access Control</h4>
                  <p className="text-xs text-neutral-500 font-light">
                    Configure staff permissions to ensure salespeople only access their assigned leads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-850 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Invite Staff Member</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-neutral-100">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Role Permission</th>
                      <th className="py-3 px-4">Assigned Department</th>
                      <th className="py-3 px-4">Active Leads</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {staff.map((member) => (
                      <tr key={member.id} className="hover:bg-neutral-50/50 transition">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-neutral-900">{member.name}</p>
                          <p className="text-[11px] text-neutral-400 font-light">{member.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-800">
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{member.department}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-neutral-900">
                          {member.activeLeads}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Vehicle Inspection Drawer / Modal ── */}
      {inspectVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200">
            <button
              type="button"
              onClick={() => setInspectVehicle(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100 mb-4">
              <Image
                src={inspectVehicle.image}
                alt={inspectVehicle.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">
                {inspectVehicle.stockNumber} • VIN: {inspectVehicle.vin}
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-950">
                {inspectVehicle.year} {inspectVehicle.name}
              </h3>
              <p className="font-serif text-2xl font-bold text-neutral-900 pt-1">
                ₹{inspectVehicle.price.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-y border-neutral-100 py-3">
              <div>
                <span className="text-neutral-400 text-[10px] block">Mileage</span>
                <span className="font-semibold text-neutral-900">{inspectVehicle.mileage}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] block">Transmission</span>
                <span className="font-semibold text-neutral-900">{inspectVehicle.transmission}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] block">Showroom Lot</span>
                <span className="font-semibold text-neutral-900">{inspectVehicle.branch}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] block">Lead Inquiries</span>
                <span className="font-semibold text-emerald-700">{inspectVehicle.inquiries} buyers</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectVehicle(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Close Preview
              </button>
              <Link
                href="/signup"
                className="rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
              >
                Launch Dealership
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Staff Modal ── */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-neutral-950">Invite Staff Member</h3>
            <p className="text-xs text-neutral-500 font-light mt-1">
              Add a sales executive or branch manager with specific role permissions.
            </p>

            {inviteSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-neutral-900">Invitation Dispatched!</p>
                <p className="text-[11px] text-neutral-500">
                  Login invitation sent to {inviteEmail}
                </p>
              </div>
            ) : (
              <form onSubmit={handleInviteStaff} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@dealership.in"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700">Role Permission</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as StaffMember["role"])}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                  >
                    <option value="Sales Executive">Sales Executive (Assigned Leads Only)</option>
                    <option value="Showroom Manager">Showroom Manager (Showroom Lot Access)</option>
                    <option value="Accountant">Accountant (Invoices & Billing)</option>
                    <option value="Dealership Owner">Dealership Owner (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700">Department / Desk</label>
                  <select
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                  >
                    <option value="Executive Sales Desk">Executive Sales Desk</option>
                    <option value="Customer Relations & Test Drives">Customer Relations & Test Drives</option>
                    <option value="Inventory & Logistics">Inventory & Logistics</option>
                    <option value="Accounts & GST Filing">Accounts & GST Filing</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-neutral-950 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 cursor-pointer"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}