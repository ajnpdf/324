"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,F,Err,ToolFile,dl,T,beginToolProcessing,completeToolProcessing,failToolProcessing} from "./_shared";
import {flipImage} from "./_imageUtils";
export default function FlipImage(){
  const [files,setF]=useState<ToolFile[]>([]);const [h,setH]=useState(true);const [v,setV]=useState(false);
  const [loading,setL]=useState(false);const [result,setR]=useState<Blob|null>(null);const [err,setE]=useState("");
  const run=async()=>{if(!files.length){setE("Upload an image.");return;}if(!h&&!v){setE("Select at least one flip direction.");return;}
    setE("");setL(true);beginToolProcessing("Flip image");try{setR(await flipImage(files[0].file,h,v));completeToolProcessing();}catch(e:any){failToolProcessing();setE(e.message || "The task could not be completed.");}setL(false);};
  const lbl=h&&v?"Horizontal + Vertical":h?"Horizontal (mirror)":"Vertical (upside down)";
  return(<ToolWorkspace title="Flip Image" description="Mirror your image horizontally, vertically, or both." accent={T.teal}>
    {result?<Done msg="Image flipped!" onDownload={()=>dl(result,"flipped_"+(files[0]?.name||"image.jpg"))} shareFile={{blob:result,name:"flipped_"+(files[0]?.name||"image.jpg")}} onReset={()=>{setR(null);setF([]);}}/>
    :<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp"/>
      <F label="Flip direction">
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",fontSize:14,fontWeight:600}}>
            <input type="checkbox" checked={h} onChange={e=>setH(e.target.checked)} style={{width:17,height:17}}/>Horizontal flip (mirror left to right)</label>
          <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",fontSize:14,fontWeight:600}}>
            <input type="checkbox" checked={v} onChange={e=>setV(e.target.checked)} style={{width:17,height:17}}/>Vertical flip (top to bottom)</label>
        </div>
      </F>
      {(h||v)&&<div style={{background:"#ECFEFF",borderRadius:8,padding:"9px 13px",fontSize:13,color:"#0E7490",fontWeight:600}}>Change: <strong>{lbl}</strong></div>}
      <Err msg={err}/><Btn onClick={run} loading={loading} disabled={!files.length||(!h&&!v)} full style={{background:T.teal}}>Flip image</Btn>
    </div>}
  </ToolWorkspace>);
}
