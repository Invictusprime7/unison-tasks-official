/**
 * Reset Password Page
 * 
 * Allows users to set a new password after clicking
 * the reset link in their email.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Lock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/services/auditLogger';
import { cn } from '@/lib/utils';

// Password strength validation
function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  let label: string;
  let color: string;

  if (score >= 5) {
    label = 'Strong';
    color = 'text-lime-400';
  } else if (score >= 3) {
    label = 'Moderate';
    color = 'text-yellow-400';
  } else {
    label = 'Weak';
    color = 'text-red-400';
  }

  return { score, label, color, feedback };
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  // Check if we have a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if this is a recovery session
      if (session?.user) {
        setIsValidToken(true);
      } else {
        // Check for hash fragment from email link
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setError('Invalid or expired password reset link. Please request a new one.');
        }
      }
    };

    checkSession();

    // Listen for auth state changes (recovery link clicked)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidToken(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = password.length >= 8 && passwordsMatch && passwordStrength.score >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await auditLogger.logSecurityEvent('password_change', {
        event: 'password_reset_completed',
      }, 'medium');

      setSuccess(true);
      toast.success('Password updated successfully!');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
          <p className="text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <Card className="w-full max-w-md bg-[#12121e] border-red-500/30 shadow-[0_0_30px_rgba(255,0,0,0.2)] relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <CardTitle className="text-white">Invalid Reset Link</CardTitle>
            <CardDescription className="text-gray-400">
              {error || 'This password reset link is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/auth')} className={cn(
              "w-full bg-cyan-500 text-black font-bold",
              "shadow-[0_0_15px_rgba(0,255,255,0.4)]",
              "hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]",
              "transition-all duration-200"
            )}>
              Request New Reset Link
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <Card className="w-full max-w-md bg-[#12121e] border-lime-500/30 shadow-[0_0_30px_rgba(132,204,22,0.2)] relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-lime-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.3)]">
              <CheckCircle2 className="h-6 w-6 text-lime-400" />
            </div>
            <CardTitle className="text-white">Password Updated!</CardTitle>
            <CardDescription className="text-gray-400">
              Your password has been successfully changed. You can now use your new password to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className={cn(
              "w-full bg-lime-500 text-black font-bold",
              "shadow-[0_0_15px_rgba(132,204,22,0.4)]",
              "hover:bg-lime-400 hover:shadow-[0_0_25px_rgba(132,204,22,0.6)]",
              "transition-all duration-200"
            )}>
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
      <Card className="w-full max-w-md bg-[#12121e] border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.15)] relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            <Key className="h-6 w-6 text-cyan-400" />
          </div>
          <CardTitle className="text-white">Reset Your Password</CardTitle>
          <CardDescription className="text-gray-400">
            Enter a new password for your account. Make sure it's strong and unique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-9 pr-10 bg-[#0a0a12] border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-cyan-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded transition-colors ${
                          i <= passwordStrength.score
                            ? passwordStrength.score >= 5
                              ? 'bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.3)]'
                              : passwordStrength.score >= 3
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.label} password
                  </p>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="space-y-1">
                      {passwordStrength.feedback.map((item, i) => (
                        <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-9 bg-[#0a0a12] border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400"
                  autoComplete="new-password"
                />
              </div>
              {confirmPassword && (
                <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-lime-400' : 'text-red-400'}`}>
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className={cn(
                "w-full bg-cyan-500 text-black font-bold",
                "shadow-[0_0_15px_rgba(0,255,255,0.4)]",
                "hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]",
                "disabled:opacity-50 disabled:shadow-none",
                "transition-all duration-200"
              )}
              disabled={!canSubmit || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
