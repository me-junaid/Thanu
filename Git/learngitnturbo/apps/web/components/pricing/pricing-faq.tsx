"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const PRICING_FAQS: FaqItem[] = [
  {
    question: "Can I use my existing domain (e.g. myshowroom.com)?",
    answer:
      "Yes. On the Growth and Enterprise plans, you can connect your existing apex domain (e.g., myshowroom.com, royalcars.in) or any subdomain. Our automated edge DNS provisions free SSL certificates within 60 seconds. On the Starter plan, you receive a free branded subdomain (e.g. myshowroom.orgetise.com).",
  },
  {
    question: "Do you take any percentage or commission when I sell a vehicle?",
    answer:
      "Zero. Unlike car classifieds and aggregator portals that demand commissions or charge per-inquiry fees, Orgetise operates on a 100% transparent flat SaaS subscription. Every rupee of profit you negotiate on your vehicles remains entirely yours.",
  },
  {
    question: "Can my sales executives see my private vehicle purchase costs?",
    answer:
      "No. Orgetise enforces strict Role-Based Access Control (RBAC). Sales executives only see vehicle specs, public retail pricing, customer inquiries, and test drive logs. Acquisition costs, repair bills, and dealer gross profit margins are strictly restricted to the Dealership Owner and Admin accounts.",
  },
  {
    question: "Can I upgrade, downgrade, or add branches as my business expands?",
    answer:
      "Yes. You can upgrade or add branch showrooms at any point directly from your billing workspace. Changes are prorated automatically. When opening a new lot, you can spin up a new branch in under 2 minutes and transfer inventory between locations.",
  },
  {
    question: "What payment methods are supported for Indian dealerships?",
    answer:
      "We support all standard Indian commercial payment methods via Razorpay, including UPI (Google Pay, PhonePe, Paytm), Net Banking across all major Indian banks, Corporate Credit/Debit Cards, and automated recurring mandates. GST invoices with input tax credit (ITC) are automatically generated every billing cycle.",
  },
  {
    question: "How does the 14-day free trial work?",
    answer:
      "You can sign up and launch your dealership's branded website immediately without providing a credit card. You receive full access to all features in your chosen plan for 14 days. If you choose not to subscribe, your data remains safely stored and accessible for export.",
  },
];

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mt-24">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs">
          <HelpCircle className="h-3.5 w-3.5 text-neutral-900" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="mt-4 font-serif text-3xl sm:text-4xl font-normal text-neutral-950 tracking-tight">
          Common questions from dealership owners
        </h2>
        <p className="mt-2 text-sm text-neutral-600 font-light">
          Everything you need to know about our billing, data ownership, and domain setup.
        </p>
      </div>

      <div className="mt-10 max-w-3xl mx-auto divide-y divide-neutral-200/80 rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-sm">
        {PRICING_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="flex w-full items-center justify-between text-left gap-4 group cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                  {faq.question}
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-neutral-900 text-white" : ""
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              {isOpen && (
                <div className="mt-3 pr-8 text-xs text-neutral-600 font-light leading-relaxed animate-in fade-in-50 duration-200">
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

