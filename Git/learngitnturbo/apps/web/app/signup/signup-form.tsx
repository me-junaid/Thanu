'use client';

import { useActionState, useState, useEffect } from 'react';
import Link from 'next/link';
import { signUpAction, type SignUpActionState } from './actions';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Check } from 'lucide-react';

const initialState: SignUpActionState = {
  success: false,
};

export function SignUpForm({
  defaultEmail = '',
  inviteToken = '',
}: {
  defaultEmail?: string;
  inviteToken?: string;
} = {}) {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preserve email if server action returns an error
  useEffect(() => {
    if (state.submittedEmail && !state.success) {
      setEmail(state.submittedEmail);
    }
  }, [state.submittedEmail, state.success]);

  // Update email if defaultEmail changes
  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  // Live password validation criteria
  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Verification email sent
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-neutral-600">
          We sent a verification link to{' '}
          <span className="font-semibold text-neutral-900">{state.email}</span>.
          Please click the link to confirm your account and get started.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={
              inviteToken
                ? `/login?invite=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(state.email || email)}`
                : `/login${state.email ? `?email=${encodeURIComponent(state.email)}` : ''}`
            }
            className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            Go to Sign In
          </Link>
          <p className="text-[11px] text-neutral-400">
            Did not receive the email? Check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-3.5">
      {state.message && !state.success && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* Hidden optional full name fallback */}
      <input type="hidden" name="fullName" value="User" />
      {inviteToken && <input type="hidden" name="invite" value={inviteToken} />}

      {/* Email input - state-controlled so value is never lost on error */}
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-neutral-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mia@untitledui.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
          className="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-xs transition hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password input */}
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-neutral-700">
          Password
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby="password-rules"
            className="block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-xs transition hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Live requirement badges */}
        <div id="password-rules" className="mt-2 space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] transition-colors ${
                hasMinLength
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </span>
            <span className={hasMinLength ? 'text-neutral-800' : 'text-neutral-500'}>
              Must be at least 8 characters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] transition-colors ${
                hasSpecialChar
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </span>
            <span className={hasSpecialChar ? 'text-neutral-800' : 'text-neutral-500'}>
              Must contain one special character
            </span>
          </div>
        </div>

        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {/* Confirm Password input */}
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-medium text-neutral-700">
          Confirm Password
        </label>
        <div className="relative mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            aria-describedby={state.fieldErrors?.confirmPassword ? 'confirm-error' : undefined}
            className="block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-xs transition hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Live match indicator feedback */}
        {confirmPassword.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] transition-colors ${
                passwordsMatch
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </span>
            <span className={passwordsMatch ? 'text-emerald-700 font-medium' : 'text-neutral-500'}>
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match yet'}
            </span>
          </div>
        )}

        {state.fieldErrors?.confirmPassword && (
          <p id="confirm-error" className="mt-1 text-xs text-red-600">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-neutral-900 py-2.5 px-4 text-sm font-medium text-white shadow-xs transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2.5 text-neutral-400">or</span>
        </div>
      </div>

      {/* Social login buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          aria-label="Sign up with Google"
          className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.42 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.58 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Sign up with Apple"
          className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <svg className="h-4 w-4 fill-current text-neutral-900" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.87-1 2.99 1.07.08 2.16-.54 2.81-1.33z" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Sign up with X"
          className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <svg className="h-3.5 w-3.5 fill-current text-neutral-900" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>
      </div>

      <div className="pt-2 text-center">
        <p className="text-xs text-neutral-500">
          Already have an account?{' '}
          <Link
            href={
              inviteToken
                ? `/login?invite=${encodeURIComponent(inviteToken)}${email ? `&email=${encodeURIComponent(email)}` : ''}`
                : '/login'
            }
            className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
