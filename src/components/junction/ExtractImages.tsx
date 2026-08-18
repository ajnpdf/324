"use client";

import React,{useRef,useState} from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import {CheckCircle2,Download,FileText,ImageIcon,Loader2,RefreshCcw,Share2,Zap} from "lucide-react";
import {RuntimeImage} from "@/components/ui/runtime-image";
import {Button} from "../ui/button";
import {Card} from "../ui/card";
import {Progress} from "../ui/progress";
import {useToast} from "../../hooks/use-toast";
import {ToolWorkspace,beginToolProcessing,completeToolProcessing,dl,failToolProcessing,fmtBytes,getFilesFromEvent,shareResult} from "./_shared";
import {initPdfWorker} from "@/lib/pdfjs-worker";

const MAX_IMAGES=200;
const MAX_IMAGE_PIXELS=50_000_000;
const MAX_TOTAL_PIXELS=120_000_000;

type PdfImageObject={
  width?:number;
  height?:number;
  data?:Uint8Array|Uint8ClampedArray;
  bitmap?:ImageBitmap;
};

function safeBaseName(name:string):string{
  return (name.replace(/\.pdf$/i,"").replace(/[^a-zA-Z0-9._ -]+/g,"_").trim().slice(0,90)||"AJN_PDF_Images");
}

function imageCanvas(obj:PdfImageObject):HTMLCanvasElement|null{
  const width=Math.floor(Number(obj?.width)||0);
  const height=Math.floor(Number(obj?.height)||0);
  if(width<1||height<1||width*height>MAX_IMAGE_PIXELS) return null;
  const canvas=document.createElement("canvas");
  canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d");
  if(!ctx) return null;

  if(obj.bitmap){
    ctx.drawImage(obj.bitmap,0,0,width,height);
    return canvas;
  }

  const raw=obj.data;
  if(!raw) return null;
  const data=raw instanceof Uint8ClampedArray?raw:new Uint8ClampedArray(raw);
  const rgba=ctx.createImageData(width,height);
  const pixels=width*height;

  if(data.length===pixels*4){
    rgba.data.set(data);
  }else if(data.length===pixels*3){
    for(let src=0,dst=0;src<data.length;src+=3,dst+=4){
      rgba.data[dst]=data[src];
      rgba.data[dst+1]=data[src+1];
      rgba.data[dst+2]=data[src+2];
      rgba.data[dst+3]=255;
    }
  }else if(data.length===pixels){
    for(let src=0,dst=0;src<data.length;src++,dst+=4){
      const value=data[src];
      rgba.data[dst]=value;rgba.data[dst+1]=value;rgba.data[dst+2]=value;rgba.data[dst+3]=255;
    }
  }else{
    return null;
  }
  ctx.putImageData(rgba,0,0);
  return canvas;
}

function canvasPng(canvas:HTMLCanvasElement):Promise<Blob>{
  return new Promise((resolve,reject)=>{
    canvas.toBlob(blob=>{
      if(!blob||blob.size<16||blob.type!=="image/png") reject(new Error("The browser could not encode an extracted image safely."));
      else resolve(blob);
    },"image/png");
  });
}

async function digestBlob(blob:Blob):Promise<string>{
  if(typeof crypto!=="undefined"&&crypto.subtle){
    const hash=await crypto.subtle.digest("SHA-256",await blob.arrayBuffer());
    return Array.from(new Uint8Array(hash)).map(v=>v.toString(16).padStart(2,"0")).join("");
  }
  return `${blob.size}:${blob.type}`;
}

async function getPdfImage(page:any,id:string):Promise<PdfImageObject|null>{
  return new Promise(resolve=>{
    try{
      page.objs.get(id,(value:PdfImageObject)=>resolve(value||null));
    }catch{resolve(null);}
  });
}

