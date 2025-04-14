
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '@/services/AuthService';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = AuthService.onAuthStateChange((session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const session = await AuthService.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { session } = await AuthService.signIn(email, password);
      setSession(session);
      setUser(session?.user ?? null);
      toast({
        title: "התחברות בוצעה בהצלחה",
        description: "ברוך הבא למערכת ניהול הכושר",
      });
    } catch (error: any) {
      toast({
        title: "שגיאת התחברות",
        description: error.message || "התרחשה שגיאה בעת ההתחברות, נסה שנית",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, lastName: string) => {
    try {
      setIsLoading(true);
      await AuthService.signUp(email, password, name, lastName);
      toast({
        title: "הרשמה בוצעה בהצלחה",
        description: "כעת באפשרותך להתחבר למערכת",
      });
    } catch (error: any) {
      toast({
        title: "שגיאת הרשמה",
        description: error.message || "התרחשה שגיאה בעת ההרשמה, נסה שנית",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await AuthService.signOut();
      setSession(null);
      setUser(null);
      toast({
        title: "התנתקות בוצעה בהצלחה",
        description: "להתראות בפעם הבאה",
      });
    } catch (error: any) {
      toast({
        title: "שגיאת התנתקות",
        description: error.message || "התרחשה שגיאה בעת ההתנתקות, נסה שנית",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
