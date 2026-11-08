import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Topography from "../ui/topography";

interface SiteFooterProps {
  showCta?: boolean;
  className?: string;
}

export function SiteFooter({ showCta = true, className = "mt-32" }: SiteFooterProps = {}) {
  return (
    <footer className={`${className} border-t border-neutral-200/80 bg-white pt-16 pb-14 text-neutral-900`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Top CTA Banner */}
        {showCta && (
          <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 p-8 sm:p-14 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 mb-16 shadow-xl">
            <Topography
              color="#112104"
              lineCount={22}
              lineWidth={1.2}
              elevation={1}
              foreground={0.2}
              tilt={32}
              speed={0.25}
              direction="forward"
              glow={0.6}
              depthOfField={0.4}
              fog={0.35}
              hoverEffect="lift"
              clickEffect="pulse"
              className="absolute inset-0 opacity-80"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />

            <div className="relative z-10 space-y-2 max-w-xl pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                14-Day Full Access Trial
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white">
                Ready to launch your dealership storefront?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light">
                Join leading independent pre-owned dealerships operating on our multi-tenant platform.
              </p>
            </div>

            <Link
              href="/signup"
              className="relative z-10 shrink-0 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-xs font-semibold text-neutral-950 shadow-md transition hover:bg-neutral-100 hover:shadow-lg active:scale-98 cursor-pointer"
            >
              <span>Create your dealership</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-neutral-100">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-15 items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Orgetise"
                  width={28}
                  height={28}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </div>
              <span className=" font-bold tracking-tight text-neutral-950 font-mono text-2xl"><span className="font-sans">o</span>Dealer</span>
            </div>
            <p className="text-xs text-neutral-500 font-light max-w-sm leading-relaxed">
              The end-to-end dealership operating system. Powering vehicle inventory, customer pipelines, test-drive scheduling, and financial deal clearance on your own branded domain.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
              Product
            </p>
            <ul className="mt-3 space-y-4 text-xs text-neutral-600">
              <li>
                <Link href="#inventory" className="hover:text-neutral-950 transition">
                  Inventory Showcase
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-neutral-950 transition">
                  Admin Workspace
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-neutral-950 transition">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-neutral-950 transition">
                  Custom Domain Setup
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
              Trust & Security
            </p>
            <ul className="mt-3 space-y-4 text-xs text-neutral-600">
              <li>
                <Link href="/about" className="hover:text-neutral-950 transition">
                  Private Dealership Database
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-neutral-950 transition">
                  High-Speed Cloud Edge
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-neutral-950 transition">
                  Zero Commission Guarantee
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-neutral-950 transition">
                  Staff Role Permissions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
              Account
            </p>
            <ul className="mt-3 space-y-4 text-xs text-neutral-600">
              <li>
                <Link href="/login" className="hover:text-neutral-950 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-neutral-950 transition">
                  Create Dealership
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-neutral-950 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-neutral-950 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} Orgetise Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-neutral-600">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-neutral-600">
              Terms
            </Link>
            <Link href="#faq" className="hover:text-neutral-600">
              Support FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

