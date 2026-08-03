"use client";

import { useState } from 'react';
import { AITool } from './ai-tools-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Wand2, Copy, Download, Save, RefreshCw, BrainCircuit, ArrowRight } from 'lucide-react';
import { AIThinking } from './ai-thinking';
import { runFileSmartAction } from '@/ai/flows/file-intelligence';
import { Badge } from '@/components/ui/badge';

export function AIWorkspace({ tool }: { tool: AITool }) {
  const [state, setState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const [result, setResult] = useState<any>(null);
  const [config, setConfig] = useState<any>({
    length: 'medium',
    targetLanguage: 'Spanish',
    format: 'bullets'
  });

  const handleRun = async () => {
    setState('processing');
    try {
      const mockContent = tool.id === 'contract' ? 'This agreement is between AJN Corp and Alex Doe...' : 'Project Proposal: A plan to build a new workspace...';
      
      const output = await runFileSmartAction({
        toolId: tool.id as any,
        content: mockContent,
        config
      });
      
      await new Promise(r => setTimeout(r, 2000));
      setResult(output);
      setState('complete');
    } catch (err) {
      console.error(err);
      setState('idle');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-8">
        <Card className="bg-card/40 backdrop-blur-xl border-white/5 border-dashed border-2 overflow-hidden hover:border-primary/40 transition-colors cursor-pointer group">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-brand-gradient rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Select source for {tool.title}</h3>
              <p className="text-sm text-muted-foreground font-medium">Drop file or browse workspace library</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-[10px] font-bold">WORKSPACE</Button>
              <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-[10px] font-bold">EXTERNAL LINK</Button>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Wand2 className="w-3.5 h-3.5" /> Intelligence Parameters
          </h3>
          <Card className="bg-card/40 backdrop-blur-xl border-white/5">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tool.id === 'summarizer' && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Summary Length</Label>
                      <Select value={config.length} onValueChange={(v) => setConfig({...config, length: v})}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                          <SelectItem value="medium">Medium (Detailed bullets)</SelectItem>
                          <SelectItem value="long">Deep Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Output Format</Label>
                      <Select value={config.format} onValueChange={(v) => setConfig({...config, format: v})}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bullets">Bullet Points</SelectItem>
                          <SelectItem value="brief">Executive Brief</SelectItem>
                          <SelectItem value="narrative">Narrative Flow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {tool.id === 'translator' && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Target Language</Label>
                      <Select value={config.targetLanguage} onValueChange={(v) => setConfig({...config, targetLanguage: v})}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Formality</Label>
                      <Select defaultValue="neutral">
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="formal">Business Formal</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {(tool.id === 'contract' || tool.id === 'resume' || tool.id === 'categorize' || tool.id === 'semantic') && (
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Additional Context (Optional)</Label>
                    <Input placeholder="What specifically should we look for?" className="bg-white/5 border-white/10 h-12" />
                  </div>
                )}
              </div>

              <Button 
                onClick={handleRun}
                disabled={state === 'processing'}
                className="w-full h-14 bg-brand-gradient hover:opacity-90 mt-10 shadow-xl shadow-primary/20 font-black text-sm gap-3 uppercase tracking-tighter"
              >
                {state === 'processing' ? 'CONSULTING NEURAL NETWORK...' : `RUN ${tool.title.toUpperCase()}`}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-4">Output Panel</h3>
        <Card className="bg-primary/5 border-primary/20 h-full min-h-[400px] flex flex-col relative overflow-hidden">
          <CardContent className="p-0 flex flex-col h-full flex-1">
            {state === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-40">
                <BrainCircuit className="w-16 h-16 text-primary" />
                <p className="text-sm font-bold uppercase tracking-widest">Waiting for Input</p>
              </div>
            )}

            {state === 'processing' && <AIThinking />}

            {state === 'complete' && result && (
              <div className="flex-1 flex flex-col animate-in zoom-in-95 duration-500">
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-none font-black text-[8px] uppercase tracking-widest">SUCCESS</Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground">Confidence</span>
                    <span className="text-xs font-black text-emerald-500">{Math.round((result.confidence || 0.98) * 100)}%</span>
                  </div>
                </div>
                
                <div className="p-6 space-y-6 flex-1">
                  <div className="bg-black/40 rounded-2xl p-6 border border-white/5 font-medium text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap max-h-[300px] overflow-y-auto scrollbar-hide">
                    {result.resultText}
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold gap-2 text-xs uppercase tracking-widest">
                      <Download className="w-4 h-4" /> Download Result
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="border-white/10 bg-white/5 font-bold gap-2 text-[10px]">
                        <Copy className="w-3.5 h-3.5" /> COPY
                      </Button>
                      <Button variant="outline" className="border-white/10 bg-white/5 font-bold gap-2 text-[10px]">
                        <Save className="w-3.5 h-3.5" /> WORKSPACE
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-white/10 mt-auto">
                  <Button variant="ghost" onClick={() => setState('idle')} className="w-full text-[10px] font-black uppercase text-muted-foreground hover:text-primary gap-2">
                    <RefreshCw className="w-3 h-3" /> Analyze Another File
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
