import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({
        error: "Email and password are required"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    // --- Check if user already exists ---
    const { data: existingUser, error: fetchError } = await supabaseAdmin.from("auth.users").select("id, email").eq("email", email).maybeSingle();
    if (fetchError) throw fetchError;
    if (existingUser) {
      console.log(`User ${email} exists. Resetting password.`);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password
      });
      if (updateError) throw updateError;
      return new Response(JSON.stringify({
        message: `Password for '${email}' has been reset.`
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    }
    // --- User does not exist → create new ---
    const { data: branches, error: branchError } = await supabaseAdmin.from("branches").select("id");
    if (branchError) throw branchError;
    const allBranchIds = branches.map((b)=>b.id);
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
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
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Error in create-admin-user function:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