export default function ExtractImages(){
  const {toast}=useToast();
  const inputRef=useRef<HTMLInputElement>(null);
  const [file,setFile]=useState<File|null>(null);
  const [preview,setPreview]=useState<string>("");
  const [phase,setPhase]=useState<"upload"|"ready"|"processing"|"done">("upload");
  const [progress,setProgress]=useState(0);
  const [result,setResult]=useState<Blob|null>(null);
  const [count,setCount]=useState(0);
  const [outputName,setOutputName]=useState("AJN_PDF_Images");

  const reset=()=>{setFile(null);setPreview("");setResult(null);setCount(0);setProgress(0);setPhase("upload");};

  const load=async(f:File)=>{
    if(f.type!=="application/pdf"&&!f.name.toLowerCase().endsWith(".pdf")){
      toast({title:"Choose a PDF",description:"Extract Images accepts PDF files only.",variant:"destructive"});return;
    }
    if(!f.size){toast({title:"Empty file",description:"Choose a non-empty PDF.",variant:"destructive"});return;}
    try{
      initPdfWorker();
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;
      if(pdf.numPages<1) throw new Error("This PDF contains no pages.");
      const page=await pdf.getPage(1);
      const viewport=page.getViewport({scale:0.55});
      const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(viewport.width));canvas.height=Math.max(1,Math.round(viewport.height));
      const ctx=canvas.getContext("2d");if(!ctx) throw new Error("PDF preview is unavailable in this browser.");
      await page.render({canvasContext:ctx,viewport}).promise;
      setPreview(canvas.toDataURL("image/jpeg",0.78));
      setFile(f);setOutputName(`${safeBaseName(f.name)}_images`);setPhase("ready");
    }catch(error:any){toast({title:"PDF could not be opened",description:error?.message||"The PDF may be damaged or unsupported.",variant:"destructive"});}
  };

  const onUpload=(event:React.ChangeEvent<HTMLInputElement>|React.DragEvent<HTMLElement>)=>{
    const selected=getFilesFromEvent(event)?.[0];if(selected) void load(selected);
  };

  const extract=async()=>{
    if(!file)return;
    beginToolProcessing("Extract Images");setPhase("processing");setProgress(1);
    try{
      initPdfWorker();
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
      const zip=new JSZip();
      const seen=new Set<string>();
      let extracted=0;let totalPixels=0;
      const imageOps=new Set<number>([pdfjsLib.OPS.paintImageXObject,pdfjsLib.OPS.paintJpegXObject].filter((v):v is number=>typeof v==="number"));

      for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
        const page=await pdf.getPage(pageNumber);
        const operations=await page.getOperatorList();
        for(let index=0;index<operations.fnArray.length;index++){
          if(!imageOps.has(operations.fnArray[index]))continue;
          if(extracted>=MAX_IMAGES)throw new Error(`This PDF contains more than ${MAX_IMAGES} embedded images. Split the PDF and extract in smaller batches.`);
          const imageId=String(operations.argsArray[index]?.[0]||"");if(!imageId)continue;
          const object=await getPdfImage(page,imageId);if(!object)continue;
          const canvas=imageCanvas(object);if(!canvas)continue;
          totalPixels+=canvas.width*canvas.height;
          if(totalPixels>MAX_TOTAL_PIXELS)throw new Error("The embedded images are too large for one browser extraction job. Split the PDF and try again.");
          const blob=await canvasPng(canvas);
          const hash=await digestBlob(blob);
          if(seen.has(hash))continue;
          seen.add(hash);
          extracted++;
          zip.file(`page-${String(pageNumber).padStart(3,"0")}-image-${String(extracted).padStart(3,"0")}.png`,blob,{binary:true});
        }
        setProgress(Math.max(1,Math.round(pageNumber/pdf.numPages*92)));
      }

      if(!extracted)throw new Error("No embedded raster images were found. Use PDF to PNG/JPG if you want full-page images instead.");
      const zipBlob=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}},metadata=>setProgress(92+Math.round(metadata.percent*0.08)));
      if(!zipBlob.size)throw new Error("The extracted image archive could not be created.");
      setResult(zipBlob);setCount(extracted);setProgress(100);setPhase("done");completeToolProcessing();
    }catch(error:any){failToolProcessing();setPhase("ready");toast({title:"Extraction failed",description:error?.message||"The embedded images could not be extracted safely.",variant:"destructive"});}
  };

  const archiveName=`${safeBaseName(outputName)}.zip`;

  return <ToolWorkspace title="Extract Images" description="Extract embedded raster images from a PDF. For full PDF pages, use PDF to PNG/JPG instead." accent="#EC4899">
    {phase==="upload"&&<div className="w-full">
      <div onClick={()=>inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();onUpload(e);}} className="min-h-[240px] rounded-3xl border border-dashed border-black/10 bg-white/60 flex flex-col items-center justify-center cursor-pointer p-8 text-center shadow-sm hover:border-pink-400/60 transition-colors">
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onUpload}/>
        <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-5"><ImageIcon className="w-8 h-8 text-pink-500"/></div>
        <h3 className="text-2xl font-black text-slate-950">Choose a PDF</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md">AJN PDF extracts embedded image objects. It does not screenshot every page or invent image assets.</p>
      </div>
    </div>}

    {phase==="ready"&&file&&<div className="grid lg:grid-cols-[1.2fr_.8fr] gap-7">
      <Card className="rounded-3xl p-5 border-black/5 bg-white/70 min-h-[380px] flex items-center justify-center overflow-hidden">
        {preview?<RuntimeImage src={preview} alt="PDF first page preview" className="max-h-[520px] w-auto shadow-lg"/>:<FileText className="w-14 h-14 text-slate-300"/>}
      </Card>
      <div className="space-y-5">
        <Card className="rounded-3xl p-6 border-black/5 bg-white/70 space-y-4">
          <div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Source</p><p className="font-bold text-slate-900 break-all">{file.name}</p><p className="text-sm text-slate-500">{fmtBytes(file.size)}</p></div>
          <div><label className="text-xs font-black uppercase tracking-wider text-slate-400">Archive name</label><input value={outputName} onChange={e=>setOutputName(e.target.value)} maxLength={90} className="mt-2 w-full h-11 rounded-xl border border-black/10 bg-white px-3 font-semibold outline-none focus:border-pink-400"/></div>
          <div className="rounded-2xl bg-pink-50 p-4 text-sm text-pink-900">Output images are PNG to avoid extra JPEG quality loss and preserve alpha when the decoded PDF asset includes transparency. Duplicate decoded images are removed.</div>
        </Card>
        <Button onClick={extract} className="w-full h-14 rounded-2xl font-black gap-2"><Zap className="w-4 h-4"/>Extract embedded images</Button>
        <Button variant="outline" onClick={reset} className="w-full rounded-2xl"><RefreshCcw className="w-4 h-4 mr-2"/>Choose another PDF</Button>
      </div>
    </div>}

    {phase==="processing"&&<div className="py-24 max-w-lg mx-auto text-center space-y-7"><Loader2 className="w-14 h-14 animate-spin text-pink-500 mx-auto"/><div><h3 className="text-2xl font-black">Extracting embedded images</h3><p className="text-sm text-slate-500 mt-2">Keeping each decoded image at its PDF object resolution.</p></div><Progress value={progress}/><p className="font-black text-pink-600">{progress}%</p></div>}

    {phase==="done"&&result&&<div className="py-16 max-w-lg mx-auto text-center space-y-7"><div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10 text-emerald-600"/></div><div><h3 className="text-3xl font-black">Images extracted</h3><p className="text-slate-500 mt-2">{count} unique embedded image{count===1?"":"s"} ready in one ZIP.</p></div><Card className="rounded-2xl p-5 flex items-center gap-3 text-left"><Download className="w-5 h-5 text-pink-500"/><div className="min-w-0"><p className="text-xs text-slate-400 uppercase font-black">Output</p><p className="font-bold truncate">{archiveName}</p></div></Card><Button onClick={()=>dl(result,archiveName)} className="w-full h-14 rounded-2xl font-black"><Download className="w-4 h-4 mr-2"/>Download ZIP</Button><Button variant="outline" onClick={()=>shareResult(result,archiveName,"Extracted with AJN PDF")} className="w-full rounded-2xl"><Share2 className="w-4 h-4 mr-2"/>Share</Button><Button variant="ghost" onClick={reset} className="w-full"><RefreshCcw className="w-4 h-4 mr-2"/>Extract another PDF</Button></div>}
  </ToolWorkspace>;
}
