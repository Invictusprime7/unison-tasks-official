import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, MessageCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <Card className="max-w-md w-full text-center bg-[#12121e] border-yellow-500/30 shadow-[0_0_30px_rgba(255,255,0,0.1)] relative z-10">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-yellow-400" />
          </div>
          <CardTitle className="text-2xl text-white">Checkout Cancelled</CardTitle>
          <CardDescription className="text-gray-400">
            No worries! Your payment was not processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-400">
            If you encountered any issues during checkout or have questions about our plans, 
            we're here to help.
          </p>

          <div className="space-y-3">
            <Button 
              className={cn(
                "w-full bg-cyan-500 text-black font-bold",
                "shadow-[0_0_20px_rgba(0,255,255,0.4)]",
                "hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]",
                "active:scale-95 transition-all duration-200"
              )}
              size="lg"
              onClick={() => navigate("/pricing")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Button>
            <Button 
              variant="ghost" 
              className="w-full border border-lime-500/30 text-lime-400 hover:bg-lime-500/10 hover:border-lime-500/50"
              onClick={() => navigate("/dashboard")}
            >
              Continue with Free Plan
            </Button>
          </div>

          <div className="border-t border-cyan-500/20 pt-4">
            <p className="text-sm font-medium text-white mb-3">Need help?</p>
            <div className="flex gap-2 justify-center">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10">
                <MessageCircle className="h-4 w-4 mr-1" />
                Contact Support
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10">
                <HelpCircle className="h-4 w-4 mr-1" />
                View FAQ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutCancel;
