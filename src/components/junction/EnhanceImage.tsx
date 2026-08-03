"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,F,Info,Err,ToolFile,dl,T} from "./_shared";
import {enhanceImage} from "./_imageUtils";
export default function EnhanceImage(){
  const [files,setF]=useState<ToolFile[]>([]);const [scale,setS]=useState(2);
  const [loading,setL]=useState(false);const [result,setR]=useState<Blob|null>(null);const [err,setE]=useState("");
  const run=async()=>{if(!files.length){setE("Upload an image.");return;}setE("");setL(true);
    try{setR(await enhanceImage(files[0].file,scale));}catch(e:any){setE(e.message);}setL(false);};
  return(<ToolWorkspace title="Smart Enhancer" description="Upscale small images and apply sharpening to make them clearer." icon="✨" accent={T.purple}>
    {result?<Done msg="Image enhanced!" onDownload={()=>dl(result,"enhanced_"+(files[0]?.name||"image.jpg"))} onReset={()=>{setR(null);setF([]);}}/>
    :<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop image to enhance" sub="Best on small or low-res images"/>
      <F label="Upscale factor">
        <div style={{display:"flex",gap:8}}>{[2,3,4].map(s=>(
          <button key={s} onClick={()=>setS(s)} style={{flex:1,padding:"11px 0",borderRadius:8,fontSize:15,fontWeight:700,cursor:"pointer",
            border:scale===s?`2px solid ${T.purple}`:`1.5px solid ${T.border}`,
            background:scale===s?"#F5F3FF":"#fff",color:scale===s?T.purple:"#6B7280"}}>{s}×</button>
        ))}</div>
      </F>
      <Info bg="#F5F3FF" col="#5B21B6">✨ Bicubic interpolation + unsharp masking. For AI upscaling use a dedicated ML tool.</Info>
      <Err msg={err}/><Btn onClick={run} loading={loading} disabled={!files.length} full style={{background:T.purple}}>✨ Enhance {scale}×</Btn>
    </div>}
  </ToolWorkspace>);
}
