'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@repo/supabase/server';
import { signInSchema } from '../../lib/schemas/auth';

export type SignInActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function signInAction(
  _prevState: SignInActionState,
  formData: FormData
): Promise<SignInActionState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validation = signInSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      message: 'Please fill in all required fields.',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validation.data;
  const inviteToken = ((formData.get('invite') as string) || (formData.get('token') as string) || '').trim();

  // Determine redirect destination outside try/catch — Next.js redirect() throws
  // a special internal error; catching it would surface it as a login error.
  let redirectTo = inviteToken
    ? `/accept-invite?token=${encodeURIComponent(inviteToken)}`
    : '/dashboard';

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        return {
          success: false,
          message: 'Invalid email or password. Please try again.',
        };
      }
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          message: 'Please verify your email address before signing in.',
        };
      }
      return {
        success: false,
        message: error.message,
      };
    }

    // Check profiles table first (Option A source of truth)
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .maybeSingle()
      .returns<{ onboarding_completed: boolean } | null>();

    const onboardingCompleted =
      profile?.onboarding_completed ||
      data.user?.user_metadata?.onboarding_completed;

    if (!inviteToken && !onboardingCompleted) {
      // Check if user has an active pending staff invitation before sending to onboarding
      const userEmail = data.user.email?.toLowerCase().trim();
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
          // Fallback if table query restricted
        }
      }

      if (pendingInviteToken) {
        redirectTo = `/accept-invite?token=${encodeURIComponent(pendingInviteToken)}`;
      } else {
        redirectTo = '/onboarding';
      }
    }
  } catch (err: unknown) {
    console.error('Sign-in error:', err);
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (err instanceof Error) {
      if (err.message.toLowerCase().includes('fetch failed')) {
        errorMessage =
          'Unable to reach the authentication service. The database may be waking up, or please check your internet connection.';
      } else {
        errorMessage = err.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }

  // redirect() must be called outside try/catch
  redirect(redirectTo);
}

