import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  // Sync user with Node.js backend
  const syncUserWithBackend = useCallback(async (supabaseUser) => {
    try {
      if (!supabaseUser) return null;

      const response = await fetch('http://localhost:4000/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUserId: supabaseUser.id,
          email: supabaseUser.email,
          metadata: supabaseUser.user_metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync user with backend');
      }

      return await response.json();
    } catch (err) {
      console.error('User sync error:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          setSession(session);
          setUser(session.user);
          await syncUserWithBackend(session.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial session check
    initializeAuth();

    // Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await syncUserWithBackend(newSession.user);
        }
      }
    );

    // Cross-tab session sync
    const handleStorageChange = (event) => {
      if (event.key === 'supabase.auth.token') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncUserWithBackend]);

  const signUp = async ({ email, password, name, phone_number, profession }) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone_number, profession }
        }
      });

      if (authError) throw authError;
      return user;

    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
      {children}
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
