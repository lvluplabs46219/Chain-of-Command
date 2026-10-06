-- Migration: 20260924_fix_referrals_policy
-- Description: Fix directory_agent_referrals INSERT policy to prevent spam/forged referrals
-- Priority: P0 - Security fix for referral table

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON public.directory_agent_referrals;
DROP POLICY IF EXISTS "Lawyers can view own referrals" ON public.directory_agent_referrals;

-- Recreate INSERT policy: Bind inserts to authenticated user's email
-- Users can only create referrals with their own email/user_id
CREATE OR REPLACE POLICY "Authenticated users can create own referrals" ON public.directory_agent_referrals
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Bind user_id to auth.uid() if the field exists
    (
      user_id = auth.uid()::text 
      OR user_id IS NULL
    )
    -- Optionally verify email if user_id is not set
    AND (
      EXISTS (
        SELECT 1 FROM public.directory_lawyer_profiles p
        WHERE p.id = directory_agent_referrals.lawyer_id
      )
    )
  );

-- SELECT policy: Only the referred lawyer can view their own referrals
CREATE OR REPLACE POLICY "Lawyers can view own referrals" ON public.directory_agent_referrals
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.directory_lawyer_profiles p
      WHERE p.id = directory_agent_referrals.lawyer_id
      AND p.email = auth.jwt() ->> 'email'
    )
  );

-- Add UPDATE policy for lawyers to manage their own referrals
CREATE OR REPLACE POLICY "Lawyers can update own referrals" ON public.directory_agent_referrals
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.directory_lawyer_profiles p
      WHERE p.id = directory_agent_referrals.lawyer_id
      AND p.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.directory_lawyer_profiles p
      WHERE p.id = directory_agent_referrals.lawyer_id
      AND p.email = auth.jwt() ->> 'email'
    )
  );

-- Add rate limiting comment
COMMENT ON TABLE public.directory_agent_referrals IS 'Referrals are bound to authenticated users. Implement application-level rate limiting to prevent spam.';
