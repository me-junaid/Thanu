import React, { useState } from "react";
import { X, Plus, Users2, AlertCircle, Loader2 } from "lucide-react";
import { createLeadAction } from "../../../app/dashboard/leads/actions";
import type { LeadCreateInput } from "../../../lib/schemas/lead";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleOptions: { id: string; label: string; price: string }[];
  staffOptions: { id: string; fullName: string; role: string }[];
}

export function CreateLeadModal({
  isOpen,
  onClose,
  onSuccess,
  vehicleOptions,
  staffOptions,
}: CreateLeadModalProps) {
  const [formData, setFormData] = useState<LeadCreateInput>({
    customerName: "",
    phoneNumber: "+91 ",
    email: "",
    city: "Bengaluru",
    vehicleId: vehicleOptions[0]?.id || "",
    source: "showroom_walkin",
    status: "new",
    priority: "medium",
    budgetAmount: 15000000,
    financingRequired: false,
    tradeInVehicle: "",
    assignedTo: staffOptions[0]?.id || "",
    nextFollowupAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    initialNote: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await createLeadAction(formData);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record inquiry.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-neutral-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="font-serif text-xl font-bold text-neutral-950">
              Record New Inquiry / Walk-in
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Capture buyer contact details, vehicle interest, and trade-in exchange notes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Customer Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              1. Prospect Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Phone Number (WhatsApp) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98840 12345"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="vikram@example.com"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Inquiry Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value as any })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:outline-none"
                >
                  <option value="showroom_walkin">Showroom Walk-in</option>
                  <option value="whatsapp_direct">WhatsApp Direct</option>
                  <option value="website_form">Website Form</option>
                  <option value="phone_call">Phone Desk Call</option>
                  <option value="referral">Customer Referral</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicle of Interest & Budget */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              2. Vehicle & Purchase Parameters
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Vehicle of Interest
                </label>
                <select
                  value={formData.vehicleId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleId: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:outline-none"
                >
                  <option value="">General Inquiry (No specific car)</option>
                  {vehicleOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} — Asking: {v.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Customer Budget (INR)
                  </label>
                  <input
                    type="number"
                    step={50000}
                    value={formData.budgetAmount || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budgetAmount: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs font-mono font-semibold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Trade-in / Exchange Car
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2020 BMW 530d M Sport"
                    value={formData.tradeInVehicle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, tradeInVehicle: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-800">
                  <input
                    type="checkbox"
                    checked={formData.financingRequired}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        financingRequired: e.target.checked,
                      })
                    }
                    className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                  />
                  <span>Customer requires auto loan / financing</span>
                </label>
              </div>
            </div>
          </div>

          {/* Assignment & Notes */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              3. Sales Assignment & Outreach
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Assigned Sales Rep
                </label>
                <select
                  value={formData.assignedTo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                >
                  <option value="">Unassigned</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Lead Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as any })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                >
                  <option value="urgent">Urgent (Immediate Callback)</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Initial Notes & Requirements
              </label>
              <textarea
                rows={2}
                placeholder="Specific color preference, delivery timeline, or negotiation comments..."
                value={formData.initialNote || ""}
                onChange={(e) =>
                  setFormData({ ...formData, initialNote: e.target.value })
                }
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? "Creating..." : "Save Prospect to CRM"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
