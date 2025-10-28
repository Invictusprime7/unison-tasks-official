import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export interface AuthActions {
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
}

export const useAuth = (): AuthState & AuthActions => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Failed to get initial session:', error);
          if (isMounted) {
            setAuthState(prev => ({ ...prev, loading: false, initialized: true }));
          }
          return;
        }

        if (isMounted) {
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
            initialized: true,
          });
        }

        console.log('✅ Auth initialized:', { 
          hasSession: !!session, 
          userId: session?.user?.id 
        });
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (isMounted) {
          setAuthState(prev => ({ ...prev, loading: false, initialized: true }));
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Auth state changed:', event, session?.user?.email);

      if (isMounted) {
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true,
        }));
      }

      // Handle profile creation for new users
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || '',
              avatar_url: session.user.user_metadata?.avatar_url || null,
            }, {
              onConflict: 'id',
              ignoreDuplicates: true
            });

          if (profileError) {
            console.error('❌ Failed to create/update profile:', profileError);
          } else {
            console.log('✅ Profile created/updated successfully');
          }
        } catch (error) {
          console.error('❌ Profile creation error:', error);
        }
      }
    });

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { error, data } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
          },
        },
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        return { error };
      }

      console.log('✅ Sign up successful:', { 
        userId: data.user?.id,
        needsConfirmation: !data.session && data.user && !data.user.email_confirmed_at
      });

      return { error: null };
    } catch (error) {
      console.error('❌ Sign up exception:', error);
      return { error: error as Error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { error };
      }

      console.log('✅ Sign in successful:', { userId: data.user?.id });
      return { error: null };
    } catch (error) {
      console.error('❌ Sign in exception:', error);
      return { error: error as Error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error);
        return { error };
      }

      console.log('✅ Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign out exception:', error);
      return { error: error as Error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        console.error('❌ Password reset error:', error);
        return { error };
      }

      console.log('✅ Password reset email sent');
      return { error: null };
    } catch (error) {
      console.error('❌ Password reset exception:', error);
      return { error: error as Error };
    }
  };

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }): Promise<{ error: Error | null }> => {
    try {
      if (!authState.user) {
        return { error: new Error('No authenticated user') };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authState.user.id);

      if (error) {
        console.error('❌ Profile update error:', error);
        return { error };
      }

      console.log('✅ Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ Profile update exception:', error);
      return { error: error as Error };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };
};

// Hook for checking if user is authenticated
export const useRequireAuth = () => {
  const auth = useAuth();
  
  useEffect(() => {
    if (auth.initialized && !auth.loading && !auth.user) {
      // Redirect to auth page or show login modal
      console.log('🔐 Authentication required');
    }
  }, [auth.initialized, auth.loading, auth.user]);

  return auth;
};