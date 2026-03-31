import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kiwify-signature",
};

// Map Kiwify checkout URLs to plan names
const PRODUCT_PLAN_MAP: Record<string, string> = {
  "Q3C9tgH": "standard",
  "NuyBAgP": "pro",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Verify webhook token
    const KIWIFY_WEBHOOK_TOKEN = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");
    if (!KIWIFY_WEBHOOK_TOKEN) {
      throw new Error("KIWIFY_WEBHOOK_TOKEN is not configured");
    }

    const signature = req.headers.get("x-kiwify-signature") 
      ?? req.headers.get("authorization")?.replace("Bearer ", "");

    if (!signature || signature !== KIWIFY_WEBHOOK_TOKEN) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    console.log("Kiwify webhook received:", JSON.stringify(body));

    // Kiwify sends order_status for purchase events
    const orderStatus = body.order_status ?? body.subscription_status;
    const buyerEmail = body.Customer?.email ?? body.customer?.email;
    const productId = body.Product?.id ?? body.product?.id;
    const checkoutLink = body.Commissions?.checkout_link 
      ?? body.checkout_link 
      ?? body.Product?.checkout_link
      ?? "";

    if (!buyerEmail) {
      console.error("No buyer email found in webhook payload");
      return new Response(JSON.stringify({ error: "Missing buyer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine plan from checkout link or product
    let plan: string | null = null;
    for (const [key, value] of Object.entries(PRODUCT_PLAN_MAP)) {
      if (checkoutLink.includes(key)) {
        plan = value;
        break;
      }
    }

    if (!plan) {
      console.error("Could not map product to plan. Checkout link:", checkoutLink, "Product ID:", productId);
      return new Response(JSON.stringify({ error: "Unknown product" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only activate on approved/paid status
    const isApproved = ["paid", "approved", "completed", "active"].includes(
      (orderStatus ?? "").toLowerCase()
    );
    const isRefunded = ["refunded", "chargedback", "cancelled", "canceled"].includes(
      (orderStatus ?? "").toLowerCase()
    );

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase env vars not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      throw new Error(`Failed to list users: ${userError.message}`);
    }

    const user = userData.users.find(
      (u) => u.email?.toLowerCase() === buyerEmail.toLowerCase()
    );

    if (!user) {
      console.error("User not found for email:", buyerEmail);
      return new Response(
        JSON.stringify({ error: "User not found", email: buyerEmail }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update plan
    const newPlan = isRefunded ? "free" : isApproved ? plan : null;

    if (newPlan) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ plan: newPlan })
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      console.log(`Updated user ${buyerEmail} plan to ${newPlan}`);
    } else {
      console.log(`Ignoring webhook with status: ${orderStatus}`);
    }

    return new Response(
      JSON.stringify({ success: true, plan: newPlan, email: buyerEmail }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
