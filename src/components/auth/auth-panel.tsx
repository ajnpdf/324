"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Chrome, Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ForgotPasswordFlow } from './forgot-password-flow';
import { useAuth, initiateEmailSignIn, initiateEmailSignUp, initiateGoogleSignIn } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

/**
 * AJN Account Access Hub
 * High-quality interaction for account management.
 */
export function AuthPanel() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handleGoogleAuth = () => {
    if (!auth) return;
    setLoading(true);
    try {
      initiateGoogleSignIn(auth);
    } catch {
      setLoading(false);
      toast({
        title: "Authentication Error",
        description: "Failed to initialize Google session.",
        variant: "destructive",
      });
    }
  };

  const handleAuth = async (e: React.FormEvent, type: 'signin' | 'signup') => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (type === 'signup') {
        initiateEmailSignUp(auth, email, password);
      } else {
        initiateEmailSignIn(auth, email, password);
      }
    } catch (err: any) {
      setLoading(false);
      toast({
        title: "Access Denied",
        description: err.message || "Credential synchronization failed.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 w-full max-w-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Access Hub</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          Sign in to your private workspace.
        </p>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-black/5 border border-black/5 p-1 mb-8 rounded-xl">
          <TabsTrigger value="signin" className="font-black text-[10px] uppercase tracking-widest rounded-lg">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="font-black text-[10px] uppercase tracking-widest rounded-lg">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-6 animate-in fade-in duration-300">
          <Button 
            onClick={handleGoogleAuth}
            disabled={loading}
            variant="outline" 
            className="w-full h-12 font-black text-[10px] uppercase tracking-widest gap-3 border-black/10 bg-white hover:bg-black/5 rounded-xl shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4 text-red-500" />}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-black/5"></span></div>
            <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.3em] text-slate-400">
              <span className="bg-white/0 px-4">Secure Sign In</span>
            </div>
          </div>

          <form onSubmit={(e) => handleAuth(e, 'signin')} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest ml-1">Email Address</Label>
              <Input name="email" type="email" placeholder="name@email.com" required className="h-11 bg-white/50 border-black/5 rounded-xl focus:ring-primary shadow-inner font-bold" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Password</Label>
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  className="h-11 bg-white/50 border-black/5 rounded-xl pr-10 focus:ring-primary shadow-inner font-bold" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button disabled={loading} className="w-full h-14 bg-primary text-white hover:opacity-90 font-black text-xs uppercase tracking-widest shadow-xl rounded-2xl gap-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Initialize Session</>}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-6 animate-in fade-in duration-300">
          <form onSubmit={(e) => handleAuth(e, 'signup')} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest ml-1">Email</Label>
              <Input name="email" type="email" placeholder="user@email.com" required className="h-11 bg-white/50 border-black/5 rounded-xl font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest ml-1">New Password</Label>
              <div className="relative">
                <Input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 8 characters" 
                  required 
                  className="h-11 bg-white/50 border-black/5 rounded-xl pr-10 font-bold" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed tracking-widest">
                By creating an account, you agree to our <span className="text-primary">Terms</span> and <span className="text-primary">Privacy Policy</span>.
              </p>
            </div>
            <Button disabled={loading} className="w-full h-14 bg-primary text-white hover:opacity-90 font-black text-xs uppercase tracking-widest shadow-xl rounded-2xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <ForgotPasswordFlow open={showForgotModal} onOpenChange={setShowForgotModal} />
    </div>
  );
}
