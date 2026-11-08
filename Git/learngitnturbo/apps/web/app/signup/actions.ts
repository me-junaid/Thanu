'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@repo/supabase/server';
import { signUpSchema } from '../../lib/schemas/auth';

export type SignUpActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  email?: string;
  submittedEmail?: string;
};

export async function signUpAction(
  _prevState: SignUpActionState,
  formData: FormData
): Promise<SignUpActionState> {
  const emailRaw = (formData.get('email') as string) || '';
  const fullNameRaw = (formData.get('fullName') as string) || 'User';
  const passwordRaw = (formData.get('password') as string) || '';
  const confirmPasswordRaw = (formData.get('confirmPassword') as string) || '';

  const rawData = {
    email: emailRaw,
    fullName: fullNameRaw,
    password: passwordRaw,
    confirmPassword: confirmPasswordRaw,
  };

  const validation = signUpSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    // Extract the most relevant specific error message
    const firstErrorMessage =
      fieldErrors.email?.[0] ||
      fieldErrors.password?.[0] ||
      fieldErrors.confirmPassword?.[0] ||
      'Please check the form fields and try again.';

    return {
      success: false,
      message: firstErrorMessage,
      fieldErrors,
      submittedEmail: emailRaw,
    };
  }

  const { email, password, fullName } = validation.data;
  const inviteToken = ((formData.get('invite') as string) || (formData.get('token') as string) || '').trim();
  let immediateRedirectTo: string | null = null;

  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin =
      headersList.get('origin') ||
      headersList.get('x-forwarded-host') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3001';

    const cleanOrigin = origin.startsWith('http') ? origin : `https://${origin}`;
    
    // CRITICAL: email confirmation links must exchange code via /auth/callback
    const emailRedirectTo = inviteToken
      ? `${cleanOrigin}/auth/callback?next=${encodeURIComponent(`/accept-invite?token=${inviteToken}`)}`
      : `${cleanOrigin}/auth/callback?next=/onboarding`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo,
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return {
          success: false,
          message: 'An account with this email address already exists. Try signing in.',
          submittedEmail: email,
        };
      }
      if (error.message.toLowerCase().includes('rate limit')) {
        return {
          success: false,
          message: 'Too many attempts. Please wait a moment and try again.',
          submittedEmail: email,
        };
      }
      return {
        success: false,
        message: error.message,
        submittedEmail: email,
      };
    }

    // If session was immediately created (e.g. email confirmation disabled or auto-confirmed)
    if (data.session) {
      immediateRedirectTo = inviteToken
        ? `/accept-invite?token=${encodeURIComponent(inviteToken)}`
        : '/onboarding';
    } else {
      return {
        success: true,
        email: data.user?.email ?? email,
        message: 'Please check your email to confirm your account.',
      };
    }
  } catch (err: unknown) {
    console.error('Sign-up error:', err);
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
      submittedEmail: emailRaw,
    };
  }

  // Next.js redirect() must be called outside try/catch
  if (immediateRedirectTo) {
    redirect(immediateRedirectTo);
  }

  return {
    success: true,
    email,
    message: 'Account created successfully!',
  };
}
