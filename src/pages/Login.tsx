import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First check if patient exists with this PIN
      const { data: patient, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('pin', pin)
        .maybeSingle();

      if (fetchError || !patient) {
        setError("Invalid PIN or password");
        setLoading(false);
        return;
      }

      // Sign in with email (using PIN as email) and password
      const email = `${pin}@patient.local`; // Convert PIN to email format
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Invalid PIN or password");
        setLoading(false);
        return;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      navigate('/patient-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showLogin={false} />
      
      <main className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md medical-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Patient Login</CardTitle>
            <CardDescription className="text-center">
              Enter your PIN and password to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="number"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Register here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Login;