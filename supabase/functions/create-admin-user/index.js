// create-admin-user/index.ts (FINAL, CORRECT VERSION)
import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  
  try {
    // 1. Get the user-provided data
    const { email, password } = await req.json();
    
    // 2. Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({
        error: "Email and password are required"
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    
    // 3. Connect to Supabase with admin rights
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // ===================================================================
    // *** FIX #1: Use the correct 'getUserByEmail' function for lookup ***
    // ===================================================================
    const { data: { user: existingUser } } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    if (existingUser) {
      // --- FLOW A: User EXISTS -> Reset Password ---
      console.log(`User ${email} exists. Resetting password.`);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: password
      });
      if (updateError) throw updateError;
      
      return new Response(JSON.stringify({
        message: `Password for admin account '${email}' has been reset.`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } else {
      // --- FLOW B: User DOES NOT EXIST -> Create Admin with ALL Branches ---
      console.log(`User ${email} does not exist. Creating new admin.`);
      
      // First, get all available branch IDs from the 'branches' table
      const { data: branches, error: branchError } = await supabaseAdmin.from('branches').select('id');
      if (branchError) {
        throw new Error(`Could not fetch branches from the database: ${branchError.message}`);
      }
      const allBranchIds = branches.map((b) => b.id);
      
      // ===================================================================
      // *** FIX #2: Provide the 'branch_ids' in the metadata ***
      // This is required by your database trigger.
      // ===================================================================
      const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: "Admin",
          role: "Admin",
          branch_ids: allBranchIds
        }
      });
      
      if (createError) throw createError;
      
      return new Response(JSON.stringify({
        user: newUser,
        message: `Admin account for '${email}' created successfully with access to all ${allBranchIds.length} branches.`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
  } catch (error) {
    console.error('Error in create-admin-user function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
