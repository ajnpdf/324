"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,G2,F,Info,Err,IS,ToolFile,dl} from "./_shared";
import {cropImage} from "./_imageUtils";
export default function CropImage(){
  const [files,setF]=useState<ToolFile[]>([]);const [x,setX]=useState(0);const [y,setY]=useState(0);
  const [w,setW]=useState(400);const [h,setH]=useState(300);const [loading,setL]=useState(false);
  const [result,setR]=useState<Blob|null>(null);const [err,setE]=useState("");
  const run=async()=>{if(!files.length){setE("Upload an image.");return;}setE("");setL(true);
    try{setR(await cropImage(files[0].file,x,y,w,h));}catch(e:any){setE(e.message);}setL(false);};
  return(<ToolWorkspace title="Crop Image" description="Cut out a specific rectangular region of your image." icon="✂️" accent="#D97706">
    {result?<Done msg="Image cropped!" onDownload={()=>dl(result,"cropped_"+(files[0]?.name||"image.jpg"))} shareFile={{blob:result,name:"cropped_"+(files[0]?.name||"image.jpg")}} onReset={()=>{setR(null);setF([]);}}/>
    :<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp"/>
      <G2><F label="X — left offset (px)"><input style={IS} type="number" min={0} value={x} onChange={e=>setX(+e.target.value)}/></F>
          <F label="Y — top offset (px)"><input style={IS} type="number" min={0} value={y} onChange={e=>setY(+e.target.value)}/></F>
          <F label="Crop width (px)"><input style={IS} type="number" min={1} value={w} onChange={e=>setW(+e.target.value)}/></F>
          <F label="Crop height (px)"><input style={IS} type="number" min={1} value={h} onChange={e=>setH(+e.target.value)}/></F></G2>
      <Info bg="#FFFBEB" col="#92400E">💡 X=0, Y=0 is the top-left corner. Crop extends W×H pixels to the right and down.</Info>
      <Err msg={err}/><Btn onClick={run} loading={loading} disabled={!files.length} full style={{background:"#D97706"}}>✂️ Crop Image</Btn>
    </div>}
  </ToolWorkspace>);
}
