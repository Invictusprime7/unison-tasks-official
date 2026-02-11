import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
  } | null>(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyAndFetchSubscription = async () => {
      try {
        // Wait a moment for webhook to process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        // Fetch updated subscription
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("plan, status")
          .eq("user_id", user.id)
          .single();

        if (sub) {
          setSubscription(sub);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchSubscription();
  }, [navigate, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Welcome to Unison Tasks {subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : "Pro"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Your new benefits are active</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {subscription?.plan === "business" ? (
                <>
                  <li>✓ Unlimited AI generations</li>
                  <li>✓ Unlimited team members</li>
                  <li>✓ White-label solution</li>
                  <li>✓ Priority support</li>
                </>
              ) : (
                <>
                  <li>✓ Unlimited projects</li>
                  <li>✓ 500 AI generations/month</li>
                  <li>✓ Custom domains</li>
                  <li>✓ API access</li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/settings")}
            >
              Manage Subscription
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            A confirmation email has been sent to your email address.
            You can manage your subscription anytime from Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;
