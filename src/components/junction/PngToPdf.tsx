
"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,Info,Err,ToolFile,dl,T} from "./_shared";
import {imagesToPdf} from "./_pdfUtils";
export default function PngToPdf(){
  const [files,setF]=useState<ToolFile[]>([]);const [loading,setL]=useState(false);
  const [result,setR]=useState<Blob|null>(null);const [err,setE]=useState("");
  const run=async()=>{if(!files.length){setE("Upload at least one image.");return;}setE("");setL(true);
    try{setR(await imagesToPdf(files.map(f=>f.file)));}catch(e:any){setE(e.message);}setL(false);};
  return(<ToolWorkspace title="PNG to PDF" description="ALPHA-CHANNEL DOCUMENT CREATION" icon="🖼️" accent={"#8B5CF6"} badge="PNG TO PDF">
    {result?<Done msg="PNG images converted to PDF!" onDownload={()=>dl(result,"images.pdf")} onReset={()=>{setR(null);setF([]);}}/>
    :<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Drop files={files} onChange={setF} accept=".png" multiple label="Drop images here" sub="Each image becomes one PDF page · upload multiple"/>
      {files.length>1&&<Info>📋 <strong>{files.length} images</strong> → <strong>{files.length} pages</strong> in listed order.</Info>}
      <Err msg={err}/><Btn onClick={run} loading={loading} disabled={!files.length} full>🖼️ Create PDF</Btn>
    </div>}
  </ToolWorkspace>);
}
