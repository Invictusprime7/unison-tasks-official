import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { action, immediately, returnUrl } = await req.json();

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      throw new Error("No subscription found");
    }

    switch (action) {
      case "cancel": {
        if (!subscription.stripe_subscription_id) {
          throw new Error("No active subscription to cancel");
        }

        if (immediately) {
          // Cancel immediately
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
          
          // Update database
          await supabase
            .from("user_subscriptions")
            .update({
              plan: "free",
              status: "canceled",
              stripe_subscription_id: null,
              current_period_start: null,
              current_period_end: null,
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        } else {
          // Cancel at period end
          await stripe.subscriptions.update(subscription.stripe_subscription_id, {
            cancel_at_period_end: true,
          });

          await supabase
            .from("user_subscriptions")
            .update({
              cancel_at_period_end: true,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reactivate": {
        if (!subscription.stripe_subscription_id) {
          throw new Error("No subscription to reactivate");
        }

        // Remove cancel_at_period_end
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: false,
        });

        await supabase
          .from("user_subscriptions")
          .update({
            cancel_at_period_end: false,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update-payment": {
        if (!subscription.stripe_customer_id) {
          throw new Error("No customer found");
        }

        // Create a billing portal session
        const session = await stripe.billingPortal.sessions.create({
          customer: subscription.stripe_customer_id,
          return_url: returnUrl || `${req.headers.get("origin")}/settings`,
        });

        return new Response(
          JSON.stringify({ url: session.url }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get-invoices": {
        if (!subscription.stripe_customer_id) {
          return new Response(
            JSON.stringify({ invoices: [] }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const invoices = await stripe.invoices.list({
          customer: subscription.stripe_customer_id,
          limit: 12,
        });

        const formattedInvoices = invoices.data.map((inv) => ({
          id: inv.id,
          amount: (inv.amount_paid || 0) / 100,
          currency: inv.currency,
          status: inv.status,
          date: new Date(inv.created * 1000).toISOString(),
          invoice_pdf: inv.invoice_pdf,
          hosted_invoice_url: inv.hosted_invoice_url,
        }));

        return new Response(
          JSON.stringify({ invoices: formattedInvoices }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Manage subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
