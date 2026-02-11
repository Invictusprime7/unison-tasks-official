import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Crown, Zap, Building2, CreditCard, RefreshCw, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useSubscription, PlanType, PLAN_LIMITS } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const planIcons: Record<PlanType, React.ReactNode> = {
  free: <Zap className="h-5 w-5" />,
  pro: <Crown className="h-5 w-5" />,
  business: <Building2 className="h-5 w-5" />,
};

const planColors: Record<PlanType, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-primary text-primary-foreground",
  business: "bg-secondary text-secondary-foreground",
};

export function SubscriptionSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    subscription,
    loading,
    getLimits,
    getUsagePercentage,
    cancelSubscription,
    updatePaymentMethod,
    reactivateSubscription,
  } = useSubscription();

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No subscription data available</p>
        </CardContent>
      </Card>
    );
  }

  const plan = subscription.plan;
  const limits = getLimits();
  const isPaid = plan !== "free";
  const isCanceling = subscription.cancel_at_period_end;

  const handleUpdatePayment = async () => {
    setActionLoading("payment");
    const result = await updatePaymentMethod();
    if (result.url) {
      window.location.href = result.url;
    } else if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  const handleCancelSubscription = async () => {
    setActionLoading("cancel");
    const result = await cancelSubscription(false); // Cancel at period end
    if (result.success) {
      toast({
        title: "Subscription canceled",
        description: "Your subscription will remain active until the end of your billing period.",
      });
    } else if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  const handleReactivate = async () => {
    setActionLoading("reactivate");
    const result = await reactivateSubscription();
    if (result.success) {
      toast({
        title: "Subscription reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
    } else if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${planColors[plan]}`}>
                {planIcons[plan]}
              </div>
              <div>
                <CardTitle className="capitalize">{plan} Plan</CardTitle>
                <CardDescription>
                  {isPaid && subscription.current_period_end ? (
                    <>
                      {isCanceling ? "Cancels" : "Renews"} on{" "}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </>
                  ) : (
                    "Free forever"
                  )}
                </CardDescription>
              </div>
            </div>
            <Badge variant={subscription.status === "active" ? "default" : "destructive"}>
              {isCanceling ? "Canceling" : subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* AI Generations */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Generations</span>
                <span className="text-muted-foreground">
                  {subscription.ai_generations_used} /{" "}
                  {limits.aiGenerations === Infinity ? "∞" : limits.aiGenerations}
                </span>
              </div>
              <Progress value={getUsagePercentage("ai")} className="h-2" />
            </div>

            {/* Projects */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Projects</span>
                <span className="text-muted-foreground">
                  {subscription.projects_count} /{" "}
                  {limits.projects === Infinity ? "∞" : limits.projects}
                </span>
              </div>
              <Progress value={getUsagePercentage("projects")} className="h-2" />
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage</span>
                <span className="text-muted-foreground">
                  {subscription.storage_used_mb} MB /{" "}
                  {limits.storageMb === Infinity ? "∞" : `${limits.storageMb} MB`}
                </span>
              </div>
              <Progress value={getUsagePercentage("storage")} className="h-2" />
            </div>
          </div>

          {/* Cancellation Warning */}
          {isCanceling && (
            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium text-yellow-500">Subscription ending soon</p>
                <p className="text-sm text-muted-foreground">
                  Your subscription will end on{" "}
                  {new Date(subscription.current_period_end!).toLocaleDateString()}.
                  You'll be downgraded to the free plan.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReactivate}
                disabled={actionLoading !== null}
              >
                {actionLoading === "reactivate" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reactivate
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 flex-wrap">
          {!isPaid ? (
            <Button onClick={() => navigate("/pricing")}>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleUpdatePayment}
                disabled={actionLoading !== null}
              >
                {actionLoading === "payment" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/pricing")}
              >
                Change Plan
              </Button>
              {!isCanceling && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-destructive hover:text-destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your subscription will remain active until the end of your billing period on{" "}
                        {new Date(subscription.current_period_end!).toLocaleDateString()}.
                        After that, you'll be downgraded to the free plan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {actionLoading === "cancel" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Cancel Subscription"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      {/* Plan Comparison */}
      {!isPaid && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upgrade to unlock more</CardTitle>
            <CardDescription>
              Get unlimited projects, more AI generations, and premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Pro Plan</span>
                  <Badge variant="secondary">$29/mo</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Unlimited projects</li>
                  <li>✓ 500 AI generations/month</li>
                  <li>✓ Custom domains</li>
                  <li>✓ API access</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-secondary-foreground" />
                  <span className="font-semibold">Business Plan</span>
                  <Badge variant="secondary">$99/mo</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Unlimited AI generations</li>
                  <li>✓ White-label solution</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/pricing")}>
              View All Plans
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
