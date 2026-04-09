-- Fix 1: Restrict profiles SELECT to owner only (was USING(true))
DROP POLICY "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix 2: Add DELETE policy for short_links so users can manage their own links
CREATE POLICY "Users can delete own links"
  ON public.short_links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);