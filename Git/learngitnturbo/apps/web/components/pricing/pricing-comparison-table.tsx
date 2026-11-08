import { Fragment } from "react";
import { Check, Minus } from "lucide-react";

interface FeatureRow {
  name: string;
  starter: string | boolean;
  growth: string | boolean;
  enterprise: string | boolean;
}

interface FeatureCategory {
  category: string;
  rows: FeatureRow[];
}

const COMPARISON_CATEGORIES: FeatureCategory[] = [
  {
    category: "Showroom & Inventory",
    rows: [
      {
        name: "Cars listed online",
        starter: "Up to 25",
        growth: "Up to 75",
        enterprise: "Unlimited",
      },
      {
        name: "Showroom locations",
        starter: "1 location",
        growth: "Up to 3",
        enterprise: "Unlimited",
      },
      {
        name: "Photos per car",
        starter: "15 photos",
        growth: "35 photos",
        enterprise: "Unlimited",
      },
      {
        name: "Photo watermark protection",
        starter: false,
        growth: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Website & Branding",
    rows: [
      {
        name: "Dealership website address",
        starter: "dealer.orgetise.com",
        growth: "Your domain (e.g. carzone.in)",
        enterprise: "Multiple custom domains",
      },
      {
        name: "Free SSL security certificate",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        name: "Mobile-friendly design",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        name: "Custom logo & brand colors",
        starter: true,
        growth: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Leads & WhatsApp CRM",
    rows: [
      {
        name: "Customer inquiry forms",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        name: "Direct WhatsApp chat button",
        starter: false,
        growth: true,
        enterprise: true,
      },
      {
        name: "Test drive booking scheduler",
        starter: false,
        growth: true,
        enterprise: true,
      },
      {
        name: "Staff & salesperson accounts",
        starter: "1 Admin",
        growth: "Up to 5 staff",
        enterprise: "Unlimited",
      },
    ],
  },
  {
    category: "Operations & Support",
    rows: [
      {
        name: "Hidden purchase costs & profit tracker",
        starter: false,
        growth: false,
        enterprise: true,
      },
      {
        name: "Transfer cars between branches",
        starter: false,
        growth: false,
        enterprise: true,
      },
      {
        name: "Excel inventory import",
        starter: "Self-serve",
        growth: "Assisted",
        enterprise: "Free 24-hr concierge",
      },
      {
        name: "Customer support",
        starter: "Email support",
        growth: "Priority WhatsApp",
        enterprise: "Dedicated account manager",
      },
    ],
  },
];

function RenderValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check className="h-4 w-4" />
      </span>
    ) : (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span className="text-xs font-semibold text-neutral-900 leading-tight">
      {value}
    </span>
  );
}

export function PricingComparisonTable() {
  return (
    <section className="mt-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
          Compare Plans
        </span>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-neutral-950 tracking-tight">
          Everything compared side-by-side
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-600 font-light">
          Choose the right plan based on your showroom size and fleet capacity.
        </p>
      </div>

      <div className="mt-10 overflow-x-auto rounded-3xl border border-neutral-200/80 bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[640px]">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/80">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono w-[40%]">
                Feature
              </th>
              <th className="py-4 px-4 text-center text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono w-[20%]">
                Starter
                <span className="block text-[11px] text-neutral-500 font-normal lowercase mt-0.5">₹2,999/mo</span>
              </th>
              <th className="py-4 px-4 text-center text-xs font-bold uppercase tracking-wider text-neutral-950 font-mono w-[20%] bg-neutral-100/70 border-x border-neutral-200">
                Growth
                <span className="block text-[11px] text-neutral-500 font-normal lowercase mt-0.5">₹5,999/mo</span>
              </th>
              <th className="py-4 px-4 text-center text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono w-[20%]">
                Enterprise
                <span className="block text-[11px] text-neutral-500 font-normal lowercase mt-0.5">₹11,999/mo</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
            {COMPARISON_CATEGORIES.map((category) => (
              <Fragment key={category.category}>
                {/* Category Header Row */}
                <tr className="bg-neutral-50/50 border-t-2 border-neutral-200/80">
                  <td
                    colSpan={4}
                    className="py-2.5 px-6 text-[11px] font-bold uppercase tracking-wider text-neutral-900 font-mono"
                  >
                    {category.category}
                  </td>
                </tr>

                {/* Individual Feature Rows */}
                {category.rows.map((row) => (
                  <tr
                    key={row.name}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-medium text-neutral-900">
                      {row.name}
                    </td>
                    <td className="py-3.5 px-4 text-center align-middle">
                      <RenderValue value={row.starter} />
                    </td>
                    <td className="py-3.5 px-4 text-center align-middle bg-neutral-50/30 border-x border-neutral-100">
                      <RenderValue value={row.growth} />
                    </td>
                    <td className="py-3.5 px-4 text-center align-middle">
                      <RenderValue value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
