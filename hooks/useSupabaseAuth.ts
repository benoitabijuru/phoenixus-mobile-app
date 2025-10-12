import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseAuth() {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setupAuth = async () => {
      if (!userId) {
        setIsReady(false);
        return;
      }

      try {
        const token = await getToken({ template: 'supabase' });
        
        if (token) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: 'placeholder',
          });

          await syncUser();
          setIsReady(true);
        }
      } catch (error) {
        console.error('Auth setup error:', error);
        setIsReady(false);
      }
    };

    setupAuth();

    const interval = setInterval(async () => {
      if (userId) {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: 'placeholder',
          });
        }
      }
    }, 50000);

    return () => clearInterval(interval);
  }, [userId, getToken]);

  const syncUser = async () => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('users')
        .select('clerk_id')
        .eq('clerk_id', user.id)
        .single();

      if (!existing) {
        await supabase.from('users').insert({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          first_name: user.firstName,
          last_name: user.lastName,
        });
      }
    } catch (error) {
      console.error('User sync error:', error);
    }
  };

  return { isReady, userId };
}