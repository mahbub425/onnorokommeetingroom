import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    pin: "",
    concern: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const concernOptions = ["OPL", "OG", "Udvash", "Rokomari", "Unmesh", "Uttoron"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.pin || !formData.concern || !formData.phone || !formData.password) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return false;
    }

    if (formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Check if PIN already exists
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('pin')
        .eq('pin', formData.pin)
        .single();

      if (existingPatient) {
        setError("This PIN is already registered");
        setLoading(false);
        return;
      }

      // Create auth user with email format (PIN@patient.local)
      const email = `${formData.pin}@patient.local`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
      });

      if (authError) {
        setError("Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Insert patient data with auth user ID
      const { error: insertError } = await supabase
        .from('patients')
        .insert({
          id: authData.user?.id,
          name: formData.name,
          pin: formData.pin,
          concern: formData.concern,
          phone: formData.phone,
          password_hash: formData.password // This will be hashed by the database
        });

      if (insertError) {
        setError("Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      toast({
        title: "Registration successful",
        description: "You can now login with your PIN and password",
      });

      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showLogin={false} />
      
      <main className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Card className="w-full max-w-md medical-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Patient Registration</CardTitle>
            <CardDescription className="text-center">
              Create your account to book appointments
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="number"
                  value={formData.pin}
                  onChange={(e) => handleInputChange('pin', e.target.value)}
                  placeholder="Enter a unique PIN"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="concern">Concern</Label>
                <Select onValueChange={(value) => handleInputChange('concern', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your concern" />
                  </SelectTrigger>
                  <SelectContent>
                    {concernOptions.map((concern) => (
                      <SelectItem key={concern} value={concern}>
                        {concern}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
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
                {loading ? "Registering..." : "Register"}
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Register;