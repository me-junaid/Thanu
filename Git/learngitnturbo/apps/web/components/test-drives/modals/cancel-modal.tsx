"use client";

import React, { useState } from "react";
import { X, Ban, Loader2, AlertTriangle } from "lucide-react";
import { cancelTestDriveAction } from "../../../app/dashboard/test-drives/actions";

interface CancelModalProps {
  testDriveId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelModal({
  testDriveId,
  isOpen,
  onClose,
  onSuccess,
}: CancelModalProps) {
  if (!isOpen || !testDriveId) return null;

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please specify a cancellation reason.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await cancelTestDriveAction({
        id: testDriveId,
        cancellationReason: reason.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to cancel test drive.");
    } finally {
      setSubmitting(false);
    }
  };

  const QUICK_REASONS = [
    "Customer rescheduled",
    "Customer budget mismatch",
    "Customer decided on another vehicle",
    "Vehicle sent for maintenance/refurbishment",
    "Customer did not attend (No-show)",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <Ban className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-lg font-normal text-neutral-950">
              Cancel Test Drive
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Select or type cancellation reason *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition ${
                    reason === r
                      ? "bg-neutral-950 text-white border-neutral-950"
                      : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context on why this test drive was cancelled..."
              className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancellation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

