"use client";

import React,{useMemo,useState} from "react";
import {Copy,FileJson2,FileText,RefreshCcw,Search,Share2} from "lucide-react";
import {ToolWorkspace,Drop,Btn,Done,F,G2,Info,Err,IS,Range,ToolFile,dl,T,shareResult,beginToolProcessing,completeToolProcessing,failToolProcessing,Pills} from "./_shared";
import {convertOnServer} from "@/lib/pdf-backend";
import {analyzeOcrLayout,ocrLayoutBlob,type OcrLayoutResult} from "@/lib/ocr-deep-client";

const LANGUAGES=[
  {value:"eng",label:"English"},{value:"tel",label:"Telugu"},{value:"hin",label:"Hindi"},
  {value:"tam",label:"Tamil"},{value:"kan",label:"Kannada"},{value:"mal",label:"Malayalam"},
] as const;

type OutputMode="text"|"word"|"searchable"|"layout";
type FileResult={kind:"file";blob:Blob;filename:string;text?:string};
type LayoutResult={kind:"layout";blob:Blob;filename:string;layout:OcrLayoutResult};
type Result=FileResult|LayoutResult;

export default function OcrAdvanced(){
  const [files,setFiles]=useState<ToolFile[]>([]);
  const [languages,setLanguages]=useState<string[]>(["eng"]);
  const [dpi,setDpi]=useState(240);
  const [pages,setPages]=useState("all");
  const [mode,setMode]=useState<OutputMode>("text");
  const [psm,setPsm]=useState(3);
  const [minimumConfidence,setMinimumConfidence]=useState(0);
  const [autoRotate,setAutoRotate]=useState(true);
  const [deskew,setDeskew]=useState(true);
  const [denoise,setDenoise]=useState(true);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [result,setResult]=useState<Result|null>(null);
  const selected=files[0]?.file;
  const isPdf=Boolean(selected&&(selected.type==="application/pdf"||selected.name.toLowerCase().endsWith(".pdf")));
  const language=languages.join("+")||"eng";

  const resultText=useMemo(()=>result?.kind==="file"?result.text||"":result?.kind==="layout"?result.layout.pages.map(page=>page.text).join("\n\n"):"",[result]);
  const wordCount=useMemo(()=>result?.kind==="layout"?result.layout.word_count:resultText.trim()?resultText.trim().split(/\s+/).filter(Boolean).length:0,[result,resultText]);

  const toggleLanguage=(value:string)=>{
    setLanguages(current=>{
      if(current.includes(value)){
        if(current.length===1)return current;
        return current.filter(item=>item!==value);
      }
      if(current.length>=3){setError("Choose up to three OCR languages for one job to keep recognition focused and fast.");return current;}
      setError("");
      return [...current,value];
    });
  };

  const run=async()=>{
    if(!selected){setError("Upload a PDF or document image.");return;}
    if(isPdf&&!/^all$|^\s*\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*\s*$/i.test(pages)){setError("Enter PDF pages like all, 2, 1-3, or 1,4,7-9.");return;}
    setError("");setLoading(true);beginToolProcessing("OCR Studio");
    const base=selected.name.replace(/\.[^/.]+$/,"")||"document";
    const common={language,dpi,pages,psm,auto_rotate:autoRotate,deskew,denoise,contrast:1.35};
    try{
      if(mode==="layout"){
        const layout=await analyzeOcrLayout({file:selected,language,dpi,pages:isPdf?pages:"all",minWordConfidence:minimumConfidence,psm,autoRotate,deskew,denoise,contrast:1.35});
        setResult({kind:"layout",layout,blob:ocrLayoutBlob(layout),filename:`${base}-ocr-layout.json`});
      }else{
        const toolId=mode==="text"?(isPdf?"scanned-pdf-to-text":"image-to-text"):mode==="word"?(isPdf?"scanned-pdf-to-word":"image-to-word"):(isPdf?"scanned-pdf-to-searchable-pdf":"image-to-searchable-pdf");
        const converted=await convertOnServer({toolId,files:[selected],outputName:`${base}-${mode==="searchable"?"searchable":"ocr"}`,options:common});
        if(mode==="text"){
          const text=await converted.blob.text();
          if(!text.trim())throw new Error("OCR completed but no readable text was found. Try another language or a clearer scan.");
          setResult({kind:"file",...converted,text});
        }else setResult({kind:"file",...converted});
      }
      completeToolProcessing();
    }catch(e:any){failToolProcessing();setError(e?.message||"OCR could not be completed.");}
    finally{setLoading(false);}
  };

  const reset=()=>{setFiles([]);setResult(null);setError("");setPages("all");};

  if(result){
    const label=result.kind==="layout"?"OCR layout JSON is ready":mode==="word"?"OCR Word document is ready":mode==="searchable"?"Searchable PDF is ready":"OCR text is ready";
    return <ToolWorkspace title="OCR Studio" description="Multilingual OCR with document output, confidence and layout data." accent={T.purple}>
      <div className="space-y-5">
        {result.kind==="layout"&&<div className="grid gap-3 sm:grid-cols-4">
          <Info><strong>{result.layout.page_count}</strong><br/>pages analyzed</Info>
          <Info><strong>{result.layout.word_count}</strong><br/>recognized words</Info>
          <Info><strong>{result.layout.average_confidence}%</strong><br/>average confidence</Info>
          <Info><strong>{result.layout.language.toUpperCase()}</strong><br/>language model</Info>
        </div>}
        {resultText&&<><Info bg="#ECFDF5" col="#065F46"><strong>{wordCount} words recognized.</strong> OCR can contain mistakes; review important names, numbers and legal text.</Info><textarea readOnly value={resultText} rows={16} className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 outline-none"/><G2><Btn variant="secondary" onClick={()=>void navigator.clipboard.writeText(resultText)}><Copy size={15}/>Copy recognized text</Btn><Btn variant="secondary" onClick={()=>void shareResult(result.blob,result.filename)}><Share2 size={15}/>Share result</Btn></G2></>}
        {result.kind==="layout"&&result.layout.pages[0]&&<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold leading-6 text-slate-600"><strong>Page 1 analysis:</strong> {result.layout.pages[0].words.length} words · {result.layout.pages[0].lines.length} lines · script {result.layout.pages[0].orientation.script} · rotation suggestion {result.layout.pages[0].orientation.rotate_degrees}°.</div>}
        <Done msg={label} dlLabel={result.kind==="layout"?"Download layout JSON":mode==="word"?"Download Word":mode==="searchable"?"Download searchable PDF":"Download TXT"} onDownload={()=>dl(result.blob,result.filename)} shareFile={{blob:result.blob,name:result.filename}} onReset={reset}/>
      </div>
    </ToolWorkspace>;
  }

  return <ToolWorkspace title="OCR Studio" description="Recognize text from PDFs and images with multilingual OCR, searchable PDF, Word and layout JSON outputs." accent={T.purple}>
    <div className="space-y-5">
      <Drop files={files} onChange={setFiles} accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.heic,.heif" label="Choose a scan or document" sub="PDF, JPG, PNG, WebP, BMP, TIFF or HEIC/HEIF where supported"/>

      <F label="Output"><Pills opts={[{label:"Text",value:"text"},{label:"Word",value:"word"},{label:"Searchable PDF",value:"searchable"},{label:"Layout JSON",value:"layout"}]} val={mode} onChange={setMode}/></F>

      <F label="OCR languages" hint="Select the languages that really appear in the document. Up to three can be combined in one Tesseract pass."><div className="flex flex-wrap gap-2">{LANGUAGES.map(item=><button type="button" key={item.value} aria-pressed={languages.includes(item.value)} onClick={()=>toggleLanguage(item.value)} className={`min-h-10 rounded-xl border px-3 text-xs font-black transition ${languages.includes(item.value)?"border-violet-600 bg-violet-600 text-white":"border-slate-200 bg-white text-slate-700 hover:border-violet-300"}`}>{item.label}</button>)}</div></F>

      <G2>
        <F label="Recognition resolution"><Range label="DPI" value={dpi} min={150} max={400} step={10} onChange={setDpi} fmt={v=>`${v} DPI`}/></F>
        <F label="Layout model"><select style={IS} value={psm} onChange={e=>setPsm(Number(e.target.value))}><option value={3}>Automatic page</option><option value={6}>Single text block</option><option value={11}>Sparse text</option><option value={12}>Sparse text + OSD</option></select></F>
      </G2>

      {isPdf&&<F label="PDF pages" hint="Use all, 2, 1-3, or 1,4,7-9"><input style={IS} value={pages} onChange={e=>setPages(e.target.value)} /></F>}
      {mode==="layout"&&<Range label="Minimum word confidence" value={minimumConfidence} min={0} max={90} step={5} onChange={setMinimumConfidence} fmt={v=>v===0?"Keep all":`${v}%+`}/>} 

      <div className="grid gap-2 sm:grid-cols-3">
        <label className="jn-file-pill justify-start"><input type="checkbox" checked={autoRotate} onChange={e=>setAutoRotate(e.target.checked)}/><span className="text-xs font-bold text-slate-700">Auto orientation</span></label>
        <label className="jn-file-pill justify-start"><input type="checkbox" checked={deskew} onChange={e=>setDeskew(e.target.checked)}/><span className="text-xs font-bold text-slate-700">Deskew scan</span></label>
        <label className="jn-file-pill justify-start"><input type="checkbox" checked={denoise} onChange={e=>setDenoise(e.target.checked)}/><span className="text-xs font-bold text-slate-700">Denoise</span></label>
      </div>

      <Info bg="#F5F3FF" col="#5B21B6">Layout JSON includes page text, line groups, per-word confidence, bounding boxes, orientation and detected script. Searchable PDF keeps page appearance and adds a text layer.</Info>
      <Err msg={error}/><Btn onClick={run} loading={loading} disabled={!selected} full style={{background:T.purple}}>{mode==="layout"?<FileJson2 size={16}/>:mode==="searchable"?<Search size={16}/>:<FileText size={16}/>}Run OCR</Btn>
      {selected&&<button type="button" onClick={reset} className="mx-auto flex items-center gap-2 text-xs font-bold text-slate-500"><RefreshCcw size={13}/>Choose another file</button>}
    </div>
  </ToolWorkspace>;
}
