"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,Range,F,Pills,Info,Err,ToolFile,dl,T,beginToolProcessing,completeToolProcessing,failToolProcessing} from "./_shared";
import {convertImageFormat} from "./_imageUtils";
const FMTS=[{label:"JPEG",value:"jpeg"},{label:"PNG",value:"png"},{label:"WebP",value:"webp"},{label:"BMP",value:"bmp"}];
const DESC:Record<string,string>={jpeg:"Best for photos. Lossy — smaller files, slight quality loss.",png:"Lossless with transparency. Best for graphics and logos.",webp:"Modern format with excellent compression for photos and graphics.",bmp:"Uncompressed. Produces very large files with no additional lossy compression."};
export default function ConvertImage(){
  const [files,setF]=useState<ToolFile[]>([]);const [fmt,setFmt]=useState("jpeg");const [q,setQ]=useState(90);
  const [loading,setL]=useState(false);const [result,setR]=useState<Blob|null>(null);const [err,setE]=useState("");
  const run=async()=>{if(!files.length){setE("Upload an image.");return;}setE("");setL(true);
    beginToolProcessing("Convert image");try{setR(await convertImageFormat(files[0].file,fmt,q));completeToolProcessing();}catch(e:any){failToolProcessing();setE(e.message || "The task could not be completed.");}setL(false);};
  const ext=fmt==="jpeg"?"jpg":fmt;const name=(files[0]?.name.replace(/\.[^.]+$/,"")||"converted")+"."+ext;
  return(<ToolWorkspace title="Convert Image" description="Convert images between JPEG, PNG, WebP and BMP formats." accent={T.purple}>
    {result?<Done msg={`Converted to ${fmt.toUpperCase()}!`} dlLabel={`Download .${ext}`} onDownload={()=>dl(result,name)} shareFile={{blob:result,name}} onReset={()=>{setR(null);setF([]);}}/>
    :<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff" label="Drop image to convert" sub="JPG, PNG, WebP, BMP, GIF, TIFF accepted"/>
      <F label="Convert to"><Pills opts={FMTS} val={fmt} onChange={(v:any)=>setFmt(v)}/></F>
      <Info bg="#F5F3FF" col="#5B21B6">{DESC[fmt]}</Info>
      {fmt!=="png"&&fmt!=="bmp"&&<Range label="Quality" value={q} min={10} max={100} step={5} onChange={setQ} fmt={v=>`${v}%`}/>}
      {files.length>0&&<div style={{fontSize:13,color:T.gray,fontWeight:500}}><strong>{files[0].name}</strong> → <strong>{name}</strong></div>}
      <Err msg={err}/><Btn onClick={run} loading={loading} disabled={!files.length} full style={{background:T.purple}}>🔀 Convert to {fmt.toUpperCase()}</Btn>
    </div>}
  </ToolWorkspace>);
}
