"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Building2,
  Globe2,
  MapPin,
  Building,
  Navigation,
  MessageCircle,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import {
  INITIAL_ONBOARDING_DATA,
  INDIAN_STATES,
  type OnboardingData,
} from "./types";
import { StorefrontLivePreview } from "./storefront-live-preview";
import { completeOnboardingAction } from "../../app/onboarding/actions";

interface OnboardingWizardProps {
  initialUserName?: string;
  initialUserEmail?: string;
}

const SIDEBAR_STEPS = [
  { id: 1, title: "Dealership Identity" },
  { id: 2, title: "Showroom Location" },
];

export function OnboardingWizard({
  initialUserName,
  initialUserEmail,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    ...INITIAL_ONBOARDING_DATA,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleUpdate = (updates: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    const updatedKeys = Object.keys(updates);
    if (updatedKeys.some((k) => errors[k])) {
      setErrors((prev) => {
        const next = { ...prev };
        updatedKeys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.dealershipName.trim() || formData.dealershipName.trim().length < 3) {
        newErrors.dealershipName = "Dealership trade name must be at least 3 characters.";
      }
      if (!formData.slug.trim() || formData.slug.trim().length < 3) {
        newErrors.slug = "Subdomain slug must be at least 3 characters.";
      }
    } else if (step === 2) {
      if (!formData.address.trim()) {
        newErrors.address = "Street address is required.";
      }
      if (!formData.city.trim()) {
        newErrors.city = "City is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setIsSubmitting(true);
    try {
      const res = await completeOnboardingAction(formData);
      if (res?.redirectTo) {
        router.push(res.redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : "Failed to complete setup. Please try again.";
      setErrors({ form: msg });
    }
  };

  return (
    <div className="min-h-screen  text-neutral-900 font-sans antialiased flex flex-col justify-between selection:bg-neutral-950 selection:text-white">
      {/* ─── Main Two-Column Layout ─── */}
      <div className="mx-auto flex items-center justify-center w-full max-w-7xl flex-1 px-6 sm:px-12 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 w-full items-start">
          {/* ── Left Sidebar (Vertical Stepper as in reference image) ── */}
          <aside className="lg:col-span-4 space-y-8 pt-2">
            <div className="space-y-5">
              {SIDEBAR_STEPS.map((step) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id < currentStep || validateStep(currentStep)) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className="flex items-center gap-3 w-full text-left transition group active:scale-98"
                  >
                    {/* Circle icon */}
                    {isCompleted ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-neutral-950 bg-white shadow-2xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white" />
                    )}

                    {/* Step label */}
                    <span
                      className={`text-sm transition ${
                        isCurrent
                          ? "font-bold text-neutral-950"
                          : isCompleted
                          ? "font-medium text-neutral-700"
                          : "font-normal text-neutral-400 group-hover:text-neutral-600"
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Assistance Card */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4.5 shadow-2xs space-y-2">
              <p className="text-xs font-bold text-neutral-900">Need Onboarding Help?</p>
              <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
                Our Bengaluru automotive desk can assist with bulk CSV inventory imports or custom domain DNS setup.
              </p>
              <a
                href="https://wa.me/917736850015?text=Hi%20Orgetise,%20I%20am%20setting%20up%20my%20dealership%20and%20need%20assistance."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline pt-1"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Chat with Desk (+91 77368 50015)</span>
              </a>
            </div>
          </aside>

          {/* ── Right Column (Main Form Content matching reference) ── */}
          <main className="lg:col-span-8 max-w-2xl space-y-6">
            {/* Step Header Title */}
            <div>
              <h1 className="font-serif text-3xl font-normal text-neutral-950 tracking-tight">
                {currentStep === 1 && "Dealership Identity"}
                {currentStep === 2 && "Showroom Location"}
              </h1>
            </div>

            {/* Form Error Banner */}
            {errors.form && (
              <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-xs font-medium text-red-700">
                {errors.form}
              </div>
            )}

            {/* ─── Numbered Collapsible / Card Sections (Exact shape as reference) ─── */}
            <div className="space-y-4">
              {/* ════════════════ STEP 1: IDENTITY ════════════════ */}
              {currentStep === 1 && (
                <div className="bg-white overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between w-full px-5 py-4 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-white font-mono text-xs font-semibold">
                        1
                      </span>
                      <span className="text-sm font-bold text-neutral-950">
                        Trade Name & Subdomain
                      </span>
                    </div>
                    {formData.dealershipName.trim().length >= 3 && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        Complete
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    {/* Row 1: Trade Name */}
                    <div className="rounded-xl bg-neutral-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-neutral-800 shadow-2xs">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">Trade Name</p>
                          <p className="text-[11px] text-neutral-500 font-light">
                            Consumer-facing showroom brand
                          </p>
                        </div>
                      </div>
                      <div className="w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="e.g. Apex Motors"
                          value={formData.dealershipName}
                          onChange={(e) => {
                            const name = e.target.value;
                            const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
                            handleUpdate({ dealershipName: name, slug });
                          }}
                          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 focus:border-neutral-950 focus:outline-none"
                        />
                        {errors.dealershipName && (
                          <p className="text-[10px] text-red-600 mt-0.5">{errors.dealershipName}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Subdomain */}
                    <div className="rounded-xl bg-neutral-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-neutral-800 shadow-2xs">
                          <Globe2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">Subdomain URL</p>
                          <p className="text-[11px] text-neutral-500 font-light">
                            Fast edge URL
                          </p>
                        </div>
                      </div>
                      <div className="w-full sm:w-64 flex items-center rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 focus-within:border-neutral-950">
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) =>
                            handleUpdate({
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                            })
                          }
                          className="w-full font-mono text-xs font-semibold text-neutral-900 focus:outline-none"
                        />
                        <span className="font-mono text-[11px] text-neutral-400 pl-1 select-none">
                          .dealers.io
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════ STEP 2: LOCATION ════════════════ */}
              {currentStep === 2 && (
                <div className="rounded-2xl bg-white overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between w-full px-5 py-4 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-white font-mono text-xs font-semibold">
                        1
                      </span>
                      <span className="text-sm font-bold text-neutral-950">
                        Physical Showroom Address & Location
                      </span>
                    </div>
                    {formData.address.trim() && formData.city.trim() && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        Complete
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    {/* Street Address */}
                    <div className="rounded-xl bg-neutral-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-neutral-800 shadow-2xs">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">Street Address</p>
                          <p className="text-[11px] text-neutral-500 font-light">
                            Road, block, or building
                          </p>
                        </div>
                      </div>
                      <div className="w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="e.g. #42, 100ft Road, 4th Block"
                          value={formData.address}
                          onChange={(e) => handleUpdate({ address: e.target.value })}
                          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 focus:border-neutral-950 focus:outline-none"
                        />
                        {errors.address && (
                          <p className="text-[10px] text-red-600 mt-0.5">{errors.address}</p>
                        )}
                      </div>
                    </div>

                    {/* City & State */}
                    <div className="rounded-xl bg-neutral-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-neutral-800 shadow-2xs">
                          <Navigation className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">City & State</p>
                          <p className="text-[11px] text-neutral-500 font-light">
                            Regional territory
                          </p>
                        </div>
                      </div>
                      <div className="w-full sm:w-64 flex gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => handleUpdate({ city: e.target.value })}
                          className="w-1/2 rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-900 focus:border-neutral-950 focus:outline-none"
                        />
                        <select
                          value={formData.state}
                          onChange={(e) => handleUpdate({ state: e.target.value })}
                          className="w-1/2 rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-900 focus:border-neutral-950 focus:outline-none"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Bottom Navigation Actions (Aligned right as in reference) ─── */}
            <div className="flex items-center justify-between pt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(currentStep - 1);
                  }}
                  className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition active:scale-98"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full bg-neutral-950 px-7 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-850 transition active:scale-98"
                >
                  Continue to Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-8 py-3 text-xs font-semibold text-white shadow-md hover:bg-neutral-850 transition active:scale-98 disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Provisioning Showroom...</span>
                    </>
                  ) : (
                    <span>Launch Dealership Showroom 🚀</span>
                  )}
                </button>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ─── Optional Modal / Drawer for Storefront Live Preview ─── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="pt-2">
              <StorefrontLivePreview data={formData} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className=" py-4 text-center text-xs text-neutral-400 font-light">
        Orgetise Technologies Pvt. Ltd.
      </footer>
    </div>
  );
}