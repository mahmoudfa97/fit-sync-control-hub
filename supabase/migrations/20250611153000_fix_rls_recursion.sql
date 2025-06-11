
-- Fix infinite recursion in organization_users RLS policies

-- First, drop any existing problematic policies
DROP POLICY IF EXISTS "Users can access their own organization data" ON organization_users;
DROP POLICY IF EXISTS "Users can view organization users" ON organization_users;
DROP POLICY IF EXISTS "organization_users_policy" ON organization_users;

-- Create a security definer function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM public.organization_users 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Create a security definer function to check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_users 
    WHERE user_id = auth.uid() 
    AND organization_id = org_id
  );
$$;

-- Enable RLS on organization_users if not already enabled
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for organization_users
CREATE POLICY "Users can view their own organization memberships"
ON public.organization_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own organization memberships"
ON public.organization_users
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own organization memberships"
ON public.organization_users
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update other tables to use the security definer functions instead of direct queries

-- Custom members policies
DROP POLICY IF EXISTS "Users can access their organization members" ON custom_members;
CREATE POLICY "Users can access their organization members"
ON public.custom_members
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Custom memberships policies
DROP POLICY IF EXISTS "Users can access their organization memberships" ON custom_memberships;
CREATE POLICY "Users can access their organization memberships"
ON public.custom_memberships
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Custom checkins policies
DROP POLICY IF EXISTS "Users can access their organization checkins" ON custom_checkins;
CREATE POLICY "Users can access their organization checkins"
ON public.custom_checkins
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Payments policies
DROP POLICY IF EXISTS "Users can access their organization payments" ON payments;
CREATE POLICY "Users can access their organization payments"
ON public.payments
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Settings policies
DROP POLICY IF EXISTS "Users can access their organization settings" ON settings;
CREATE POLICY "Users can access their organization settings"
ON public.settings
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Messages policies
DROP POLICY IF EXISTS "Users can access their organization messages" ON messages;
CREATE POLICY "Users can access their organization messages"
ON public.messages
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Classes policies
DROP POLICY IF EXISTS "Users can access their organization classes" ON classes;
CREATE POLICY "Users can access their organization classes"
ON public.classes
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Staff policies
DROP POLICY IF EXISTS "Users can access their organization staff" ON staff;
CREATE POLICY "Users can access their organization staff"
ON public.staff
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Group subscriptions policies
DROP POLICY IF EXISTS "Users can access their organization group subscriptions" ON group_subscriptions;
CREATE POLICY "Users can access their organization group subscriptions"
ON public.group_subscriptions
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Member files policies
DROP POLICY IF EXISTS "Users can access their organization member files" ON member_files;
CREATE POLICY "Users can access their organization member files"
ON public.member_files
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Member tasks policies
DROP POLICY IF EXISTS "Users can access their organization member tasks" ON member_tasks;
CREATE POLICY "Users can access their organization member tasks"
ON public.member_tasks
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Member programs policies
DROP POLICY IF EXISTS "Users can access their organization member programs" ON member_programs;
CREATE POLICY "Users can access their organization member programs"
ON public.member_programs
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Program exercises policies
DROP POLICY IF EXISTS "Users can access their organization program exercises" ON program_exercises;
CREATE POLICY "Users can access their organization program exercises"
ON public.program_exercises
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Program progress policies
DROP POLICY IF EXISTS "Users can access their organization program progress" ON program_progress;
CREATE POLICY "Users can access their organization program progress"
ON public.program_progress
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Tracking programs policies
DROP POLICY IF EXISTS "Users can access their organization tracking programs" ON tracking_programs;
CREATE POLICY "Users can access their organization tracking programs"
ON public.tracking_programs
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Tracking entries policies
DROP POLICY IF EXISTS "Users can access their organization tracking entries" ON tracking_entries;
CREATE POLICY "Users can access their organization tracking entries"
ON public.tracking_entries
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Access cards policies
DROP POLICY IF EXISTS "Users can access their organization access cards" ON access_cards;
CREATE POLICY "Users can access their organization access cards"
ON public.access_cards
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Custom member insurance policies
DROP POLICY IF EXISTS "Users can access their organization member insurance" ON custom_member_insurance;
CREATE POLICY "Users can access their organization member insurance"
ON public.custom_member_insurance
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Class registrations policies
DROP POLICY IF EXISTS "Users can access their organization class registrations" ON class_registrations;
CREATE POLICY "Users can access their organization class registrations"
ON public.class_registrations
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.classes 
  WHERE id = class_registrations.class_id 
  AND organization_id = public.get_user_organization_id()
));

-- Class attendance policies
DROP POLICY IF EXISTS "Users can access their organization class attendance" ON class_attendance;
CREATE POLICY "Users can access their organization class attendance"
ON public.class_attendance
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.classes 
  WHERE id = class_attendance.class_id 
  AND organization_id = public.get_user_organization_id()
));

-- Hyp payments policies
DROP POLICY IF EXISTS "Users can access their organization hyp payments" ON hyp_payments;
CREATE POLICY "Users can access their organization hyp payments"
ON public.hyp_payments
FOR ALL
TO authenticated
USING (organization_id = public.get_user_organization_id());
