"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, Copy, Key, Info, Shield, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const mockKeys = [
  { id: '1', name: 'Production App', created: 'Jan 12, 2025', lastUsed: '2 mins ago', permissions: ['Convert', 'AI', 'PDF'], whitelist: '192.168.1.*' },
  { id: '2', name: 'Staging Environment', created: 'Jan 5, 2025', lastUsed: '1 hour ago', permissions: ['Convert', 'Image'], whitelist: 'Any' },
  { id: '3', name: 'Internal Tools', created: 'Dec 20, 2024', lastUsed: 'Yesterday', permissions: ['All'], whitelist: '10.0.0.0/24' },
];

export function APIKeys() {
  const [showGenerate, setShowGenerate] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleGenerate = () => {
    // Mock key generation
    setGeneratedKey('sufw_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  };

  const closeGenerator = () => {
    setShowGenerate(false);
    setGeneratedKey(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">API Key Management</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Authenticate your external applications</p>
        </div>
        <Button onClick={() => setShowGenerate(true)} className="bg-primary hover:bg-primary/90 font-black text-xs gap-2 px-6 shadow-xl shadow-primary/20">
          <Plus className="w-4 h-4" /> GENERATE NEW KEY
        </Button>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-white/5 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6 py-4">Key Name</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Created</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Last Used</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Permissions</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Whitelist</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockKeys.map((key) => (
                <TableRow key={key.id} className="border-white/5 group hover:bg-white/5">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Key className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">{key.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">{key.created}</TableCell>
                  <TableCell className="text-xs font-bold">{key.lastUsed}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {key.permissions.map(p => (
                        <Badge key={p} variant="outline" className="text-[8px] font-black border-white/10 bg-white/5 uppercase">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono opacity-60">{key.whitelist}</TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-start gap-4">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold">Key Security Best Practices</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Never commit your API keys to version control. Use environment variables. We recommend rotating keys every 90 days or if a team member with access leaves the company.
          </p>
        </div>
      </div>

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-2xl border-white/10">
          {!generatedKey ? (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Generate New Key</DialogTitle>
                <DialogDescription>Select permissions and whitelist for the new key.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Key Label</Label>
                  <Input placeholder="e.g. My Website App" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Permissions</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Convert Files', 'PDF Tools', 'AI Tools', 'File Read', 'File Write', 'Admin'].map(p => (
                      <div key={p} className="flex items-center gap-2">
                        <Checkbox id={p} />
                        <label htmlFor={p} className="text-xs font-bold cursor-pointer">{p}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest">IP Whitelist (Optional)</Label>
                  <Input placeholder="127.0.0.1, 192.168.1.*" className="bg-white/5 border-white/10" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleGenerate} className="w-full bg-brand-gradient hover:opacity-90 font-black text-xs h-12 shadow-xl shadow-primary/20">
                  GENERATE SECRET KEY
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-6 space-y-6 animate-in zoom-in-95 duration-500">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black">Key Generated Successfully</h3>
                <p className="text-xs text-muted-foreground">This is the only time you will see this key. Copy it now.</p>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                <code className="text-[10px] font-mono font-bold text-emerald-400 break-all flex-1">{generatedKey}</code>
                <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(generatedKey)} className="text-white hover:bg-white/10 h-8 w-8">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-500 font-bold leading-relaxed">
                  Store this key securely. If you lose it, you will need to rotate it to get a new one.
                </p>
              </div>
              <Button onClick={closeGenerator} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 font-black text-xs h-12">
                I&apos;ve copied the key
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
