import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs for each plan (configure these in your Stripe dashboard)
const PLAN_PRICE_IDS: Record<string, string> = {
  pro: Deno.env.get("STRIPE_PRO_PRICE_ID") || "price_pro_monthly",
  business: Deno.env.get("STRIPE_BUSINESS_PRICE_ID") || "price_business_monthly",
  pro_yearly: Deno.env.get("STRIPE_PRO_YEARLY_PRICE_ID") || "price_pro_yearly",
  business_yearly: Deno.env.get("STRIPE_BUSINESS_YEARLY_PRICE_ID") || "price_business_yearly",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get the authorization header and create Supabase client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { plan, priceId, successUrl, cancelUrl, billingCycle = "monthly" } = await req.json();

    // Determine the price ID to use
    let stripePriceId = priceId;
    if (!stripePriceId && plan) {
      const planKey = billingCycle === "yearly" ? `${plan}_yearly` : plan;
      stripePriceId = PLAN_PRICE_IDS[planKey];
    }

    if (!stripePriceId) {
      throw new Error("Invalid plan or price ID");
    }

    // Get or create customer
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to subscription record
      await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
        }, { 
          onConflict: "user_id" 
        });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/checkout/cancel`,
      metadata: {
        supabase_user_id: user.id,
        plan: plan || "unknown",
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan: plan || "unknown",
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
