import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Car,
  User,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Send,
  Loader2,
  Plus,
} from "lucide-react";
import { LeadStatusBadge, LeadPriorityBadge, LeadSourceBadge } from "./lead-status-badge";
import {
  updateLeadStatusAction,
  addLeadActivityAction,
  assignLeadAction,
  type LeadItem,
  type LeadStatus,
} from "../../app/dashboard/leads/actions";
import { Can } from "../permissions/can";

interface LeadDrawerProps {
  lead: LeadItem | null;
  onClose: () => void;
  staffOptions: { id: string; fullName: string; role: string }[];
  onRefresh: () => void;
}

const ALL_STAGES: LeadStatus[] = [
  "new",
  "contacted",
  "interested",
  "test_drive_scheduled",
  "negotiation",
  "booked",
  "converted",
  "lost",
];

export function LeadDrawer({
  lead,
  onClose,
  staffOptions,
  onRefresh,
}: LeadDrawerProps) {
  const [newNote, setNewNote] = useState("");
  const [activityType, setActivityType] = useState<
    "note_added" | "call_logged" | "whatsapp_sent" | "test_drive_booked"
  >("note_added");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  if (!lead) return null;

  const whatsappLink = `https://wa.me/${lead.phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${lead.customerName}, following up regarding your inquiry with our showroom.`
  )}`;

  const handleStageChange = async (newStatus: LeadStatus) => {
    setIsUpdatingStage(true);
    try {
      await updateLeadStatusAction({
        leadId: lead.id,
        status: newStatus,
      });
      onRefresh();
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      const titleMap = {
        note_added: "Sales Note Added",
        call_logged: "Phone Call Completed",
        whatsapp_sent: "WhatsApp Outreach",
        test_drive_booked: "Test Drive Scheduled",
      };

      await addLeadActivityAction({
        leadId: lead.id,
        activityType,
        title: titleMap[activityType],
        description: newNote.trim(),
      });
      setNewNote("");
      onRefresh();
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAssignChange = async (staffId: string) => {
    await assignLeadAction({
      leadId: lead.id,
      assignedTo: staffId || null,
    });
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                Lead #{lead.id.slice(0, 8)}
              </span>
              <span className="text-neutral-300">•</span>
              <LeadStatusBadge status={lead.status} size="sm" />
              <LeadPriorityBadge priority={lead.priority} />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Prospect Identity & Direct CTAs */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-neutral-950">
                  {lead.customerName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono mt-1">
                  <span>{lead.phoneNumber}</span>
                  {lead.email && <span>• {lead.email}</span>}
                  {lead.city && <span>• {lead.city}</span>}
                </div>
              </div>

              {/* Omnichannel Quick Action CTAs */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 shadow-2xs transition"
                  title="Call Customer"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-2xs transition"
                  title="WhatsApp Direct"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Stage Progression Bar (Gated by leads:update) */}
            <Can
              permission="leads:update"
              fallback={
                <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-800">
                    Sales Pipeline Stage:
                  </span>
                  <LeadStatusBadge status={lead.status} />
                </div>
              }
            >
              <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-800">
                    Sales Pipeline Stage:
                  </span>
                  <span className="font-mono text-[10px] text-neutral-400 uppercase">
                    Click to transition
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ALL_STAGES.map((st) => {
                    const isCurrent = lead.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={isUpdatingStage || isCurrent}
                        onClick={() => handleStageChange(st)}
                        className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition active:scale-98 capitalize ${
                          isCurrent
                            ? "bg-neutral-950 text-white shadow-xs"
                            : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {st.replace(/_/g, " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Can>

            {/* Vehicle of Interest Card */}
            {lead.vehicle ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Vehicle of Interest
                </h4>
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-[#FDFBF7] p-3.5 shadow-2xs">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                    <Image
                      src={lead.vehicle.heroImage}
                      alt={lead.vehicle.model}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-mono text-neutral-400 block">
                      {lead.vehicle.manufacturingYear} • {lead.vehicle.brand}
                    </span>
                    <h5 className="font-serif text-sm font-bold text-neutral-950 truncate">
                      {lead.vehicle.model} {lead.vehicle.variant || ""}
                    </h5>
                    <p className="font-serif text-xs font-bold text-emerald-800 mt-0.5">
                      Asking: {lead.vehicle.formattedPrice}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Commercial Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-neutral-100 p-3 bg-neutral-50/50">
                <span className="text-[10px] text-neutral-400 block font-mono uppercase">
                  Target Budget
                </span>
                <span className="font-mono font-bold text-neutral-950 text-sm mt-0.5 block">
                  {lead.formattedBudget || "Open / Unspecified"}
                </span>
              </div>

              <div className="rounded-xl border border-neutral-100 p-3 bg-neutral-50/50">
                <span className="text-[10px] text-neutral-400 block font-mono uppercase">
                  Financing & Trade-in
                </span>
                <span className="font-semibold text-neutral-900 block mt-0.5">
                  {lead.financingRequired ? "Loan Required" : "Self-Funded"}
                  {lead.tradeInVehicle ? ` • Exch: ${lead.tradeInVehicle}` : ""}
                </span>
              </div>
            </div>

            {/* Assigned Sales Executive (Gated by leads:reassign) */}
            <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 p-3 bg-white">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-neutral-500" />
                <span className="text-xs font-medium text-neutral-800">
                  Assigned Representative:
                </span>
              </div>
              <Can
                permission="leads:reassign"
                fallback={
                  <span className="text-xs font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-md">
                    {staffOptions.find((s) => s.id === lead.assignedTo)?.fullName ||
                      "Unassigned"}
                  </span>
                }
              >
                <select
                  value={lead.assignedTo || ""}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-800 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.role})
                    </option>
                  ))}
                </select>
              </Can>
            </div>

            {/* ─── Communication Log & Activity Timeline ─── */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Activity Timeline ({lead.activities.length})
                </h4>
              </div>

              {/* Add Note Form (Gated by leads:update) */}
              <Can permission="leads:update">
                <form onSubmit={handleAddNote} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
                  >
                    <option value="note_added">Sales Note</option>
                    <option value="call_logged">Call Log</option>
                    <option value="whatsapp_sent">WhatsApp</option>
                    <option value="test_drive_booked">Test Drive</option>
                  </select>
                  <span className="text-[11px] text-neutral-400">
                    Log updates directly to audit timeline
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter call outcome, negotiation notes, or follow-up status..."
                    className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNote.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {isSubmittingNote ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>Log</span>
                  </button>
                </div>
              </form>
            </Can>

              {/* Timeline Feed */}
              <div className="space-y-3 pt-2">
                {lead.activities.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-neutral-900">
                        {act.title}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {new Date(act.createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {act.description && (
                      <p className="text-xs text-neutral-600 font-light leading-relaxed">
                        {act.description}
                      </p>
                    )}
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      By {act.authorName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Inquiry captured via {lead.source.replace("_", " ")}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-neutral-900 hover:underline"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

