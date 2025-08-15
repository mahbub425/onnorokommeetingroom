import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/types/database";
import { User, Lock, Phone, Mail, Building, Briefcase } from "lucide-react";

const departmentOptions = [
  "Human Resource Management", "Software Development", "Business Development",
  "Software Quality Assurance", "Operations & Management", "UI & Graphics Design",
  "TechCare", "Requirement Analysis & UX Design", "Top Management",
  "DevOps & Network", "Finance & Accounts", "Internal Audit",
  "Graphics & Creative", "Organization Development", "IT & Hardware",
  "Legal & Compliance", "Operations (Asset Management)"
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required").regex(/^[a-zA-Z\s]+$/, "Name cannot contain numbers or special characters"),
  pin: z.string().min(1, "PIN is required").regex(/^\d+$/, "PIN must be numeric").max(9, "PIN must be 9 digits or less"),
  phone: z.string().min(10, "Phone number must be 10 digits").max(10, "Phone number must be 10 digits").regex(/^[0-9]{10}$/, "Phone number must be numeric and 10 digits long"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  department: z.string().optional(),
  designation: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(), // Optional for edit, required for add
});

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserProfile | null; // Optional for add, present for edit
  onSaveSuccess: () => void;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, onOpenChange, user, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      pin: user?.pin || "",
      phone: user?.phone ? user.phone.replace("+880", "") : "",
      email: user?.email || "",
      department: user?.department || "",
      designation: user?.designation || "",
      password: "", // Always empty for security, only set for new user creation
    },
  });

  // Corrected superRefine logic to use the 'user' prop
  useEffect(() => {
    form.clearErrors("password"); // Clear password error when user prop changes
    form.control.unregister("password"); // Unregister password field to re-apply validation
    form.control.register("password", {
      required: !user ? "Password is required for new users" : false,
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
    });
  }, [user, form.control, form.clearErrors, form.register, form.unregister]);


  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.name || "",
        pin: user.pin || "",
        phone: user.phone ? user.phone.replace("+880", "") : "",
        email: user.email || "",
        department: user.department || "",
        designation: user.designation || "",
        password: "", // Never pre-fill password for security
      });
    } else if (open && !user) {
      // Reset for new user form
      form.reset({
        name: "", pin: "", phone: "", email: "", department: "", designation: "", password: ""
      });
    }
  }, [open, user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (user) {
        // Edit existing user
        // Check for unique PIN and Email before attempting update
        const { data: existingProfiles, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id, pin, email')
          .or(`pin.eq.${values.pin},email.eq.${values.email}`);

        if (profileCheckError) throw profileCheckError;

        if (existingProfiles && existingProfiles.length > 0) {
          if (existingProfiles.some(p => p.pin === values.pin && p.id !== user?.id)) {
            form.setError("pin", { type: "manual", message: "PIN already exists" });
          }
          if (existingProfiles.some(p => p.email === values.email && p.id !== user?.id)) {
            form.setError("email", { type: "manual", message: "Email already exists" });
          }
          if (form.formState.errors.pin || form.formState.errors.email) {
            setIsSubmitting(false);
            return;
          }
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: values.name,
            pin: values.pin,
            phone: "+880" + values.phone,
            email: values.email,
            department: values.department,
            designation: values.designation,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Update auth.users email if it changed
        if (values.email !== user.email) {
          const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
            email: values.email,
          });
          if (authUpdateError) throw authUpdateError;
        }

        // Update auth.users password if provided (only if it's a new password)
        if (values.password) {
          const { error: authPasswordError } = await supabase.auth.admin.updateUserById(user.id, {
            password: values.password,
          });
          if (authPasswordError) throw authPasswordError;
        }

      } else {
        // Add new user via Edge Function
        // Password is now required by form schema for new users, so no need for manual check here
        const payload = {
          email: values.email,
          password: values.password,
          name: values.name,
          pin: values.pin,
          phone: values.phone, // Pass without +880, let edge function add it
          department: values.department,
          designation: values.designation,
        };
        console.log("Sending payload to Edge Function:", JSON.stringify(payload, null, 2));

        const { data, error: edgeFunctionError } = await supabase.functions.invoke(
          'create-user-by-admin',
          {
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (edgeFunctionError) {
          // Directly use the error message from the Edge Function
          // The Edge Function is designed to return specific error messages in its response body,
          // which supabase.functions.invoke wraps into the error.message property.
          form.setError("root.serverError", {
            message: edgeFunctionError.message || "An unexpected error occurred during user creation.",
          });
          setIsSubmitting(false); // Ensure submitting state is reset on error
          return; // Stop further execution
        } else if (data) {
          // Success
          console.log("User created via Edge Function:", data);
        } else {
          // This case should ideally not be reached if the Edge Function always returns data or an error.
          throw new Error("User creation failed, no data returned from Edge Function.");
        }
      }

      onSaveSuccess();
    } catch (error: any) {
      console.error("User form submission error:", error);
      form.setError("root.serverError", {
        message: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="col-span-1">
            <Label htmlFor="name" className="flex items-center mb-1">
              <User className="inline-block mr-2 h-4 w-4" />
              Full Name
            </Label>
            <Input id="name" placeholder="Enter full name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Label htmlFor="pin" className="flex items-center mb-1">
              <Lock className="inline-block mr-2 h-4 w-4" />
              PIN
            </Label>
            <Input id="pin" type="text" placeholder="Enter unique PIN" {...form.register("pin")} />
            {form.formState.errors.pin && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.pin.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Label htmlFor="phone" className="flex items-center mb-1">
              <Phone className="inline-block mr-2 h-4 w-4" />
              Phone Number
            </Label>
            <div className="flex">
              <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 dark:bg-gray-300">
                +880
              </span>
              <Input
                id="phone"
                type="text"
                placeholder="1712345678"
                {...form.register("phone")}
                className="rounded-l-none"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Label htmlFor="email" className="flex items-center mb-1">
              <Mail className="inline-block mr-2 h-4 w-4" />
              Email
            </Label>
            <Input id="email" type="email" placeholder="user.email@company.com" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Label htmlFor="department" className="flex items-center mb-1">
              <Building className="inline-block mr-2 h-4 w-4" />
              Department
            </Label>
            <Select onValueChange={(value) => form.setValue("department", value)} value={form.watch("department")}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.department && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.department.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Label htmlFor="designation" className="flex items-center mb-1">
              <Briefcase className="inline-block mr-2 h-4 w-4" />
              Designation
            </Label>
            <Input id="designation" type="text" placeholder="Job title" {...form.register("designation")} />
            {form.formState.errors.designation && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.designation.message}</p>
            )}
          </div>
          {!user && ( // Only show password field for new user creation
            <div className="col-span-1">
              <Label htmlFor="password" className="flex items-center mb-1">
                <Lock className="inline-block mr-2 h-4 w-4" />
                Password
              </Label>
              <Input id="password" type="password" placeholder="Strong password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
          )}
          {form.formState.errors.root?.serverError && (
            <p className="text-red-500 text-sm col-span-full text-center mt-2">
              {form.formState.errors.root.serverError.message}
            </p>
          )}
          <DialogFooter className="col-span-full">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (user ? "Saving..." : "Adding...") : (user ? "Save Changes" : "Add User")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;