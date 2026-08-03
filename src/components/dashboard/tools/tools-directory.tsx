'use client';

import { useState } from 'react';
import { 
  Repeat, 
  Box, 
  FileText, 
  FileCode, 
  Database, 
  Presentation, 
  ImageIcon, 
  Video, 
  Music, 
  BrainCircuit, 
  Scan, 
  Layers, 
  Terminal, 
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Wand2,
  X,
  Info,
  Activity,
  Code2,
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type LogicStep = {
  label: string;
  desc: string;
};

type ToolEntry = {
  id: string;
  name: string;
  desc: string;
  icon: any;
  href: string;
  tags: string[];
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';
  stack: string;
  logicSteps: LogicStep[];
  outputMime: string;
};

type ToolCategory = {
  id: string;
  title: string;
  description: string;
  icon: any;
  tools: ToolEntry[];
};

const categories: ToolCategory[] = [
  {
    id: 'core',
    title: "Universal Core",
    description: "Multi-file batch processing and format conversion.",
    icon: Zap,
    tools: [
      { 
        id: 'converter', 
        name: 'Converter', 
        desc: 'Universal engine for 300+ formats.', 
        icon: Repeat, 
        href: '/dashboard/convert', 
        tags: ['Core', 'WASM'],
        complexity: 'MEDIUM',
        stack: 'WebAssembly + Native JS',
        outputMime: 'Multi-format',
        logicSteps: [
          { label: "File Detection", desc: "Binary analysis to identify file type." },
          { label: "Processing Route", desc: "Mapping file to correct processing thread." },
          { label: "Buffer Creation", desc: "Setting up private memory for processing." },
          { label: "Execution", desc: "Running the conversion sequence." }
        ]
      },
      { 
        id: 'batch', 
        name: 'Batch Center', 
        desc: 'Process many files at once.', 
        icon: Box, 
        href: '/dashboard/tools/batch', 
        tags: ['Automation'],
        complexity: 'HIGH',
        stack: 'JobQueue + Worker Threads',
        outputMime: 'application/zip',
        logicSteps: [
          { label: "Queue Setup", desc: "Sorting files for parallel work." },
          { label: "Worker Launch", desc: "Starting background processing instances." },
          { label: "Data Collection", desc: "Gathering results for the final package." },
          { label: "ZIP Packaging", desc: "Saving all files into a compressed folder." }
        ]
      },
    ]
  },
  {
    id: 'document',
    title: "Documents",
    description: "Professional editing, signing, and file cleanup.",
    icon: FileText,
    tools: [
      { 
        id: 'pdf', 
        name: 'PDF Master', 
        desc: 'Edit, sign, and clean up documents.', 
        icon: FileText, 
        href: '/dashboard/pdf-editor', 
        tags: ['Editor', 'E-Sign'],
        complexity: 'HIGH',
        stack: 'pdf-lib + PDF.js',
        outputMime: 'application/pdf',
        logicSteps: [
          { label: "Layer Separation", desc: "Isolating content from form elements." },
          { label: "Mapping", desc: "Converting coordinates for precise placement." },
          { label: "Signature", desc: "Applying digital signatures safely." },
          { label: "Optimization", desc: "Cleaning the file for better storage." }
        ]
      },
      { 
        id: 'ocr', 
        name: 'OCR Vision', 
        desc: 'Turn scans into searchable text.', 
        icon: Scan, 
        href: '/dashboard/tools/ai', 
        tags: ['Vision', 'AI'],
        complexity: 'VERY HIGH',
        stack: 'Tesseract.js WASM',
        outputMime: 'application/pdf',
        logicSteps: [
          { label: "Pre-processing", desc: "Cleaning the image for better recognition." },
          { label: "Neural Scan", desc: "AI analysis of character shapes." },
          { label: "Coordinate Mapping", desc: "Locating text on the page." },
          { label: "Text Layer", desc: "Creating a selectable layer over the scan." }
        ]
      },
    ]
  },
  {
    id: 'media',
    title: "Media Studio",
    description: "Fast local processing for images, video and audio.",
    icon: Video,
    tools: [
      { 
        id: 'video', 
        name: 'Video Lab', 
        desc: 'Professional video transcoding.', 
        icon: Video, 
        href: '/dashboard/tools/video', 
        tags: ['FFmpeg', '4K'],
        complexity: 'VERY HIGH',
        stack: 'FFmpeg.wasm',
        outputMime: 'video/mp4',
        logicSteps: [
          { label: "Engine Load", desc: "Loading the processing core into the browser." },
          { label: "Buffer Write", desc: "Writing video data to local memory." },
          { label: "Setting Map", desc: "Applying selected format and quality rules." },
          { label: "Encoding", desc: "Fast local video transformation." }
        ]
      },
      { 
        id: 'audio', 
        name: 'Audio Studio', 
        desc: 'Edit audio and convert formats.', 
        icon: Music, 
        href: '/dashboard/tools/audio', 
        tags: ['WAV', 'MP3'],
        complexity: 'MEDIUM',
        stack: 'Web Audio API + FFmpeg',
        outputMime: 'audio/mpeg',
        logicSteps: [
          { label: "Waveform Check", desc: "Visualizing audio peaks for editing." },
          { label: "Resampling", desc: "Changing audio frequency locally." },
          { label: "Compression", desc: "Reducing file size while keeping clarity." },
          { label: "Tagging", desc: "Preserving file information and metadata." }
        ]
      },
    ]
  },
  {
    id: 'technical',
    title: "Technical Tools",
    description: "Specialized tools for code and engineering data.",
    icon: Terminal,
    tools: [
      { 
        id: 'cad', 
        name: 'CAD Preview', 
        desc: 'Process DXF and STL blueprints.', 
        icon: Layers, 
        href: '/dashboard/convert?cat=3D/CAD', 
        tags: ['Engineering'],
        complexity: 'HIGH',
        stack: 'Three.js + DxfParser',
        outputMime: 'model/obj',
        logicSteps: [
          { label: "Data Parsing", desc: "Reading mathematical blueprint segments." },
          { label: "Surface Calc", desc: "Building 3D faces from data points." },
          { label: "Mesh Build", desc: "Creating the final geometry structure." },
          { label: "Export", desc: "Saving to a universal 3D format." }
        ]
      },
      { 
        id: 'code', 
        name: 'Data Format', 
        desc: 'Convert JSON, XML, and YAML.', 
        icon: Terminal, 
        href: '/dashboard/convert?cat=Code', 
        tags: ['DevOps'],
        complexity: 'LOW',
        stack: 'DOMParser + js-yaml',
        outputMime: 'application/json',
        logicSteps: [
          { label: "Breakdown", desc: "Parsing text into data structures." },
          { label: "Transformation", desc: "Converting between different formats." },
          { label: "Cleanup", desc: "Ensuring the output is valid and clean." },
          { label: "Formatting", desc: "Applying proper spacing and indenting." }
        ]
      },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.08
    } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { duration: 0.2 } 
  }
};

export function ToolsDirectory() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [inspectingTool, setInspectingTool] = useState<ToolEntry | null>(null);

  const filteredCategories = categories.map(cat => ({
    ...cat,
    tools: cat.tools.filter(t => 
      (activeTab === 'all' || cat.id === activeTab) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) || 
       t.desc.toLowerCase().includes(search.toLowerCase()) ||
       t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    )
  })).filter(cat => cat.tools.length > 0);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />

      <header className="h-24 border-b border-white/5 bg-background/40 backdrop-blur-xl flex flex-col justify-center px-8 shrink-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Cpu className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Tool Directory</h1>
                <p className="text-[10px] text-muted-foreground font-black tracking-[0.3em] uppercase mt-1">AJN Dashboard</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/10 hidden lg:block" />

            <div className="relative max-w-md w-full group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input 
                placeholder="Search tools..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 bg-white/5 border-white/10 text-xs font-bold focus:ring-primary/50 rounded-2xl w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden lg:block">
              <TabsList className="bg-white/5 border border-white/10 h-11 p-1 rounded-2xl">
                <TabsTrigger value="all" className="text-[9px] font-black uppercase px-4 h-9 rounded-xl">All Tools</TabsTrigger>
                {categories.map(c => (
                  <TabsTrigger key={c.id} value={c.id} className="text-[9px] font-black uppercase px-4 h-9 rounded-xl">{c.title}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">WASM Layer Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto p-10 space-y-16 pb-32">
          <AnimatePresence mode="popLayout">
            {filteredCategories.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 text-center space-y-6 opacity-40"
              >
                <Search className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-sm font-black uppercase tracking-widest">No matching tools found.</p>
              </motion.div>
            ) : (
              filteredCategories.map((cat, idx) => (
                <motion.section 
                  key={cat.id}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-colors">
                        <cat.icon className="w-6 h-6 text-white/60" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black uppercase tracking-tighter">{cat.title}</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cat.description}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {cat.tools.map((tool) => (
                      <motion.div 
                        key={tool.id} 
                        layout
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <Card 
                          onClick={() => setInspectingTool(tool)}
                          className="bg-card/40 backdrop-blur-xl border-white/5 hover:border-primary/40 transition-all group h-full cursor-pointer relative overflow-hidden flex flex-col border-2 shadow-sm hover:shadow-2xl rounded-[2rem]"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Workflow className="w-4 h-4 text-primary" />
                          </div>
                          
                          <CardContent className="p-8 flex flex-col h-full space-y-6">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/10">
                              <tool.icon className="w-7 h-7 text-white/80 group-hover:text-primary transition-colors" />
                            </div>

                            <div className="space-y-2 flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-black text-sm uppercase tracking-tighter group-hover:text-primary transition-colors">{tool.name}</h4>
                                <Badge variant="outline" className={cn(
                                  "text-[7px] font-black h-4 px-1.5 border-none",
                                  tool.complexity === 'LOW' ? 'bg-emerald-500/10 text-emerald-500' :
                                  tool.complexity === 'MEDIUM' ? 'bg-blue-500/10 text-blue-500' :
                                  'bg-orange-500/10 text-orange-500'
                                )}>
                                  {tool.complexity}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium uppercase tracking-wider line-clamp-2">
                                {tool.desc}
                              </p>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-auto">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">STABLE</span>
                              </div>
                              <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">View Logic</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {inspectingTool && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl"
            >
              <Card className="bg-card border-white/10 shadow-2xl relative overflow-hidden rounded-[3rem]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05)_0%,transparent_50%)] pointer-events-none" />
                
                <button 
                  onClick={() => setInspectingTool(null)}
                  className="absolute top-8 right-8 h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-50"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <CardContent className="p-12 space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20">
                      <inspectingTool.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black uppercase tracking-[0.2em] mb-2 px-3">
                        Processing Layer
                      </Badge>
                      <h2 className="text-3xl font-black tracking-tighter uppercase">{inspectingTool.name}</h2>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{inspectingTool.stack}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3">
                      <Activity className="w-4 h-4 text-primary" /> How it Works
                    </h3>
                    
                    <div className="space-y-4">
                      {inspectingTool.logicSteps.map((step, i) => (
                        <div key={i} className="flex gap-6 group relative">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] z-10 transition-colors group-hover:bg-primary group-hover:text-white">
                              {i + 1}
                            </div>
                            {i < inspectingTool.logicSteps.length - 1 && (
                              <div className="w-px flex-1 bg-white/10 i-2" />
                            )}
                          </div>
                          <div className="pb-6 space-y-1">
                            <h4 className="text-sm font-black uppercase tracking-tight text-white/90">{step.label}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-2">
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Complexity</p>
                      <p className="text-xl font-black text-white">{inspectingTool.complexity}</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-2">
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Output Format</p>
                      <p className="text-xs font-black text-primary truncate">{inspectingTool.outputMime}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => window.location.href = inspectingTool.href}
                      className="flex-1 h-14 bg-brand-gradient hover:opacity-90 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 rounded-2xl"
                    >
                      Open Tool <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14 px-8 border-white/10 bg-white/5 font-black text-xs uppercase tracking-widest rounded-2xl"
                    >
                      API Help
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="h-16 border-t border-white/5 bg-background/60 backdrop-blur-xl flex items-center justify-center px-8 shrink-0 z-20">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">
          All tools process data 100% locally in your browser
        </p>
      </footer>
    </div>
  );
}
