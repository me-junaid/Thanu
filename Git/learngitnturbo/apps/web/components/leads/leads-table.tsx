import React from "react";
import Image from "next/image";
import {
  MessageCircle,
  Phone,
  Clock,
  Car,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import {
  LeadStatusBadge,
  LeadPriorityBadge,
  LeadSourceBadge,
} from "./lead-status-badge";
import type { LeadItem } from "../../app/dashboard/leads/actions";

interface LeadsTableProps {
  leads: LeadItem[];
  isLoading?: boolean;
  onSelectLead: (lead: LeadItem) => void;
}

export function LeadsTable({ leads, isLoading = false, onSelectLead }: LeadsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold font-mono uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-4">Prospect</th>
              <th className="py-3.5 px-4">Interested Vehicle</th>
              <th className="py-3.5 px-4">Stage</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Budget (INR)</th>
              <th className="py-3.5 px-4">Assigned Rep</th>
              <th className="py-3.5 px-4">Next Follow-up</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading && leads.length === 0 ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-neutral-200 rounded" />
                      <div className="h-3 w-24 bg-neutral-100 rounded" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 w-36 bg-neutral-200 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-6 w-20 bg-neutral-200 rounded-full" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-6 w-16 bg-neutral-100 rounded-full" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 w-20 bg-neutral-200 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 w-24 bg-neutral-100 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 w-20 bg-neutral-100 rounded" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-8 w-8 bg-neutral-100 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))
            ) : (
              leads.map((lead) => {
              const whatsappLink = `https://wa.me/${lead.phoneNumber.replace(/[^0-9]/g, "")}`;

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="group hover:bg-neutral-50/80 transition cursor-pointer"
                >
                  {/* 1. Customer Name & Contact */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-950 font-serif text-sm">
                          {lead.customerName}
                        </span>
                        {lead.isFollowupDue && (
                          <span
                            title="Follow-up due"
                            className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {lead.phoneNumber}
                      </p>
                      <div className="mt-1">
                        <LeadSourceBadge source={lead.source} />
                      </div>
                    </div>
                  </td>

                  {/* 2. Interested Vehicle */}
                  <td className="py-3.5 px-4">
                    {lead.vehicle ? (
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-200">
                          <Image
                            src={lead.vehicle.heroImage}
                            alt={lead.vehicle.model}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {lead.vehicle.brand} {lead.vehicle.model}
                          </p>
                          <p className="text-[11px] font-serif font-bold text-neutral-700">
                            {lead.vehicle.formattedPrice}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic text-[11px]">
                        General Inquiry
                      </span>
                    )}
                  </td>

                  {/* 3. Stage Badge */}
                  <td className="py-3.5 px-4">
                    <LeadStatusBadge status={lead.status} size="sm" />
                  </td>

                  {/* 4. Priority Badge */}
                  <td className="py-3.5 px-4">
                    <LeadPriorityBadge priority={lead.priority} />
                  </td>

                  {/* 5. Budget Amount */}
                  <td className="py-3.5 px-4 font-mono font-medium text-neutral-900">
                    {lead.formattedBudget || "—"}
                  </td>

                  {/* 6. Assigned Staff */}
                  <td className="py-3.5 px-4 text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-neutral-400" />
                      <span>{lead.assignedStaffName}</span>
                    </div>
                  </td>

                  {/* 7. Next Follow-up */}
                  <td className="py-3.5 px-4">
                    {lead.nextFollowupAt ? (
                      <div className="flex items-center gap-1.5">
                        <Clock className={`h-3 w-3 ${lead.isFollowupDue ? "text-red-500" : "text-neutral-400"}`} />
                        <span className={`font-mono ${lead.isFollowupDue ? "text-red-600 font-bold" : "text-neutral-600"}`}>
                          {new Date(lead.nextFollowupAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-300 font-mono">—</span>
                    )}
                  </td>

                  {/* 8. Actions (WhatsApp & Open) */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onSelectLead(lead)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 transition shadow-2xs"
                        title="View Dossier"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

