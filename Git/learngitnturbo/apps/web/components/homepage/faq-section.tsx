"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

const FAQS = [
  {
    question: "Can I connect my dealership's existing custom domain?",
    answer:
      "Yes. On the Growth and Enterprise tiers, you can bind any custom domain (e.g. yourdealership.com). We automatically handle SSL certificates, CDN distribution, and routing at the edge in less than 60 seconds.",
  },
  {
    question: "Can competing dealerships see my cost prices or customer leads?",
    answer:
      "Never. The architecture strictly enforces PostgreSQL Row-Level Security (RLS). Every database record (vehicles, customer contacts, purchase costs, profit calculations) contains a verified tenant_id. Cross-tenant queries are blocked at the database engine level.",
  },
  {
    question: "How do customer inquiries and test drives reach my team?",
    answer:
      "When a buyer schedules a test drive or submits an inquiry on your website, it immediately lands in your dealership's CRM pipeline. You can configure instant email alerts, WhatsApp notifications, or assign the lead to specific sales executives based on branch location.",
  },
  {
    question: "Do you charge transaction fees or commission on vehicle sales?",
    answer:
      "No. We charge a flat software subscription. You keep 100% of your vehicle sales, margins, and financing referral fees.",
  },
  {
    question: "How do multiple branch locations work?",
    answer:
      "You can create distinct branch locations (e.g. Downtown Showroom, Airport Depot). Vehicles can be assigned to branches, transferred between lots, and sales staff can be granted branch-scoped access.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="mx-auto mt-28 max-w-4xl px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs">
          <HelpCircle className="h-3.5 w-3.5 text-neutral-900" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-neutral-950 font-normal tracking-tight">
          Everything you need to know about the platform.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-light">
          Have more questions? Our dealership onboarding team is ready to help.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={faq.question}
              className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-2xs transition"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-neutral-900 transition hover:bg-neutral-50/50"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed border-t border-neutral-100">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

