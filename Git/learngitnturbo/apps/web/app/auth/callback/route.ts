import { NextResponse } from 'next/server';
import { createClient } from '@repo/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // If "next" param is present, redirect to that route, otherwise default to home
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      // Check database profiles table for onboarding status
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()
        .returns<{ onboarding_completed: boolean } | null>();

      const isOnboarded =
        profile?.onboarding_completed ||
        data.user?.user_metadata?.onboarding_completed;

      // Route to invite acceptance if following an invite link, otherwise check if invited or onboarded
      const isAcceptingInvite = next.startsWith('/accept-invite');
      let destination = next;

      if (!isAcceptingInvite && !isOnboarded) {
        const userEmail = data.user?.email?.toLowerCase().trim();
        let pendingInviteToken: string | null = null;

        if (userEmail) {
          try {
            const { data: pendingInvite } = await (supabase.from('staff_invites') as any)
              .select('token')
              .ilike('email', userEmail)
              .eq('status', 'pending')
              .gt('expires_at', new Date().toISOString())
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (pendingInvite?.token) {
              pendingInviteToken = pendingInvite.token;
            }
          } catch {
            // fallback
          }
        }

        destination = pendingInviteToken
          ? `/accept-invite?token=${encodeURIComponent(pendingInviteToken)}`
          : '/onboarding';
      } else if (isOnboarded && next === '/') {
        destination = '/dashboard';
      }

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${destination}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${destination}`);
      } else {
        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

