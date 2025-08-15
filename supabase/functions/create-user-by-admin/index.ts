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

  let requestBody;
  try {
    // Attempt to read the body as text first to debug if it's empty or malformed
    const bodyText = await req.text();
    if (!bodyText) {
      console.error("Received empty request body despite Content-Type: application/json.");
      return new Response(JSON.stringify({ error: 'Request body is empty. Please ensure all required fields are sent.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Bad Request
      });
    }
    requestBody = JSON.parse(bodyText); // Manually parse the text
  } catch (parseError: any) {
    console.error("JSON parsing error:", parseError.message);
    return new Response(JSON.stringify({ error: `Invalid JSON in request body: ${parseError.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Bad Request
    });
  }

  try {
    const { email, password, name, pin, phone, department, designation } = requestBody;

    if (!email || !password || !name || !pin || !phone) {
      console.error("Validation Error: Missing required user data in parsed JSON.");
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
      console.error("Database Error (profileCheckError):", profileCheckError.message);
      return new Response(JSON.stringify({ error: `Database check failed: ${profileCheckError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500, // Internal Server Error for database issues
      });
    }

    if (existingProfiles && existingProfiles.length > 0) {
      if (existingProfiles.some((p: { id: string; pin: string; email: string; }) => p.pin === pin)) {
        console.warn(`Conflict: PIN '${pin}' already exists.`);
        return new Response(JSON.stringify({ error: "PIN already exists." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Conflict
        });
      }
      if (existingProfiles.some((p: { id: string; pin: string; email: string; }) => p.email === email)) {
        console.warn(`Conflict: Email '${email}' already exists.`);
        return new Response(JSON.stringify({ error: "Email already exists." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Conflict
        });
      }
    }

    const { data: user, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        pin,
        phone: "+880" + phone,
        department: department || null,
        designation: designation || null,
        role: 'user',
        status: 'active',
      },
    });

    if (createUserError) {
      console.error("Supabase Auth Error (createUserError):", createUserError.message);
      return new Response(JSON.stringify({ error: `User creation failed: ${createUserError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Bad Request for auth-related validation errors
      });
    }

    console.log("User created successfully:", user.user?.id);

    return new Response(JSON.stringify({ message: 'User created successfully.', userId: user.user?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Unhandled Edge Function Error (after parsing):", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected internal server error occurred." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});