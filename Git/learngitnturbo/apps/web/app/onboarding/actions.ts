'use server';

import { createClient } from '@repo/supabase/server';
import { redirect } from 'next/navigation';
import type { OnboardingData } from '../../components/onboarding/types';

export async function completeOnboardingAction(data: OnboardingData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Safety guard: If user has a pending showroom invitation, do not allow them to create a separate dealership!
  if (user.email) {
    try {
      const { data: pendingInvite } = await (supabase.from('staff_invites') as any)
        .select('token')
        .ilike('email', user.email.toLowerCase().trim())
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pendingInvite?.token) {
        return {
          success: false,
          redirectTo: `/accept-invite?token=${encodeURIComponent(pendingInvite.token)}`,
        };
      }
    } catch {
      // Non-blocking fallback
    }
  }

  // 1. Basic validation
  if (!data.dealershipName.trim() || !data.slug.trim()) {
    throw new Error('Dealership name and subdomain slug are required.');
  }

  if (!data.address.trim() || !data.city.trim()) {
    throw new Error('Showroom address and city are required.');
  }

  // 2. Insert or update the Dealership row (Option A architecture)
  const dealershipSlug = data.slug.trim().toLowerCase();

  // Check if slug is already taken by another dealership
  const { data: existingDealership } = await (supabase.from('dealerships') as any)
    .select('id')
    .eq('slug', dealershipSlug)
    .maybeSingle();

  let dealershipId: string | undefined = existingDealership?.id;

  if (!dealershipId) {
    const { data: newDealership, error: dealershipError } = await (supabase
      .from('dealerships') as any)
      .insert({
        name: data.dealershipName.trim(),
        slug: dealershipSlug,
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim() || null,
      })
      .select('id')
      .single();

    if (dealershipError || !newDealership) {
      console.error('Error creating dealership:', dealershipError);
      throw new Error(
        dealershipError?.message || 'Failed to create dealership showroom record.'
      );
    }

    dealershipId = newDealership.id;
  } else {
    // If user is completing or updating their dealership
    await (supabase.from('dealerships') as any)
      .update({
        name: data.dealershipName.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealershipId);
  }

  // 3. Link profile to dealership and mark onboarding completed
  const { error: profileError } = await (supabase.from('profiles') as any)
    .upsert({
      id: user.id,
      dealership_id: dealershipId,
      full_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Showroom Manager',
      role: 'owner',
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('Error updating user profile:', profileError);
    throw new Error('Failed to update user profile with dealership details.');
  }

  // Keep a lightweight completion flag in user_metadata for fast sync if needed
  try {
    await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        dealership_id: dealershipId,
        dealership_name: data.dealershipName.trim(),
      },
    });
  } catch {
    // non-blocking
  }

  // 4. Return success result with redirect URL
  return { success: true, redirectTo: '/dashboard?onboarding=complete' };
}

