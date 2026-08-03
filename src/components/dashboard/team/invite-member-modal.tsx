
"use client";

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Mail, CheckCircle2, UserPlus, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberModal({ open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  const handleClose = () => {
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-2xl border-white/10">
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <DialogHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight">Expand the Team</DialogTitle>
              <DialogDescription>
                Send invitations to collaborate in your Business workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Email Addresses</Label>
                <Input placeholder="name@company.com, separate with commas" required className="h-11 bg-white/5 border-white/10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Assigned Role</Label>
                <Select defaultValue="editor">
                  <SelectTrigger className="bg-white/5 border-white/10 h-11 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="admin">Admin (Full Control)</SelectItem>
                    <SelectItem value="editor">Editor (Can edit & share)</SelectItem>
                    <SelectItem value="viewer">Viewer (View only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Custom Message (Optional)</Label>
                <Textarea placeholder="Join our universal file workspace..." className="bg-white/5 border-white/10 min-h-[100px]" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose} className="font-bold text-xs">CANCEL</Button>
              <Button disabled={loading} className="bg-brand-gradient hover:opacity-90 font-black text-xs px-8 shadow-xl shadow-primary/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "SEND INVITATIONS"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black">Invites Sent!</h3>
              <p className="text-muted-foreground text-sm font-medium">Invitation links have been dispatched. They will expire in 7 days.</p>
            </div>
            <Button onClick={handleClose} className="w-full h-12 bg-white/5 hover:bg-white/10 border-white/10 font-black text-xs">
              DONE
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
