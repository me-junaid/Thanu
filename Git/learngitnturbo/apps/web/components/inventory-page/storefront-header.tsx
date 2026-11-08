import Link from "next/link";
import {
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  Palette,
} from "lucide-react";

export function StorefrontHeader() {
  return (
    <div className="space-y-6">
      {/* ─── EXAMPLE / CUSTOMIZATION ADVISORY BANNER ─── */}
      <div className="rounded-2xl border border-yellow-200  p-4 sm:p-4.5 shadow-2xs backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-2xs">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-950">
                  Interactive Showroom Preview
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200/80 font-mono">
                  Example Demo
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 font-light mt-0.5">
                This is an example showcase. Your digital car showroom can be fully customized with your dealership name, custom domain, vehicle inventory, logo, and brand colors.
              </p>
            </div>
          </div>

          <Link
            href="/signup"
            className="group shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98 w-full sm:w-auto"
          >
            <Palette className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition" />
            <span>Customize Your Showroom</span>
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* ─── SHOWROOM DETAILS CARD ─── */}
      <div className="rounded-3xl p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
          {/* Dealership Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase text-white font-mono">
                Sample Showroom
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                100% Brand Customizable
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-neutral-950 tracking-tight">
              Apex Motors
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 font-light flex items-center gap-1.5 pt-0.5">
              <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span>#42, 100ft Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034</span>
            </p>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <a
              href="https://maps.google.com/?q=Koramangala+Bengaluru"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition active:scale-98"
            >
              <MapPin className="h-3.5 w-3.5 text-neutral-500" />
              <span>Showroom Directions</span>
            </a>

            <a
              href="tel:+917736850015"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition active:scale-98"
            >
              <Phone className="h-3.5 w-3.5 text-neutral-500" />
              <span>+91 77368 50015</span>
            </a>

            <a
              href="https://wa.me/917736850015?text=Hi%20Apex%20Motors,%20I%20am%20browsing%20your%20certified%20inventory%20and%20would%20like%20assistance."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition active:scale-98"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 3 Trust Badges Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="flex items-center gap-3 rounded-2xl bg-neutral-50/70 p-3.5 border border-neutral-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">150+ Point Inspection</p>
              <p className="text-[11px] text-neutral-500 font-light">Mechanical, bodywork & ECU certified</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-neutral-50/70 p-3.5 border border-neutral-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">Clear Title & RC Verified</p>
              <p className="text-[11px] text-neutral-500 font-light">Complete insurance & service history</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-neutral-50/70 p-3.5 border border-neutral-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs text-amber-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">7-Day Guarantee</p>
              <p className="text-[11px] text-neutral-500 font-light">Hassle-free exchange & warranty cover</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
