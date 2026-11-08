import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@repo/supabase/server';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SignUpForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Start your 14-day free trial | Orgetise',
  description: 'Create your dealership account. No credit card required.',
};

interface SignUpPageProps {
  searchParams?: Promise<{
    email?: string;
    invite?: string;
    token?: string;
  }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const defaultEmail = resolvedParams.email || '';
  const inviteToken = resolvedParams.invite || resolvedParams.token || '';

  // If user is already authenticated, redirect them appropriately
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (inviteToken) {
      redirect(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()
      .returns<{ onboarding_completed: boolean } | null>();

    if (profile?.onboarding_completed || user.user_metadata?.onboarding_completed) {
      redirect('/dashboard');
    } else {
      redirect('/onboarding');
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white text-neutral-900 lg:flex-row">
      {/* Left Column: Form & Brand */}
      <div className="flex min-h-screen w-full flex-col justify-between px-6 py-8 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Brand header - centered on mobile, left on desktop */}
        <div className="flex items-center justify-center lg:justify-start">
          <Link href="/" className="flex items-center gap-2 text-neutral-900">
            <span className="font-mono text-xl font-black tracking-tighter">///</span>
            <span className="text-base font-bold tracking-tight">Orgetise</span>
          </Link>
        </div>

        {/* Center: Auth Card */}
        <div className="mx-auto my-auto w-full max-w-sm py-6 sm:py-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Start your 14-day free trial
            </h1>
            <p className="mt-1.5 text-xs text-neutral-500">
              No credit card required. Cancel anytime.
            </p>
          </div>

          <SignUpForm defaultEmail={defaultEmail} inviteToken={inviteToken} />
        </div>

        {/* Footer legal - centered on mobile, left on desktop */}
        <div className="text-center pb-2 pt-4 lg:text-left lg:py-0">
          <p className="text-[11px] text-neutral-400">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-neutral-600">
              terms of use
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right Column: Hero Visual with Car Imagery & Testimonial Card */}
      <div className="relative hidden w-1/2 p-4 lg:block">
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-neutral-900 shadow-inner">
          {/* Back button circle at top-left cutout */}
          <Link
            href="/"
            aria-label="Go back to home"
            className="absolute left-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-md backdrop-blur-md transition hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Premium Automotive Photography */}
          <Image
            src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80"
            alt="Luxury sports car"
            fill
            priority
            sizes="50vw"
            className="object-cover object-center"
          />

          {/* Subtle contrast gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />

          {/* Floating Testimonial Frosted Card */}
          <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between gap-4">
            <div className="max-w-lg rounded-2xl bg-black/40 p-6 text-white shadow-xl backdrop-blur-xl border border-white/10">
              <p className="text-sm font-medium leading-relaxed text-neutral-100">
                &ldquo;Managing our luxury fleet and real-time inventory has never been smoother.
                Performance and reliability at its finest.&rdquo;
              </p>
              <div className="mt-4">
                <p className="text-xs font-semibold text-white">Marcus Vance</p>
                <p className="text-[11px] text-neutral-300">Fleet Operations | Apex Motors</p>
              </div>
            </div>

            {/* Slider Navigation Arrows */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                aria-label="Next testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Previous testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
