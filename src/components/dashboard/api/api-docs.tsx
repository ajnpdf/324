"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const endpoints = [
  { id: 'convert', method: 'POST', url: '/v1/convert', desc: 'Initialize a conversion job for one or more files.', params: [
    { name: 'files', type: 'Array', req: true, desc: 'List of file IDs or direct URLs' },
    { name: 'target_format', type: 'String', req: true, desc: 'Output extension (e.g. "pdf")' },
    { name: 'settings', type: 'Object', req: false, desc: 'Quality, DPI, etc.' },
  ]},
  { id: 'status', method: 'GET', url: '/v1/jobs/{id}', desc: 'Check the status and get the output URL of a job.', params: [
    { name: 'id', type: 'String', req: true, desc: 'Unique job identifier' },
  ]},
  { id: 'ai', method: 'POST', url: '/v1/ai/summarize', desc: 'Run neural summarization on a document.', params: [
    { name: 'file_id', type: 'String', req: true, desc: 'Source file ID' },
    { name: 'length', type: 'Enum', req: false, desc: 'short | medium | long' },
  ]},
];

export function APIDocs() {
  const [activeEndpoint, setActiveEndpoint] = useState(endpoints[0]);

  const codeSnippets: any = {
    curl: `curl -X POST https://api.ajnpdf.com/v1/convert \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "files": ["file_123"],
    "target_format": "pdf"
  }'`,
    node: `const response = await fetch('https://api.ajnpdf.com/v1/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    files: ['file_123'],
    target_format: 'pdf'
  })
});
const data = await response.json();`,
    python: `import requests

url = "https://api.ajnpdf.com/v1/convert"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
data = {
    "files": ["file_123"],
    "target_format": "pdf"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`
  };

  return (
    <div className="flex h-[600px] border border-white/5 rounded-[2rem] overflow-hidden bg-card/20 backdrop-blur-3xl">
      <aside className="w-[240px] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Guide</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <div className="space-y-1">
              <p className="px-3 mb-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Introduction</p>
              <Button variant="ghost" className="w-full justify-start text-[10px] font-bold hover:bg-black/5">Quick Start</Button>
              <Button variant="ghost" className="w-full justify-start text-[10px] font-bold hover:bg-black/5">Authentication</Button>
            </div>
            <div className="space-y-1">
              <p className="px-3 mb-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Endpoints</p>
              {endpoints.map(e => (
                <button 
                  key={e.id}
                  onClick={() => setActiveEndpoint(e)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${activeEndpoint.id === e.id ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:text-slate-950 hover:bg-black/5'}`}
                >
                  <span className="opacity-60 mr-2">{e.method}</span> {e.url}
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <ScrollArea className="flex-1">
          <div className="p-10 space-y-10">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={activeEndpoint.method === 'POST' ? 'bg-blue-500' : 'bg-emerald-500'}>{activeEndpoint.method}</Badge>
                <h2 className="text-xl font-mono font-bold">{activeEndpoint.url}</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{activeEndpoint.desc}</p>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Parameters</h3>
              <div className="border border-black/5 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-black/5">
                    <tr className="text-slate-400 uppercase font-black">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Required</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {activeEndpoint.params.map(p => (
                      <tr key={p.name} className="hover:bg-black/5">
                        <td className="px-4 py-3 font-mono font-bold text-primary">{p.name}</td>
                        <td className="px-4 py-3 opacity-60">{p.type}</td>
                        <td className="px-4 py-3">{p.req ? <Badge variant="outline" className="text-[8px] text-red-400 border-red-400/30">YES</Badge> : 'No'}</td>
                        <td className="px-4 py-3 font-medium">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Code Examples</h3>
                <Button variant="outline" size="sm" className="h-7 text-[9px] font-black border-black/5 bg-white shadow-sm">
                  <Copy className="w-3 h-3 mr-2" /> COPY SNIPPET
                </Button>
              </div>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="bg-black/5 border border-black/5 h-10 p-1 mb-4">
                  <TabsTrigger value="curl" className="text-[9px] font-bold">cURL</TabsTrigger>
                  <TabsTrigger value="node" className="text-[9px] font-bold">Node.js</TabsTrigger>
                  <TabsTrigger value="python" className="text-[9px] font-bold">Python</TabsTrigger>
                </TabsList>
                {['curl', 'node', 'python'].map(lang => (
                  <TabsContent key={lang} value={lang} className="m-0">
                    <div className="bg-slate-900 rounded-2xl p-6 border border-white/5 overflow-x-auto">
                      <pre className="text-[11px] font-mono text-white/80 leading-relaxed">
                        {codeSnippets[lang]}
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
