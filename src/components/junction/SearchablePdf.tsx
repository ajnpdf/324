"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,Info,Err,ToolFile,dl,T,beginToolProcessing,completeToolProcessing,failToolProcessing} from "./_shared";
import {repairPdf} from "./_pdfUtils";
export default function SearchablePdf(){
  const [files,setF]=useState<ToolFile[]>([]);const [loading,setL]=useState(false);
  const [result,setR]=useState<Blob|null>(null);const [err,setE]=useState("");
  const run=async()=>{if(!files.length){setE("Upload a PDF.");return;}setE("");setL(true);
    beginToolProcessing("Prepare searchable PDF");try{setR(await repairPdf(files[0].file));completeToolProcessing();}catch(e:any){failToolProcessing();setE(e.message || "The task could not be completed.");}setL(false);};
  return(<ToolWorkspace title="Searchable PDF" description="Ensure your PDF's text layer is accessible and searchable." accent={T.purple}>
    {result?<Done msg="PDF is now searchable!" onDownload={()=>dl(result,"searchable.pdf")} shareFile={{blob:result,name:"searchable.pdf"}} onReset={()=>{setR(null);setF([]);}}/>
    :<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Drop files={files} onChange={setF} accept=".pdf"/>
      <Info bg="#F5F3FF" col="#5B21B6">Preserves and optimises the existing text layer. For scanned PDFs with <strong>no text layer</strong>, real OCR (Tesseract) is required; scanned pages require OCR support.</Info>
      <Err msg={err}/><Btn onClick={run} loading={loading} disabled={!files.length} full style={{background:T.purple}}>Make searchable</Btn>
    </div>}
  </ToolWorkspace>);
}
