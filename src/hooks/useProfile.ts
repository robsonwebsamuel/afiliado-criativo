import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PlanType } from '@/lib/mock-data';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  plan: PlanType;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, plan')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setProfile(data ? { ...data, plan: (data.plan as PlanType) || 'free' } : null);
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
}
