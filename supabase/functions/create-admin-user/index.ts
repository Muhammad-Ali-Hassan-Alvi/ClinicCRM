// supabase/functions/create-admin-user/index.ts
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  branch_ids?: string[];
}

// Helper function to create profile with better error handling
async function createUserProfile(supabaseAdmin: any, userId: string, userName: string, userRole: string, userBranchIds: string[]) {
  try {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name: userName,
        avatar_url: null,
        role: userRole,
        branch_ids: userBranchIds || []
      });
    
    if (profileError) {
      console.error("Error creating profile:", profileError);
      console.error("Profile error details:", {
        error: profileError,
        user_id: userId,
        name: userName,
        role: userRole,
        branch_ids: userBranchIds
      });
      return false;
    } else {
      console.log("Profile created successfully for user:", userId, "with role:", userRole, "and branches:", userBranchIds);
      return true;
    }
  } catch (profileException) {
    console.error("Exception while creating profile:", profileException);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // This OPTIONS handler is critical and will now work.
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  
  try {
    // 1. Get data from frontend
    const { email, password, name, role, branch_ids }: CreateUserRequest = await req.json();
    
    // 2. Validate input
    if (!email || !password || !name || !role) {
      return new Response(JSON.stringify({
        error: "Email, password, name, and role are required"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    
    // 3. Create the admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // 4. Try to create user directly
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        branch_ids: branch_ids || []
      }
    });
    
    if (createError) {
      // Handle the "User already exists" error specifically
      if (createError.message.includes("User already exists")) {
        return new Response(JSON.stringify({
          error: `User with email ${email} already exists.`
        }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          },
          status: 409
        });
      }
      // For all other errors, re-throw them
      throw createError;
    }
    
    // 5. Create profile record for the new user with role and branch assignments
    if (data.user) {
      const profileCreated = await createUserProfile(supabaseAdmin, data.user.id, name, role, branch_ids);
      if (!profileCreated) {
        console.log("Profile creation failed, but user was created successfully");
      }
    }
    
    // 6. Success
    return new Response(JSON.stringify({
      user: data.user,
      message: `Admin account for ${email} created successfully.`
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error: any) {
    console.error("Error in create-user function:", error);
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
