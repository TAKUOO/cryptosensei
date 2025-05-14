import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthError } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdminStatus(userId: string | undefined) {
    setIsLoading(true);
    try {
      if (!userId) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data?.is_admin ?? false);
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }

  const getErrorMessage = (error: AuthError): string => {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'メールアドレスまたはパスワードが正しくありません';
      case 'User already registered':
        return 'このメールアドレスは既に登録されています';
      case 'Password should be at least 6 characters':
        return 'パスワードは6文字以上で入力してください';
      default:
        return 'エラーが発生しました。もう一度お試しください';
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw new Error(getErrorMessage(error));
  };

  const signUp = async (email: string, password: string) => {
    if (password.length < 6) {
      throw new Error('パスワードは6文字以上で入力してください');
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw new Error(getErrorMessage(error));
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw new Error(getErrorMessage(error));
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(getErrorMessage(error));
  };

  return { user, isAdmin, isLoading, signIn, signUp, signInWithGoogle, signOut };
}