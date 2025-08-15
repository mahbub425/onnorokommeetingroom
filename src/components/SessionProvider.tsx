import React, { useState, useEffect, createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface SessionContextType {
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthStateChange = (_event: string, currentSession: Session | null) => {
      setSession(currentSession);

      let userRole = 'user'; // Default role
      if (currentSession) {
        // Defer database call to prevent deadlock
        setTimeout(async () => {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();

          if (profile && !error) {
            userRole = profile.role;
          }
          
          setIsAdmin(userRole === 'admin');

          // After determining role, handle redirection
          if (userRole === 'admin') {
            if (location.pathname !== "/admin-dashboard") {
              navigate("/admin-dashboard");
            }
          } else { // Regular user
            if (location.pathname !== "/") {
              navigate("/");
            }
          }
        }, 0);
      } else {
        setIsAdmin(false);
        // User is not logged in (Supabase auth)
        const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/admin"];
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login"); // Redirect to login if trying to access any protected route
        }
      }

      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p className="text-xl">Loading application...</p>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, isAdmin, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};