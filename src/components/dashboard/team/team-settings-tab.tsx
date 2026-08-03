"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Building2, CreditCard, ShieldAlert, Trash2, Globe, Lock, Save } from 'lucide-react';

export function TeamSettingsTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Identity Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-black tracking-tight uppercase">Team Identity</h2>
        </div>
        <Card className="bg-card/40 backdrop-blur-xl border-white/5">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary/40 transition-colors">
                <Globe className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-[8px] font-black uppercase text-muted-foreground">UPLOAD LOGO</span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workspace Name</Label>
                  <Input defaultValue="Innovate Inc." className="h-11 bg-white/5 border-white/10 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Team Domain (SSO)</Label>
                  <Input defaultValue="innovate.io" className="h-11 bg-white/5 border-white/10 font-bold" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Security Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-black tracking-tight uppercase">Security & Privacy</h2>
        </div>
        <Card className="bg-card/40 backdrop-blur-xl border-white/5">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {[
                { title: 'Restrict file sharing to domain', desc: 'Only members with @innovate.io can view shared links.', default: true },
                { title: 'Enforce 2FA for all members', desc: 'Require two-factor authentication for workspace access.', default: true },
                { title: 'Automatic file deletion', desc: 'Wipe all processed files after 30 days of inactivity.', default: false },
                { title: 'AI Training Opt-Out', desc: 'Ensure team files are never used to train neural models.', default: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Billing Strip */}
      <Card className="bg-brand-gradient border-none overflow-hidden relative group">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-black text-xl tracking-tighter">Business Infrastructure</h4>
                <Badge className="bg-white/20 text-white border-none font-black text-[8px] h-4">ACTIVE</Badge>
              </div>
              <p className="text-sm font-medium opacity-80">$49.00/month • 12 active seats • Next billing: Feb 15</p>
            </div>
          </div>
          <Button className="bg-white text-primary hover:bg-white/90 font-black text-xs px-8 h-12 shadow-2xl">
            MANAGE BILLING
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <section className="space-y-4 pt-10">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h2 className="text-2xl font-black tracking-tight uppercase text-red-500">Danger Zone</h2>
        </div>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="font-black text-red-500 uppercase text-xs tracking-widest">Delete Team Workspace</p>
              <p className="text-[10px] text-muted-foreground font-medium">Permanently wipe all files, activity logs, and member associations. This cannot be undone.</p>
            </div>
            <Button variant="outline" className="border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white font-black text-xs h-11 px-8 gap-2">
              <Trash2 className="w-4 h-4" /> DELETE WORKSPACE
            </Button>
          </CardContent>
        </Card>
      </section>

      <div className="flex justify-end pt-10">
        <Button className="bg-primary hover:bg-primary/90 font-black text-xs h-14 px-12 gap-3 shadow-2xl shadow-primary/20 rounded-2xl">
          <Save className="w-5 h-5" /> SAVE GLOBAL SETTINGS
        </Button>
      </div>
    </div>
  );
}
