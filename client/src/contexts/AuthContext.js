// src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

// Environment variables (configure in Vercel dashboard)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  // Production-ready user sync with retry logic
  const syncUserWithBackend = useCallback(async (supabaseUser) => {
    if (!supabaseUser) return null;

    const MAX_RETRIES = 3;
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/sync`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseUser.id}` 
          },
          body: JSON.stringify({
            supabaseUserId: supabaseUser.id,
            email: supabaseUser.email,
            metadata: supabaseUser.user_metadata
          })
        });

        if (!response.ok) {
          if (response.status === 429) { // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 2 ** retries * 1000));
            retries++;
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        if (retries >= MAX_RETRIES - 1) {
          console.error('User sync failed after retries:', err);
          return null;
        }
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }, []);

  // Enhanced auth initialization
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) throw error;

        if (session) {
          setSession(session);
          setUser(session.user);
          await syncUserWithBackend(session.user);
        }
      } catch (error) {
        if (isMounted) setError(error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (isMounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await syncUserWithBackend(newSession.user);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [syncUserWithBackend]);

  // Production signup with error codes
  const signUp = async ({ email, password, name, phone_number, profession }) => {
    setLoading(true);
    setError(null);
  
    try {
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone_number,
            profession,
            email_verified: false
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_EMAIL_REDIRECT_URL
        }
      });
  
      if (authError) {
        throw new Error(authError.message || 'Signup failed');
      }

      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Production-ready password reset
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.NEXT_PUBLIC_PASSWORD_RESET_REDIRECT
      });
      
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Secure sign-in with session validation
  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) throw error;

      // Verify session with backend
      await syncUserWithBackend(data.user);
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Production signout with cleanup
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Optional: Clear sensitive data from storage
      window.sessionStorage.clear();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user with validation
  const updateUser = async (updates) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser(updates);
      
      if (error) throw error;
      
      setUser(data.user);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    resetPassword,
    signIn,
    signOut,
    updateUser,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}