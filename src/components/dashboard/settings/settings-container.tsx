"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Shield, 
  Bell, 
  Monitor, 
  Lock, 
  Key, 
  Smartphone,
  Save,
  Globe,
  Camera,
  Settings,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';

/**
 * AJN Account Hub Container
 * Billing tab removed as all tools are free.
 */
export function SettingsContainer() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-950 font-sans">
      <header className="h-16 border-b border-black/5 bg-white/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-sm font-black tracking-tighter uppercase">Account Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">System Preferences</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto p-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col lg:flex-row gap-12">
            <aside className="w-full lg:w-64 shrink-0">
              <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-1 items-start">
                {[
                  { id: 'profile', icon: User, label: 'MY PROFILE' },
                  { id: 'security', icon: Shield, label: 'SECURITY' },
                  { id: 'preferences', icon: Monitor, label: 'PREFERENCES' },
                  { id: 'notifications', icon: Bell, label: 'NOTIFICATIONS' },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl text-slate-400 font-black text-[10px] tracking-widest gap-3 transition-all"
                  >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </aside>

            <main className="flex-1 min-w-0">
              {/* PROFILE TAB */}
              <TabsContent value="profile" className="m-0 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <section className="space-y-6">
                  <div className="flex items-center gap-8 p-8 bg-white/60 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-2 border-white ring-8 ring-primary/5">
                        <AvatarImage src={user?.photoURL || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black">U</AvatarFallback>
                      </Avatar>
                      <button className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase tracking-tighter text-slate-950">{user?.displayName || 'USER PROFILE'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Member since {new Date().getFullYear()}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 border-black/5 bg-white text-[9px] font-black uppercase rounded-lg">Change Photo</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-red-400 hover:text-red-500 text-[9px] font-black uppercase rounded-lg">Remove</Button>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-white/40 border-black/5 overflow-hidden rounded-[2.5rem] shadow-xl backdrop-blur-xl">
                    <CardContent className="p-10 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                          <Input defaultValue={user?.displayName || ""} className="h-12 bg-white/50 border-black/5 rounded-2xl font-bold px-6" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                          <Input defaultValue={user?.email || ""} disabled className="h-12 bg-black/5 border-black/5 rounded-2xl font-bold px-6 opacity-50" />
                        </div>
                      </div>
                      <div className="pt-6 border-t border-black/5 flex justify-end">
                        <Button className="bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest px-10 h-12 rounded-xl shadow-xl gap-2 transition-all">
                          <Save className="w-4 h-4" /> Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </TabsContent>

              {/* SECURITY TAB */}
              <TabsContent value="security" className="m-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-black tracking-tight uppercase">Authentication</h2>
                  </div>
                  <Card className="bg-white/40 border-black/5 rounded-[2.5rem] shadow-xl backdrop-blur-xl">
                    <CardContent className="p-0">
                      <div className="divide-y divide-black/5">
                        <div className="p-8 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-black text-sm uppercase tracking-tight">Two-Factor Authentication</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Add an extra layer of protection to your account.</p>
                          </div>
                          <Button variant="outline" className="border-black/5 bg-white font-black text-[10px] uppercase tracking-widest gap-2 rounded-xl h-10 px-6">
                            <Smartphone className="w-3.5 h-3.5" /> CONFIGURE
                          </Button>
                        </div>
                        <div className="p-8 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-black text-sm uppercase tracking-tight">Update Password</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your primary access credentials.</p>
                          </div>
                          <Button variant="outline" className="border-black/5 bg-white font-black text-[10px] uppercase tracking-widest gap-2 rounded-xl h-10 px-6">
                            <Key className="w-3.5 h-3.5" /> UPDATE
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-black tracking-tight uppercase">Active Sessions</h2>
                  </div>
                  <Card className="bg-white/40 border-black/5 rounded-[2.5rem] overflow-hidden shadow-xl backdrop-blur-xl">
                    <CardContent className="p-0">
                      <div className="p-6 bg-emerald-500/5 border-b border-black/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-white rounded-xl border border-black/5"><Monitor className="w-5 h-5 text-primary" /></div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-tight">Current Browser</p>
                            <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">ACTIVE CONNECTION • INDIA</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </TabsContent>

              {/* PREFERENCES TAB */}
              <TabsContent value="preferences" className="m-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-black tracking-tight uppercase">System Preferences</h2>
                  </div>
                  <Card className="bg-white/40 border-black/5 rounded-[2.5rem] shadow-xl backdrop-blur-xl">
                    <CardContent className="p-10 space-y-10">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-black text-sm uppercase tracking-tight text-slate-950">Automatic Archive Save</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Always save processed files to my persistent library.</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-black text-sm uppercase tracking-tight text-slate-950">Real-time Notifications</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Notify when background operations complete.</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-black text-sm uppercase tracking-tight text-slate-950">System Privacy Shield</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mask sensitive filenames during screen-share.</p>
                        </div>
                        <Switch className="data-[state=checked]:bg-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </TabsContent>
            </main>
          </Tabs>
        </div>
      </div>

      <footer className="p-6 border-t border-black/5 bg-white/20 flex items-center justify-center gap-2">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/10">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Secure Sync Verified</span>
        </div>
        <div className="h-4 w-px bg-black/5 mx-2" />
        <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.4em]">AJN Account Hub • 2026</span>
      </footer>
    </div>
  );
}
