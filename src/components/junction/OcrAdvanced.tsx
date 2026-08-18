"use client";

import React,{useMemo,useState} from "react";
import {Copy,Download,FileText,RefreshCcw,Share2} from "lucide-react";
import {ToolWorkspace,Drop,Btn,Done,F,G2,Info,Err,IS,Range,ToolFile,dl,T,shareResult,beginToolProcessing,completeToolProcessing,failToolProcessing} from "./_shared";
import {convertOnServer} from "@/lib/pdf-backend";

const LANGUAGES=[
  {value:"eng",label:"English"},{value:"tel",label:"Telugu"},{value:"hin",label:"Hindi"},
  {value:"tam",label:"Tamil"},{value:"kan",label:"Kannada"},{value:"mal",label:"Malayalam"},
];

export default function OcrAdvanced(){
  const [files,setFiles]=useState<ToolFile[]>([]);const [language,setLanguage]=useState("eng");const [dpi,setDpi]=useState(240);
  const [loading,setLoading]=useState(false);const [error,setError]=useState("");const [result,setResult]=useState<{blob:Blob;filename:string;text:string}|null>(null);
  const selected=files[0]?.file;
  const isPdf=Boolean(selected&&(selected.type==="application/pdf"||selected.name.toLowerCase().endsWith(".pdf")));
  const wordCount=useMemo(()=>result?.text.trim()?result.text.trim().split(/\s+/).filter(Boolean).length:0,[result]);

  const run=async()=>{
    if(!selected){setError("Upload a PDF or document image.");return;}
    setError("");setLoading(true);beginToolProcessing("OCR Text Extraction");
    try{
      const converted=await convertOnServer({toolId:isPdf?"scanned-pdf-to-text":"image-to-text",files:[selected],outputName:`${selected.name.replace(/\.[^/.]+$/,"")}-ocr`,options:{language,dpi,auto_rotate:true,deskew:true,denoise:true,contrast:1.35}});
      const text=await converted.blob.text();
      if(!text.trim())throw new Error("OCR completed but no readable text was found. Try a clearer scan or another language.");
      setResult({...converted,text});completeToolProcessing();
    }catch(e:any){failToolProcessing();setError(e?.message||"Text recognition could not be completed.");}
    finally{setLoading(false);}
  };

  const reset=()=>{setFiles([]);setResult(null);setError("");};

  return <ToolWorkspace title="OCR Text Extraction" description="Recognize printed text from PDFs and images with AJN PDF multilingual OCR." accent={T.purple}>
    {result?<div className="space-y-5">
      <Info bg="#ECFDF5" col="#065F46"><strong>{wordCount} words recognized.</strong> Review the text before using it for important records.</Info>
      <textarea readOnly value={result.text} rows={16} className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 outline-none"/>
      <G2><Btn variant="secondary" onClick={()=>void navigator.clipboard.writeText(result.text)}><Copy size={15}/>Copy text</Btn><Btn variant="secondary" onClick={()=>void shareResult(result.blob,result.filename)}><Share2 size={15}/>Share TXT</Btn></G2>
      <Done msg="OCR text is ready" dlLabel="Download TXT" onDownload={()=>dl(result.blob,result.filename)} onReset={reset}/>
    </div>:<div className="space-y-5">
      <Drop files={files} onChange={setFiles} accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.heic,.heif" label="Choose a scan or document" sub="PDF, JPG, PNG, WebP, BMP, TIFF or HEIC where the backend supports it"/>
      <G2><F label="OCR language"><select style={IS} value={language} onChange={e=>setLanguage(e.target.value)}>{LANGUAGES.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></F><F label="Recognition resolution"><Range label="DPI" value={dpi} min={150} max={400} step={10} onChange={setDpi} fmt={v=>`${v} DPI`}/></F></G2>
      <Info bg="#F5F3FF" col="#5B21B6">AJN PDF auto-normalizes orientation, straightens small scan skew, improves contrast and uses native PDF text when it is better than OCR.</Info>
      <Err msg={error}/><Btn onClick={run} loading={loading} disabled={!selected} full style={{background:T.purple}}><FileText size={16}/>Recognize text</Btn>
      {selected&&<button type="button" onClick={reset} className="mx-auto flex items-center gap-2 text-xs font-bold text-slate-500"><RefreshCcw size={13}/>Choose another file</button>}
    </div>}
  </ToolWorkspace>;
}
