"use client";

import { useState, useMemo } from "react";
import { Calculator, IndianRupee, ArrowRight, ShieldCheck, Sparkles, MessageCircle } from "lucide-react";

export function FinancingCalculator() {
  // Sliders state
  const [vehiclePrice, setVehiclePrice] = useState<number>(18500000); // Default ₹1.85 Cr
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // Default 20%
  const [tenureYears, setTenureYears] = useState<number>(5); // Default 5 years (60 months)
  const annualInterestRate = 8.75; // Typical luxury pre-owned auto loan in India (8.5% - 9%)

  // Calculation
  const downPaymentAmount = useMemo(() => {
    return Math.round((vehiclePrice * downPaymentPercent) / 100);
  }, [vehiclePrice, downPaymentPercent]);

  const loanPrincipal = useMemo(() => {
    return vehiclePrice - downPaymentAmount;
  }, [vehiclePrice, downPaymentAmount]);

  // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyEmi = useMemo(() => {
    const monthlyRate = annualInterestRate / 12 / 100;
    const months = tenureYears * 12;
    const emi =
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  }, [loanPrincipal, annualInterestRate, tenureYears]);

  const totalPayable = useMemo(() => {
    return monthlyEmi * tenureYears * 12;
  }, [monthlyEmi, tenureYears]);

  const totalInterest = useMemo(() => {
    return totalPayable - loanPrincipal;
  }, [totalPayable, loanPrincipal]);

  return (
    <section className="mt-20 rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-8 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs font-mono">
            <Calculator className="h-3.5 w-3.5 text-neutral-900" />
            <span>Showroom Finance Desk</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-neutral-950 font-normal tracking-tight">
            Estimate your monthly luxury car EMI
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-xl font-light">
            We partner with leading private banks (HDFC, ICICI, Axis) to offer pre-approved auto financing with competitive 8.75% interest rates and flexible loan tenures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Fast 24-Hr Loan Sanction
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Sliders Input Area */}
        <div className="lg:col-span-7 space-y-7">
          {/* Slider 1: Vehicle Price */}
          <div className="rounded-2xl bg-neutral-50/70 p-5 border border-neutral-100">
            <div className="flex items-center justify-between">
              <label
                htmlFor="vehicle-price"
                className="text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono"
              >
                Vehicle Price
              </label>
              <span className="font-serif text-2xl font-bold text-neutral-950">
                ₹{(vehiclePrice / 100000).toFixed(0)} Lakhs
              </span>
            </div>
            <input
              id="vehicle-price"
              type="range"
              min="5000000"
              max="30000000"
              step="500000"
              value={vehiclePrice}
              onChange={(e) => setVehiclePrice(Number(e.target.value))}
              className="mt-4 w-full accent-neutral-950 cursor-pointer h-2 bg-neutral-200 rounded-lg"
            />
            <div className="mt-2 flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>₹50 Lakhs</span>
              <span>₹1.75 Cr</span>
              <span>₹3.0 Crore</span>
            </div>
          </div>

          {/* Slider 2: Down Payment Percentage */}
          <div className="rounded-2xl bg-neutral-50/70 p-5 border border-neutral-100">
            <div className="flex items-center justify-between">
              <label
                htmlFor="down-payment"
                className="text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono"
              >
                Down Payment ({downPaymentPercent}%)
              </label>
              <span className="font-serif text-2xl font-bold text-neutral-950">
                ₹{(downPaymentAmount / 100000).toFixed(1)} Lakhs
              </span>
            </div>
            <input
              id="down-payment"
              type="range"
              min="10"
              max="60"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="mt-4 w-full accent-neutral-950 cursor-pointer h-2 bg-neutral-200 rounded-lg"
            />
            <div className="mt-2 flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>10% (Min)</span>
              <span>30%</span>
              <span>60% (Max)</span>
            </div>
          </div>

          {/* Tenure Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono block">
              Loan Tenure Period
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[3, 4, 5, 7].map((years) => (
                <button
                  key={years}
                  type="button"
                  onClick={() => setTenureYears(years)}
                  className={`rounded-xl py-2.5 px-3 text-xs font-semibold transition cursor-pointer ${
                    tenureYears === years
                      ? "bg-neutral-950 text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {years} Years
                  <span className="block text-[10px] font-normal opacity-70">
                    {years * 12} mo
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-neutral-900 text-white p-7 sm:p-9 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Estimated Monthly Installment
            </span>

            {/* Huge EMI display */}
            <div className="mt-3 pb-6 border-b border-white/10">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-emerald-400">₹</span>
                <span className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-white">
                  {monthlyEmi.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-neutral-400 ml-1">/month</span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-300 font-light">
                Computed @ {annualInterestRate}% p.a. reducing balance
              </p>
            </div>

            {/* Loan Details Breakdown */}
            <div className="mt-6 space-y-3 text-xs">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Principal Loan Amount:</span>
                <span className="font-semibold text-white">
                  ₹{(loanPrincipal / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Down Payment Required:</span>
                <span className="font-semibold text-white">
                  ₹{(downPaymentAmount / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Total Interest Cost:</span>
                <span className="font-semibold text-emerald-400">
                  ₹{(totalInterest / 100000).toFixed(1)} Lakhs
                </span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-4">
              <a
                href={`https://wa.me/917736850015?text=Hi%20Apex%20Motors,%20I%20would%20like%20to%20apply%20for%20pre-approved%20auto%20loan%20for%20a%20car%20budget%20of%20₹${(vehiclePrice / 100000).toFixed(0)}%20Lakhs%20with%20monthly%20EMI%20around%20₹${monthlyEmi.toLocaleString("en-IN")}.`}
                target="_blank"
                rel="noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 px-4 text-xs font-semibold text-neutral-950 shadow-md hover:bg-neutral-100 transition active:scale-98"
              >
                <span>Get Pre-Approved Loan</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </a>
              <p className="mt-2 text-center text-[10px] text-neutral-400">
                Zero processing charge • Instant doorstep verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

