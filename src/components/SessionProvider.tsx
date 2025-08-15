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
        }, 0);
      } else {
        setIsAdmin(false);
      }

      setIsLoading(false);

      const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
      const adminRoutes = ["/admin", "/admin-dashboard"];
      const isPublicRoute = publicRoutes.includes(location.pathname);
      const isAdminRoute = adminRoutes.includes(location.pathname);

      if (currentSession) {
        // User is logged in (Supabase auth)
        if (userRole === 'admin') {
          if (isPublicRoute && location.pathname !== "/admin") { // Allow /admin for admin login, but redirect from other public routes
            navigate("/admin-dashboard");
          }
        } else { // Regular user
          if (isAdminRoute) {
            navigate("/"); // Regular users cannot access admin routes
          } else if (isPublicRoute) {
            navigate("/"); // Redirect regular users from public routes
          }
        }
      } else {
        // User is not logged in (Supabase auth)
        if (!isPublicRoute && !isAdminRoute) { // If trying to access protected routes (user or admin dashboard)
          navigate("/login"); // Redirect to login
        }
      }
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