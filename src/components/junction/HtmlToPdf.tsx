
"use client";
import React,{useState} from "react";
import {ToolWorkspace,Drop,Btn,Done,F,Pills,Info,Err,IS,ToolFile,dl,T} from "./_shared";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
async function convert(html:string):Promise<Blob>{
  const tmp=document.createElement("div");tmp.innerHTML=html;
  const plain=(tmp.textContent||tmp.innerText||"").replace(/\n{3,}/g,"\n\n");
  const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.Helvetica);
  const fS=11,lH=16,mX=56,mY=56,pW=595,pH=842,maxW=pW-mX*2;
  let page=doc.addPage([pW,pH]);let cy=pH-mY;
  const np=()=>{page=doc.addPage([pW,pH]);cy=pH-mY;};
  const wrap=(line:string)=>{const ws=line.split(" ");const ls:string[]=[];let cur="";
    for(const w of ws){const t=cur?`${cur} ${w}`:w;if(font.widthOfTextAtSize(t,fS)>maxW&&cur){ls.push(cur);cur=w;}else cur=t;}
    if(cur)ls.push(cur);return ls.length?ls:[""];};
  for(const raw of plain.split("\n")){const s=raw.replace(/[^\x20-\x7E]/g,"");
    for(const wl of wrap(s)){if(cy<mY+lH)np();if(wl.trim())page.drawText(wl,{x:mX,y:cy,size:fS,font,color:rgb(0,0,0)});cy-=lH;}}
  const _hb2=await doc.save();return new Blob([_hb2.buffer as ArrayBuffer],{type:"application/pdf"});
}
export default function HtmlToPdf(){
  const [mode,setMode]=useState<"paste"|"file">("paste");
  const [html,setHtml]=useState("<h1>Hello World</h1>\n<p>Your HTML content goes here.</p>");
  const [files,setF]=useState<ToolFile[]>([]);const [loading,setL]=useState(false);
  const [result,setR]=useState<Blob|null>(null);const [err,setE]=useState("");
  const run=async()=>{setE("");setL(true);
    try{let content=html;if(mode==="file"){if(!files.length){setE("Upload an HTML file.");setL(false);return;}content=await files[0].file.text();}
      if(!content.trim()){setE("No HTML content.");setL(false);return;}setR(await convert(content));
    }catch(e:any){setE(e.message);}setL(false);};
  return(<ToolWorkspace title="HTML to PDF" description="ADVANCED DOM-TO-VECTOR SYNTHESIS" icon="🌐" accent="#D97706" badge="WEB TO PDF">
    {result?<Done msg="HTML converted to PDF!" onDownload={()=>dl(result,"page.pdf")} onReset={()=>{setR(null);setF([]);}}/>
    :<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <F label="Input method"><Pills opts={[{label:"Paste HTML",value:"paste"},{label:"Upload .html file",value:"file"}]} val={mode} onChange={(v:any)=>setMode(v)}/></F>
      {mode==="paste"
        ?<F label="HTML content"><textarea value={html} onChange={e=>setHtml(e.target.value)} rows={10} style={{...IS,resize:"vertical",fontFamily:"monospace",fontSize:12,lineHeight:1.6}}/></F>
        :<Drop files={files} onChange={setF} accept=".html,.htm" label="Drop .html file here"/>}
      <Info bg="#FFFBEB" col="#92400E">🌐 Text content is extracted from HTML into a clean A4 PDF. CSS, images and complex layouts are not rendered.</Info>
      <Err msg={err}/><Btn onClick={run} loading={loading} full style={{background:"#D97706"}}>🌐 Convert to PDF</Btn>
    </div>}
  </ToolWorkspace>);
}
