"use client";

import { useState } from 'react';
import { BrainCircuit, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { smartToolSuggestions, type SmartToolSuggestionsOutput } from '@/ai/flows/smart-tool-suggestions';
import { Badge } from '@/components/ui/badge';

export function SmartHelper() {
  const [fileType, setFileType] = useState('image/png');
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SmartToolSuggestionsOutput | null>(null);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const result = await smartToolSuggestions({
        fileType,
        modificationDescription: intent
      });
      setSuggestions(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <BrainCircuit className="w-32 h-32" />
      </div>
      
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">AJN Smart Assistant</CardTitle>
        </div>
        <CardDescription>Tell us what you want to do with your file.</CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Intent</label>
            <Input 
              placeholder="e.g. make it smaller, convert to PDF..." 
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="border-primary/20 focus:ring-primary"
            />
          </div>
          <div className="sm:w-32 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</label>
            <select 
              className="w-full h-10 px-3 py-2 rounded-md border border-primary/20 bg-background text-sm"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              <option value="image/png">PNG Image</option>
              <option value="image/jpeg">JPEG Image</option>
              <option value="application/pdf">PDF Doc</option>
              <option value="video/mp4">MP4 Video</option>
              <option value="audio/mpeg">MP3 Audio</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleSuggest} 
              disabled={loading}
              className="bg-brand-gradient shadow-lg w-full sm:w-auto"
            >
              {loading ? "Analyzing..." : "Get Suggestions"}
            </Button>
          </div>
        </div>

        {suggestions && (
          <div className="pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-3">
              {suggestions.suggestions.map((s, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border-2 transition-all flex items-start justify-between gap-4 group cursor-pointer hover:border-primary/50 ${s.isRecommended ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}
                >
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-lg ${s.isRecommended ? 'bg-primary text-white' : 'bg-muted'}`}>
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{s.toolName}</h4>
                        {s.isRecommended && <Badge className="bg-primary/20 text-primary border-none text-[10px] px-1.5 h-4">Recommended</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug">{s.toolDescription}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
