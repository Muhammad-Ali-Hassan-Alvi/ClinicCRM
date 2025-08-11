import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = "re_XWPZwwAC_GmCtkpbR6WiKLN4AMmWMLM8x";

serve(async (req) => {
  // CORS Preflight handling
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { to, subject, message, from } = await req.json();

    // Resend API call
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: from || "",
        to: [to],
        subject,
        html: `<p>${message}</p>`,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    // Optionally: Email info DB me save karo (agar chaho) using Supabase client

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

