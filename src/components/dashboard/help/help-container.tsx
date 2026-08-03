
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Zap, 
  ChevronRight, 
  ExternalLink,
  LifeBuoy
} from 'lucide-react';

const faqCategories = [
  { title: 'Getting Started', count: 12, icon: Zap },
  { title: 'File Conversions', count: 42, icon: BookOpen },
  { title: 'Security & Privacy', count: 8, icon: LifeBuoy },
  { title: 'Team Collaboration', count: 15, icon: MessageSquare },
];

export function HelpContainer() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <HelpCircle className="w-6 h-6 text-black" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-sm font-black tracking-tighter uppercase">Help Center</h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">System Support Core</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto p-10 space-y-12">
          {/* SEARCH HERO */}
          <section className="text-center space-y-8 py-12">
            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter uppercase">How can we help?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto font-medium uppercase text-[10px] tracking-[0.2em]">Search our knowledge network for instant solutions</p>
            </div>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search for articles, guides, or formats..." 
                className="h-16 pl-12 bg-white/5 border-white/10 rounded-2xl text-lg font-bold focus:ring-white/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </section>

          {/* CATEGORIES GRID */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {faqCategories.map((cat) => (
              <Card key={cat.title} className="bg-card/40 border-white/5 hover:border-white/20 transition-all cursor-pointer group rounded-[2rem]">
                <CardContent className="p-8 space-y-6">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-tighter">{cat.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold">{cat.count} ARTICLES</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* POPULAR ARTICLES */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 px-4">Popular Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Maximizing quality in PDF compression',
                'Understanding Neural OCR confidence scores',
                'Integrating Webhooks into your workspace',
                'Bulk renaming with dynamic tokens',
                'Team permission inheritance models',
                'Managing API rate limits for Business users',
              ].map((article) => (
                <div key={article} className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <FileText className="w-4 h-4 text-muted-foreground group-hover:text-white" />
                    <span className="text-sm font-bold tracking-tight">{article}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </section>

          {/* SUPPORT CTA */}
          <section className="p-10 bg-white text-black rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Still stuck?</h3>
              <p className="text-sm font-medium opacity-70 uppercase tracking-widest">Connect with our specialized engineering team.</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-black text-white hover:bg-black/90 font-black text-xs h-14 px-10 rounded-2xl uppercase tracking-widest">
                OPEN SUPPORT TICKET
              </Button>
              <Button variant="outline" className="border-black/20 text-black hover:bg-black/5 font-black text-xs h-14 px-10 rounded-2xl uppercase tracking-widest">
                LIVE CHAT
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
