// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, name, pin, phone, department, designation } = await req.json();

    if (!email || !password || !name || !pin || !phone) {
      return new Response(JSON.stringify({ error: 'Missing required user data.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // @ts-ignore
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Check for existing PIN or email in profiles table before creating auth user
    const { data: existingProfiles, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, pin, email')
      .or(`pin.eq.${pin},email.eq.${email}`);

    if (profileCheckError) {
      console.error("Error checking existing profiles:", profileCheckError);
      throw new Error(`Database check failed: ${profileCheckError.message}`);
    }

    if (existingProfiles && existingProfiles.length > 0) {
      if (existingProfiles.some((p: { id: string; pin: string; email: string; }) => p.pin === pin)) {
        return new Response(JSON.stringify({ error: "PIN already exists." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Conflict
        });
      }
      if (existingProfiles.some((p: { id: string; pin: string; email: string; }) => p.email === email)) {
        return new Response(JSON.stringify({ error: "Email already exists." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Conflict
        });
      }
    }

    const { data: user, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm email for admin-created users
      user_metadata: {
        name,
        pin,
        phone: "+880" + phone, // Prepend +880
        department: department || null,
        designation: designation || null,
        role: 'user', // Default role for new users added by admin
        status: 'active', // Default status
      },
    });

    if (createUserError) {
      console.error("Error creating user via admin API:", createUserError);
      throw new Error(`User creation failed: ${createUserError.message}`);
    }

    // The handle_new_user trigger should automatically create the profile entry.
    // No need for explicit profile insert here if the trigger is working.
    console.log("User created successfully:", user.user?.id);

    return new Response(JSON.stringify({ message: 'User created successfully.', userId: user.user?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Edge Function caught an unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred in the Edge Function." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});