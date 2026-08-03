"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,Range,F,Pills,Info,Err,ToolFile,dl,T} from "./_shared";
import {pdfToImages,filesToZip} from "./_pdfUtils";
export default function PdfToJpg(){
  const [files,setF]=useState<ToolFile[]>([]);const [dpi,setDpi]=useState(150);const [q,setQ]=useState(85);
  const [loading,setL]=useState(false);const [result,setR]=useState<Blob|null>(null);const [pages,setPages]=useState(0);const [err,setE]=useState("");
  const run=async()=>{if(!files.length){setE("Upload a PDF.");return;}setE("");setL(true);
    try{const imgs=await pdfToImages(files[0].file,dpi,q);setPages(imgs.length);
      const blob=imgs.length===1?imgs[0].blob:await filesToZip(imgs);setR(blob);}catch{setE("Could not render PDF. Ensure pdfjs-dist is installed: npm i pdfjs-dist");}setL(false);};
  return(<ToolWorkspace title="PDF to JPG" description="MULTI-PAGE IMAGE EXTRACTION" icon="🖼️" accent={T.red} badge="PDF TO IMAGE">
    {result?<Done msg={`${pages} page${pages!==1?"s":""} converted!`} dlLabel={pages===1?"Download JPG":"Download ZIP"}
      onDownload={()=>dl(result,pages===1?"page_1.jpg":"pdf_images.zip")} onReset={()=>{setR(null);setF([]);setPages(0);}}/>
    :<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Drop files={files} onChange={setF} accept=".pdf"/>
      <F label="Resolution"><Pills opts={[{label:"72 dpi",value:72},{label:"150 dpi",value:150},{label:"300 dpi",value:300}]} val={dpi} onChange={(v:any)=>setDpi(v)}/></F>
      <Range label="JPEG Quality" value={q} min={30} max={100} step={5} onChange={setQ} fmt={v=>`${v}%`}/>
      <Info>🖼️ Multiple pages are bundled in a ZIP. Requires: <code style={{background:"#F3F4F6",padding:"1px 5px",borderRadius:4}}>npm i pdfjs-dist</code></Info>
      <Err msg={err}/><Btn onClick={run} loading={loading} disabled={!files.length} full>🖼️ Convert to JPG</Btn>
    </div>}
  </ToolWorkspace>);
}
