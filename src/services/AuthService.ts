
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export class AuthService {
  static async signUp(email: string, password: string, name: string, lastName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          last_name: lastName
        }
      }
    });

    if (error) {
      throw error;
    }

    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return true;
  }

  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return data.session;
  }

  static onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}
