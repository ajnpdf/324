"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Terminal, Send, Trash2, RefreshCw, Layers, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function APISandbox() {
  const [isSandbox, setIsSandbox] = useState(true);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));
    setResponse({
      id: "job_sandbox_" + Math.random().toString(36).substring(7),
      event: "conversion.complete",
      status: "complete",
      output_url: "https://api.ajnpdf.com/sandbox/download/signed-token-123",
      file_size: 1048576,
      processing_time_ms: 4230,
      timestamp: new Date().toISOString()
    });
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-6">
          <section className="p-6 bg-primary/10 rounded-[2rem] border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Interactive Sandbox</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No quota consumed in this environment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-primary">SANDBOX MODE</span>
              <Switch checked={isSandbox} onCheckedChange={setIsSandbox} />
            </div>
          </section>

          <Card className="bg-card/40 border-white/5 overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-white/5 border-b border-white/5 px-8 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Request Builder
                </CardTitle>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[8px] uppercase">POST /V1/CONVERT</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
{`{
  "files": ["test_sample_image.png"],
  "target_format": "webp",
  "settings": {
    "quality": 85,
    "dpi": 300,
    "strip_metadata": true
  }
}`}
                </pre>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={runTest} 
                  disabled={loading}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 font-black text-xs gap-2 shadow-xl shadow-primary/20 rounded-xl"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  EXECUTE SANDBOX REQUEST
                </Button>
                <Button variant="outline" className="h-12 border-white/10 bg-white/5 px-6 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-[400px] flex flex-col gap-4">
          <div className="px-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Response Output
            </h3>
          </div>
          <Card className="flex-1 bg-black/40 border-white/5 relative overflow-hidden flex flex-col min-h-[400px] rounded-[2.5rem]">
            <CardContent className="p-0 flex flex-col h-full">
              {!response && !loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-40">
                  <Terminal className="w-12 h-12" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Execute a request to see output</p>
                </div>
              ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Waiting for network response...</p>
                </div>
              ) : (
                <ScrollArea className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[8px] font-black">200 OK</Badge>
                    <span className="text-[9px] font-mono opacity-40">1.2s</span>
                  </div>
                  <pre className="text-[10px] font-mono text-blue-300 leading-relaxed">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
