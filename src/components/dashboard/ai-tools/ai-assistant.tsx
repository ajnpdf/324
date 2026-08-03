"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Zap, 
  History as HistoryIcon,
  Upload,
  X,
  ShieldCheck,
  Loader2,
  Activity,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { runFileSmartAction } from '@/ai/flows/file-intelligence';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  nextSteps?: string[];
  type?: string;
}

export function AIAssistant() {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'upload' | 'ready' | 'done'>('upload');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleFile = (newFile: File) => {
    if (newFile.type !== 'application/pdf') return;
    setFile(newFile);
    setPhase('ready');
    setMessages([{
      role: 'assistant',
      content: `File **${newFile.name}** uploaded. I am ready to help you. Select an action or ask me anything.`,
      nextSteps: ['Summarize PDF', 'Translate Content', 'Generate Questions']
    }]);
  };

  const handleAction = async (action: string, type: any = 'text') => {
    if (!file) return;
    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', content: action }]);

    try {
      const toolId = action === 'Summarize PDF' ? 'summarizer' : 
                     action === 'Translate Content' ? 'translator' :
                     action === 'Generate Questions' ? 'quiz' : 'semantic';

      const result = await runFileSmartAction({
        toolId: toolId as any,
        content: `User Request: ${action}. File context: ${file.name}`,
        config: { targetLanguage: 'Spanish', length: 'medium' }
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.resultText,
        type,
        nextSteps: result.suggestedNextSteps
      }]);
      
      if (action.toLowerCase().includes('complete') || action.toLowerCase().includes('done')) {
        setPhase('done');
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I had a problem. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const onSend = () => {
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    handleAction(msg);
  };

  return (
    <div className="flex h-full bg-transparent overflow-hidden font-sans text-slate-950">
      <aside className="w-80 border-r border-black/5 bg-white/40 backdrop-blur-2xl flex flex-col shrink-0 z-30 hidden lg:flex">
        <header className="p-6 border-b border-black/5 bg-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-sm font-black tracking-tighter uppercase">Smart Hub</h2>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Intelligent Layer</p>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-10">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1">How To Use</h3>
              <div className="space-y-3">
                {[
                  { icon: Upload, label: "Upload PDF", desc: "Add your file to the assistant." },
                  { icon: Activity, label: "Select Action", desc: "Click a button or type a request." },
                  { icon: Zap, label: "Fast Result", desc: "Get your answer in seconds." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white/60 border border-black/5 rounded-2xl shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <step.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-black uppercase tracking-tight">{step.label}</p>
                      <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] space-y-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Privacy Shield</span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                Files are processed locally. Nothing is stored permanently.
              </p>
            </div>
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30 relative">
        <header className="h-16 border-b border-black/5 bg-white/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black tracking-tighter uppercase italic">Smart <span className="text-primary">Assistant</span></h1>
            {file && <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black px-3 h-6 uppercase rounded-full">{file.name}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400"><HistoryIcon className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400" onClick={() => { setFile(null); setMessages([]); setPhase('upload'); }}><X className="w-4 h-4" /></Button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          {phase === 'upload' ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); } }
                onDrop={(e) => { 
                  e.preventDefault(); 
                  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); 
                }}
                className="w-full max-w-xl aspect-[1.6/1] rounded-[3rem] border-4 border-dashed border-black/5 bg-white/40 backdrop-blur-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all duration-700 shadow-2xl group"
              >
                <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl border border-black/5 group-hover:scale-110 transition-transform duration-700">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="mt-8 text-center space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase leading-none">Add PDF</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Use Smart Assistant</p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="max-w-4xl mx-auto p-10 space-y-8">
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%] p-6 rounded-[2rem] shadow-sm space-y-4", msg.role === 'user' ? "bg-primary text-white" : "bg-white border border-black/5")}>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        {msg.nextSteps && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {msg.nextSteps.map((step, idx) => (<button key={idx} onClick={() => handleAction(step)} className="px-4 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary transition-all flex items-center gap-2">{step} <ArrowRight className="w-3 h-3" /></button>))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-black/5 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Consulting Neurons...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-8 bg-white/40 backdrop-blur-3xl border-t border-black/5">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="relative group">
                    <Input placeholder="Ask a question..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }} className="h-16 pl-6 pr-16 bg-white/80 border-black/10 rounded-2xl shadow-xl font-bold text-base" />
                    <button onClick={onSend} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg"><Send className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
