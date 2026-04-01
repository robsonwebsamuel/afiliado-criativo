CREATE TABLE IF NOT EXISTS public.short_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  original_url text NOT NULL,
  clicks integer DEFAULT 0,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own links" ON public.short_links
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" ON public.short_links
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON public.short_links
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);