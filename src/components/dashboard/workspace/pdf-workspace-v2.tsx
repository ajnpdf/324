"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  LayoutGrid, 
  List, 
  History, 
  Zap, 
  FileText, 
  Download, 
  Plus,
  ArrowRight,
  Loader2,
  X,
  Upload,
  Scissors,
  Shrink,
  Maximize,
  ShieldCheck,
  RefreshCcw
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  addDocumentNonBlocking, 
  useMemoFirebase 
} from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { engine } from "@/lib/engine";

function ToolModal({ tool, onClose, onJobDone }: { tool: any, onClose: () => void, onJobDone: (j: any) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<'idle' | 'processing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const run = async () => {
    if (files.length === 0) return;
    setPhase('processing');
    setProgress(0);

    try {
      const res = await engine.runTool(tool.id, files, {}, (p: any) => {
        setProgress(p.pct);
      });
      
      if (res.success && res.blob) {
        setResult(res);
        setPhase('done');
        onJobDone({
          tool: tool.id,
          toolLabel: tool.label,
          files: files.map(f => f.name),
          result: {
            outputName: res.fileName,
            size: (res.byteLength! / (1024 * 1024)).toFixed(2) + " MB"
          }
        });
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      toast({ title: "Process failed", description: err.message || "Internal system error.", variant: "destructive" });
      setPhase('idle');
    }
  };

  const handleDownload = () => {
    if (!result?.blob) return;
    engine.download(result.blob, result.fileName);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-xl bg-white border-black/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <header className="p-8 border-b border-black/5 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-current/10", tool.bg, tool.color)}>
              <tool.icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-slate-950">{tool.label}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tool.desc}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <CardContent className="p-10">
          {phase === 'idle' && (
            <div className="space-y-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "h-[300px] rounded-[2rem] border-4 border-dashed border-black/5 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all group shadow-inner"
                )}
              >
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFiles} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-black/5 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <p className="mt-6 text-sm font-black uppercase tracking-widest text-slate-900">Add assets</p>
              </div>
              <Button onClick={run} disabled={files.length === 0} className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl gap-3">
                <Zap className="w-4 h-4" /> Start Process
              </Button>
            </div>
          )}

          {phase === 'processing' && (
            <div className="py-12 flex flex-col items-center space-y-8 text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="w-full max-w-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Executing Process</span><span className="text-xl font-black text-primary tracking-tighter">{Math.round(progress)}%</span></div>
                <Progress value={progress} className="h-1.5 bg-black/5" />
              </div>
            </div>
          )}

          {phase === 'done' && result && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center">
              <div className="flex justify-center -mb-8 -mt-8">
                {mounted && (
                  /* @ts-expect-error dotlottie-wc is a custom element */
                  <dotlottie-wc src="https://lottie.host/3d8a349c-715a-4ff4-85eb-bf78eeae75f0/OSNp1pdFqB.lottie" style={{ width: '250px', height: '250px' }} autoplay loop />
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Conversion Completed 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your file is ready for download</p>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border border-black/5 hover:bg-black/5 transition-all">Exit</button>
                <Button onClick={handleDownload} className="flex-[2] h-12 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg gap-2">
                  <Download className="w-4 h-4" /> Download Result
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const TOOLS = [
  { id: "compress-pdf", cat: "optimize", label: "Compress PDF", desc: "Reduce size while keeping it clear", from: "PDF", to: "PDF", color: "text-orange-600", bg: "bg-orange-500/10", icon: Shrink, hot: true },
  { id: "image-resizer", cat: "optimize", label: "Resize Image", desc: "Change pixels and size", from: "IMG", to: "JPG", color: "text-indigo-600", bg: "bg-indigo-500/10", icon: Maximize, hot: true },
  { id: "image-reducer", cat: "optimize", label: "Reduce Image", desc: "Set target KB size", from: "IMG", to: "JPG", color: "text-blue-600", bg: "bg-blue-500/10", icon: Shrink, hot: true },
  { id: "jpg-pdf", cat: "convert", label: "JPG to PDF", desc: "Turn pictures into PDF", from: "JPG", to: "PDF", color: "text-amber-600", bg: "bg-amber-500/10", icon: FileText, hot: true },
  { id: "merge-pdf", cat: "edit", label: "Merge PDF", desc: "Join files together", from: "PDF", to: "PDF", color: "text-blue-600", bg: "bg-blue-500/10", icon: Plus, hot: true },
  { id: "pdf-excel", cat: "extract", label: "PDF to Excel", desc: "Get tables as sheets", from: "PDF", to: "XLS", color: "text-emerald-700", bg: "bg-emerald-700/10", icon: FileText, hot: false },
  { id: "pdf-jpg", cat: "extract", label: "PDF to JPG", desc: "Save pages as images", from: "PDF", to: "JPG", color: "text-red-600", bg: "bg-red-500/10", icon: FileText, hot: false },
  { id: "excel-pdf", cat: "convert", label: "Excel to PDF", desc: "Turn sheets into document", from: "XLSX", to: "PDF", color: "text-emerald-700", bg: "bg-emerald-700/10", icon: FileText, hot: false },
  { id: "split-pdf", cat: "edit", label: "Split PDF", desc: "Cut pages into new files", from: "PDF", to: "PDF", color: "text-purple-600", bg: "bg-purple-500/10", icon: Scissors, hot: false },
];

const CATS = [
  { id: "all",      label: "All Tools" },
  { id: "edit",     label: "Combine & Split" },
  { id: "convert",  label: "Creation" },
  { id: "extract",  label: "Extraction" },
  { id: "optimize", label: "Scale & Optimize" },
];

export default function PDFWorkspaceV2() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarTab, setSidebarTab] = useState("tools");
  const [activeTool, setActiveTool] = useState<any | null>(null);

  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "users", user.uid, "conversionJobs"),
      orderBy("startTime", "desc")
    );
  }, [firestore, user]);

  const { data: historyData, isLoading: historyLoading } = useCollection<any>(historyQuery);

  const addJob = async (j: any) => {
    if (!user || !firestore) return;
    addDocumentNonBlocking(collection(firestore, "users", user.uid, "conversionJobs"), {
      userId: user.uid,
      toolId: j.tool,
      toolLabel: j.toolLabel,
      sourceFiles: j.files,
      outputName: j.result.outputName,
      status: "completed",
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      targetFormat: "PDF",
      sourceFormat: "PDF"
    });
  };

  const filteredTools = TOOLS.filter(t => {
    const matchesCat = activeCat === "all" || t.cat === activeCat;
    const matchesSearch = t.label.toLowerCase().includes(search.toLowerCase()) || 
                         t.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col font-sans text-slate-900 overflow-hidden bg-transparent">
      <header className="h-16 border-b border-black/5 bg-white/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-sm font-black tracking-tight uppercase">Archive</h1>
          </div>
          <div className="h-6 w-px bg-black/5 mx-2" />
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input 
              placeholder="Search library..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-slate-100/50 border-transparent text-[10px] font-black uppercase tracking-widest rounded-xl"
            />
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <div className="bg-slate-100/50 p-1 rounded-xl flex gap-1 shadow-inner">
            <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={cn("h-7 w-7 rounded-lg", viewMode === 'grid' && "bg-white text-primary shadow-sm")}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={cn("h-7 w-7 rounded-lg", viewMode === 'list' && "bg-white text-primary shadow-sm")}>
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="h-8 w-px bg-black/5 mx-1" />
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-lg">
            {user.displayName?.charAt(0) || 'U'}
          </div>
        </nav>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-60 border-r border-black/5 bg-white/40 backdrop-blur-2xl flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
            {[
              { id: 'tools', icon: LayoutGrid, label: 'All Tools' },
              { id: 'recent', icon: History, label: 'History' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSidebarTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                  sidebarTab === item.id ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </div>
          <div className="p-6 border-t border-black/5 bg-slate-50/20">
            <div className="p-4 bg-white/60 rounded-2xl border border-black/5 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[9px] font-black uppercase tracking-widest">Safe Systems</span>
              </div>
              <p className="text-[8px] font-bold text-slate-400 leading-relaxed">Local processing keeps data private.</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50/30 p-10">
          {sidebarTab === "tools" ? (
            <div className="space-y-10">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                {CATS.map(c => (
                  <button key={c.id} onClick={() => setActiveCat(c.id)} className={cn(
                    "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap",
                    activeCat === c.id ? "bg-primary border-primary text-white shadow-md" : "bg-white border-black/5 text-slate-400 hover:border-primary/20"
                  )}>
                    {c.label}
                  </button>
                ))}
              </div>

              <motion.div layout className={cn("gap-4", viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "flex flex-col")}>
                <AnimatePresence mode="popLayout">
                  {filteredTools.map((tool) => (
                    <motion.div key={tool.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ y: -5 }}>
                      <Card onClick={() => setActiveTool(tool)} className="group cursor-pointer overflow-hidden border-2 rounded-[1.5rem] bg-white/60 hover:border-primary/40 transition-all shadow-sm">
                        <CardContent className="p-5 flex flex-col h-full gap-3">
                          <div className="flex items-start justify-between">
                            <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-md border border-black/5 group-hover:scale-110 bg-white", tool.color)}>
                              <tool.icon className="w-5 h-5" />
                            </div>
                            <Badge className="bg-primary/5 text-primary border-none text-[8px] font-bold px-2 h-4.5 rounded-full uppercase">{tool.from} &rarr; {tool.to}</Badge>
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <h4 className="text-xs font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{tool.label}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-2 leading-relaxed">{tool.desc}</p>
                          </div>
                          <div className="pt-3 border-t border-black/5 mt-2 flex items-center justify-end">
                            <div className="flex items-center gap-2 group-hover:text-primary transition-all">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary">Try Now</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-2xl font-black uppercase tracking-tighter">History</h2>
              {historyLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-40">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Loading history...</p>
                </div>
              ) : (!historyData || historyData.length === 0) ? (
                <div className="py-32 text-center bg-white/40 border border-dashed border-black/5 rounded-[3rem] opacity-40">
                  <History className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No history found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {historyData.map((job: any) => (
                    <Card key={job.id} className="bg-white/60 border-black/5 hover:border-primary/20 transition-all rounded-2xl">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-black/5 text-slate-400">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black uppercase truncate text-slate-950">{job.outputName}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{job.toolLabel}</p>
                          </div>
                        </div>
                        <button onClick={() => job.outputUrl && window.open(job.outputUrl)} className="h-10 w-10 text-slate-400 hover:text-primary rounded-xl flex items-center justify-center bg-black/5 hover:bg-black/10 transition-all">
                          <Download className="w-5 h-5" />
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      {activeTool && <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} onJobDone={addJob} />}
    </div>
  );
}
