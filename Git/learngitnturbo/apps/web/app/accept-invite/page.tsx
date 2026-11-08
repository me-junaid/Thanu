import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@repo/supabase/server";
import { validateAndGetInviteDetailsAction } from "./actions";
import { AcceptInviteCard } from "./accept-invite-card";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Accept Showroom Invitation | Orgetise",
  description: "Join your authorized dealership team on Orgetise Dealership OS.",
};

interface AcceptInvitePageProps {
  searchParams: Promise<{
    token?: string;
    code?: string;
  }>;
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const { token, code } = await searchParams;

  // If redirected with auth code (e.g. from email verification), exchange for session
  if (code) {
    try {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // Non-blocking fallback
    }
  }

  // If no token query parameter is present in URL
  if (!token || typeof token !== "string" || !token.trim()) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 flex flex-col justify-between p-6 sm:p-10">
        <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2 text-neutral-900">
            <span className="font-mono text-xl font-black tracking-tighter">///</span>
            <span className="text-base font-bold tracking-tight">Orgetise</span>
          </Link>
        </header>

        <main className="flex items-center justify-center py-12">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-neutral-900/5 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
              <ShieldAlert className="h-7 w-7" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl">
              Missing Invitation Token
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              No invitation token was provided in the link. Please open the complete link sent to your email by your dealership manager.
            </p>

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-95"
              >
                <span>Go to Sign In</span>
              </Link>
            </div>
          </div>
        </main>

        <footer className="text-center text-[11px] text-neutral-400">
          Orgetise · Commercial Multi-Tenant Dealership SaaS
        </footer>
      </div>
    );
  }

  // Inspect and validate invite token
  const validation = await validateAndGetInviteDetailsAction(token);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 flex flex-col justify-between p-6 sm:p-10">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-neutral-900">
          <span className="font-mono text-xl font-black tracking-tighter">///</span>
          <span className="text-base font-bold tracking-tight">Orgetise</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Interactive Invitation Card */}
      <main className="flex items-center justify-center py-10 sm:py-14">
        <AcceptInviteCard token={token} initialValidation={validation} />
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-neutral-400">
        © {new Date().getFullYear()} Orgetise Technologies Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
}

