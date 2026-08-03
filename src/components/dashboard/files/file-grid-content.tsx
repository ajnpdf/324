
"use client";

import { WorkspaceFile } from './file-explorer';
import { 
  FileIcon, 
  ImageIcon, 
  VideoIcon, 
  MusicIcon, 
  MoreVertical, 
  Eye, 
  Repeat, 
  Download, 
  Trash2, 
  Share2,
  Tag
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

interface Props {
  files: WorkspaceFile[];
  viewMode: 'grid' | 'list';
  selectedFileId: string | null;
  onSelectFile: (f: WorkspaceFile) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'image': return <ImageIcon className="w-8 h-8 text-blue-500" />;
    case 'video': return <VideoIcon className="w-8 h-8 text-purple-500" />;
    case 'audio': return <MusicIcon className="w-8 h-8 text-pink-500" />;
    default: return <FileIcon className="w-8 h-8 text-indigo-500" />;
  }
};

export function FileGridContent({ files, viewMode, selectedFileId, onSelectFile }: Props) {
  const filterPills = ['All', 'PDF', 'Images', 'Video', 'Audio', 'Documents', 'Archives'];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
      <div className="p-4 border-b border-white/5 bg-background/20 sticky top-0 z-10">
        <div className="flex flex-wrap gap-2">
          {filterPills.map(p => (
            <Button key={p} variant="outline" className={`h-7 px-3 text-[10px] font-black border-white/10 rounded-full transition-all ${p === 'All' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/5 text-muted-foreground'}`}>
              {p.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {files.map((file) => (
              <Card 
                key={file.id} 
                onClick={() => onSelectFile(file)}
                className={cn(
                  "group relative bg-card/40 backdrop-blur-md transition-all hover:-translate-y-1 cursor-pointer overflow-hidden border-2",
                  selectedFileId === file.id ? "border-primary shadow-2xl shadow-primary/10" : "border-white/5 hover:border-primary/20"
                )}
              >
                <CardContent className="p-0">
                  <div className="h-32 bg-white/5 flex items-center justify-center relative group overflow-hidden">
                    <div className="group-hover:scale-110 transition-transform duration-500">
                      {getIcon(file.type)}
                    </div>
                    
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/10 hover:bg-primary text-white rounded-full">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/10 hover:bg-primary text-white rounded-full">
                        <Repeat className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black tracking-widest">{file.format}</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5">
                    <p className="font-bold truncate text-xs mb-1">{file.name}</p>
                    <div className="flex justify-between items-center text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                      <span>{file.size}</span>
                      <span>{file.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-[10px] font-bold">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-muted-foreground/60 uppercase tracking-widest">
                  <th className="px-6 py-4">Thumbnail</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Modified</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {files.map((file) => (
                  <tr 
                    key={file.id} 
                    onClick={() => onSelectFile(file)}
                    className={cn(
                      "group hover:bg-white/5 transition-colors cursor-pointer",
                      selectedFileId === file.id ? "bg-primary/5" : ""
                    )}
                  >
                    <td className="px-6 py-3">
                      <div className="p-2 bg-white/5 rounded-lg w-fit">
                        {getIcon(file.type)}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{file.name}</span>
                        <span className="text-[9px] opacity-40 uppercase tracking-widest">{file.format} DOCUMENT</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{file.size}</td>
                    <td className="px-6 py-3 text-muted-foreground">{file.date}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        {file.tags.map(t => <Badge key={t} variant="outline" className="text-[8px] h-4 border-white/10 bg-white/5 text-muted-foreground">{t}</Badge>)}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card/90 backdrop-blur-xl border-white/10">
                          <DropdownMenuItem className="gap-2 text-[10px] font-black uppercase"><Eye className="w-3.5 h-3.5" /> PREVIEW</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-[10px] font-black uppercase"><Repeat className="w-3.5 h-3.5" /> CONVERT</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-[10px] font-black uppercase"><Download className="w-3.5 h-3.5" /> DOWNLOAD</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem className="gap-2 text-[10px] font-black uppercase text-destructive"><Trash2 className="w-3.5 h-3.5" /> DELETE</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
