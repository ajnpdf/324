"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,F,G2,Info,Err,IS,Range,ToolFile,dl,T,beginToolProcessing,completeToolProcessing,failToolProcessing} from "./_shared";
import {convertOnServer} from "@/lib/pdf-backend";

const LANGUAGES=[{value:"eng",label:"English"},{value:"tel",label:"Telugu"},{value:"hin",label:"Hindi"},{value:"tam",label:"Tamil"},{value:"kan",label:"Kannada"},{value:"mal",label:"Malayalam"}];

export default function SearchablePdf(){
  const [files,setFiles]=useState<ToolFile[]>([]);const [language,setLanguage]=useState("eng");const [dpi,setDpi]=useState(240);
  const [loading,setLoading]=useState(false);const [result,setResult]=useState<{blob:Blob;filename:string}|null>(null);const [error,setError]=useState("");
  const run=async()=>{if(!files.length){setError("Upload a scanned PDF.");return;}setError("");setLoading(true);beginToolProcessing("Searchable PDF OCR");try{const converted=await convertOnServer({toolId:"scanned-pdf-to-searchable-pdf",files:[files[0].file],outputName:`${files[0].name.replace(/\.pdf$/i,"")}-searchable`,options:{language,dpi,auto_rotate:true,deskew:true,denoise:true,contrast:1.35}});if(converted.blob.type&&converted.blob.type!=="application/pdf")throw new Error("The server did not return a valid PDF response.");setResult(converted);completeToolProcessing();}catch(e:any){failToolProcessing();setError(e?.message||"The searchable PDF could not be created.");}finally{setLoading(false);}};
  return <ToolWorkspace title="Searchable PDF" description="OCR scanned PDF pages and add a searchable/selectable text layer." accent={T.purple}>
    {result?<Done msg="Searchable PDF created" onDownload={()=>dl(result.blob,result.filename)} shareFile={{blob:result.blob,name:result.filename}} onReset={()=>{setResult(null);setFiles([]);setError("");}}/>:<div className="space-y-5">
      <Drop files={files} onChange={setFiles} accept=".pdf,application/pdf" label="Choose a scanned PDF" sub="The original page appearance is retained while OCR text is added"/>
      <G2><F label="OCR language"><select style={IS} value={language} onChange={e=>setLanguage(e.target.value)}>{LANGUAGES.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></F><F label="OCR resolution"><Range label="DPI" value={dpi} min={150} max={400} step={10} onChange={setDpi} fmt={v=>`${v} DPI`}/></F></G2>
      <Info bg="#F5F3FF" col="#5B21B6">This tool performs real OCR. After download, text should be searchable with Ctrl+F and selectable where recognition succeeds. Scan quality and language selection affect accuracy.</Info>
      <Err msg={error}/><Btn onClick={run} loading={loading} disabled={!files.length} full style={{background:T.purple}}>Make PDF searchable</Btn>
    </div>}
  </ToolWorkspace>;
}
