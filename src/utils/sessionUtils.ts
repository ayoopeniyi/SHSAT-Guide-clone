import { supabase } from '@/lib/supabase';

export const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Session validation failed:', error);
      return false;
    }
    
    if (!session) {
      /* console.log('No active session found'); */
      return false;
    }
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      /* console.log('Session expired'); */
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Session validation error:', error);
    return false;
  }
};

export const clearInvalidSession = async (): Promise<void> => {
  try {
    // Clear local storage
    localStorage.removeItem('sb-zpzubejohjimojdrmyxo-auth-token');
    sessionStorage.removeItem('sb-zpzubejohjimojdrmyxo-auth-token');
    
    // Try to sign out (ignore errors)
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('Error clearing session:', error);
  }
};
