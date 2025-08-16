import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/components/SessionProvider";
import { Mail, User as UserIcon } from "lucide-react"; // Import Mail and UserIcon

const formSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or Username is required"),
  password: z.string().min(1, "Password is required"),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session, isAdmin, isLoading } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && session) {
      if (isAdmin) {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isLoading, session, isAdmin, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    let emailToUse = values.emailOrUsername;

    try {
      // Determine if the input is an email or a username
      const isEmail = values.emailOrUsername.includes('@');

      if (!isEmail) {
        // If it's not an email, assume it's a username and try to find the associated email
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email, role')
          .eq('username', values.emailOrUsername)
          .single();

        if (profileError || !profileData) {
          toast({
            title: "Login Error",
            description: "Invalid Username or Password.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        emailToUse = profileData.email;
      }

      // Attempt to sign in with the determined email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: values.password,
      });

      if (signInError) {
        toast({
          title: "Login Error",
          description: signInError.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Check if the authenticated user has the 'admin' role in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          // If not an admin, sign them out and show error
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "You do not have administrative privileges.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Login Successful",
          description: "Welcome, Admin!",
        });
        // Redirection is now handled by SessionProvider's onAuthStateChange
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || (session && isAdmin) || (session && !isAdmin)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p className="text-xl">Loading...</p>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">Admin Login</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Enter your admin credentials.</p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="emailOrUsername" className="flex items-center mb-1">
              {form.watch("emailOrUsername").includes('@') ? <Mail className="inline-block mr-2 h-4 w-4" /> : <UserIcon className="inline-block mr-2 h-4 w-4" />}
              Email or Username
            </Label>
            <Input id="emailOrUsername" placeholder="admin@example.com or admin_username" type="text" {...form.register("emailOrUsername")} autoComplete="username" />
            {form.formState.errors.emailOrUsername && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.emailOrUsername.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" placeholder="********" type="password" {...form.register("password")} autoComplete="current-password" />
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in as Admin"}
          </Button>
        </form>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default AdminLogin;