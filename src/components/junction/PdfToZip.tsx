
"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,Info,Err,ToolFile,dl} from "./_shared";
import {splitPdf,filesToZip} from "./_pdfUtils";
export default function PdfToZip(){
  const [files,setF]=useState<ToolFile[]>([]);const [loading,setL]=useState(false);
  const [result,setR]=useState<Blob|null>(null);const [pages,setPages]=useState(0);const [err,setE]=useState("");
  const run=async()=>{if(!files.length){setE("Upload a PDF.");return;}setE("");setL(true);
    try{const parts=await splitPdf(files[0].file,"");setPages(parts.length);setR(await filesToZip(parts));}catch(e:any){setE(e.message);}setL(false);};
  return(<ToolWorkspace title="PDF to ZIP" description="UNIVERSAL PAGE ARCHIVING" icon="📦" accent="#6B7280" badge="PAGE ARCHIVAL">
    {result?<Done msg={`${pages} pages zipped!`} dlLabel="Download ZIP" onDownload={()=>dl(result,"pdf_pages.zip")} shareFile={{blob:result,name:"pdf_pages.zip"}} onReset={()=>{setR(null);setF([]);setPages(0);}}/>
    :<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Drop files={files} onChange={setF} accept=".pdf"/>
      <Info>📦 Each page becomes a separate single-page PDF inside the ZIP archive.</Info>
      <Err msg={err}/><Btn onClick={run} loading={loading} disabled={!files.length} full style={{background:"#6B7280"}}>📦 Export to ZIP</Btn>
    </div>}
  </ToolWorkspace>);
}
