"use client";
import React,{useEffect,useRef,useState} from "react";
import {ToolWorkspace,Drop,Btn,F,G2,Info,Err,IS,ToolFile,T,beginToolProcessing,completeToolProcessing,failToolProcessing} from "./_shared";
import {convertOnServer} from "@/lib/pdf-backend";
import {AUTO_OCR_LANGUAGE,CORE_OCR_LANGUAGE_OPTIONS,fetchOcrLanguageOptions,type OcrLanguageOption} from "@/lib/ocr-languages";

const FALLBACK_LANGUAGES=[AUTO_OCR_LANGUAGE,...CORE_OCR_LANGUAGE_OPTIONS];

async function canvasFile(canvas:HTMLCanvasElement):Promise<File>{
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("The camera frame could not be captured.")),"image/jpeg",0.94));
  return new File([blob],`ajn-camera-scan-${Date.now()}.jpg`,{type:"image/jpeg"});
}

export default function OcrScanner(){
  const [files,setFiles]=useState<ToolFile[]>([]);const [mode,setMode]=useState<"upload"|"camera">("upload");const [language,setLanguage]=useState("auto");
  const [languageOptions,setLanguageOptions]=useState<OcrLanguageOption[]>(FALLBACK_LANGUAGES);
  const [loading,setLoading]=useState(false);const [text,setText]=useState("");const [error,setError]=useState("");const [copied,setCopied]=useState(false);
  const [cameraActive,setCameraActive]=useState(false);const videoRef=useRef<HTMLVideoElement>(null);const canvasRef=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{let active=true;void fetchOcrLanguageOptions("image-to-text").then(options=>{if(active&&options.length)setLanguageOptions(options);}).catch(()=>{});return()=>{active=false;};},[]);

  const startCamera=async()=>{try{if(!navigator.mediaDevices?.getUserMedia)throw new Error("Camera capture is not supported in this browser.");const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080}}});if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}setCameraActive(true);setError("");}catch(e:any){setError(e?.message||"Camera access was denied. Allow camera permission or use Upload.");}};
  const stopCamera=()=>{const stream=videoRef.current?.srcObject as MediaStream|null;stream?.getTracks().forEach(track=>track.stop());if(videoRef.current)videoRef.current.srcObject=null;setCameraActive(false);};

  const recognize=async(file:File)=>{setError("");setLoading(true);setText("");beginToolProcessing("OCR Scanner");try{const converted=await convertOnServer({toolId:"image-to-text",files:[file],outputName:"ajn-scan-text",options:{language,dpi:260,auto_rotate:true,deskew:true,denoise:true,contrast:1.4}});const recognized=(await converted.blob.text()).trim();if(!recognized)throw new Error("No readable text was detected. Try a clearer, closer photo.");setText(recognized);completeToolProcessing();}catch(e:any){failToolProcessing();setError(e?.message||"The scan could not be recognized.");}finally{setLoading(false);}};
  const runUpload=async()=>{if(!files.length){setError("Upload an image to scan.");return;}await recognize(files[0].file);};
  const captureAndScan=async()=>{const video=videoRef.current,canvas=canvasRef.current;if(!video||!canvas||!video.videoWidth){setError("The camera is not ready yet.");return;}canvas.width=video.videoWidth;canvas.height=video.videoHeight;const context=canvas.getContext("2d");if(!context){setError("Camera rendering is unavailable.");return;}context.drawImage(video,0,0);stopCamera();try{await recognize(await canvasFile(canvas));}catch(e:any){setError(e?.message||"The camera frame could not be processed.");}};
  const copy=async()=>{await navigator.clipboard.writeText(text);setCopied(true);window.setTimeout(()=>setCopied(false),1500);};
  const reset=()=>{setText("");setFiles([]);setError("");stopCamera();};
  const words=text.trim()?text.trim().split(/\s+/).length:0;

  return <ToolWorkspace title="OCR Scanner" description="Capture or upload a document photo and recognize text with automatic script/language detection or a specific installed OCR model." accent={T.teal}>
    <div className="space-y-5">
      {!text&&<>
        <G2><F label="Input method"><select style={IS} value={mode} onChange={e=>{setMode(e.target.value as any);if(e.target.value==="upload")stopCamera();}}><option value="upload">Upload image</option><option value="camera">Use camera</option></select></F><F label="OCR language"><select style={IS} value={language} onChange={e=>setLanguage(e.target.value)}>{languageOptions.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></F></G2>
        {mode==="upload"?<Drop files={files} onChange={setFiles} accept=".png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.heic,.heif" label="Choose a document photo" sub="Clear, straight, well-lit photos give the best OCR result"/>:<div className="space-y-3"><div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl bg-black"><video ref={videoRef} playsInline className={cameraActive?"w-full":"hidden"}/>{!cameraActive&&<span className="text-xs font-black uppercase tracking-wider text-slate-400">Camera standby</span>}</div><canvas ref={canvasRef} className="hidden"/>{!cameraActive?<Btn onClick={startCamera} full style={{background:T.teal}}>Start camera</Btn>:<div className="flex gap-2"><Btn onClick={captureAndScan} loading={loading} full style={{background:T.teal}}>Capture & recognize</Btn><Btn variant="secondary" onClick={stopCamera}>Stop</Btn></div>}</div>}
        <Info bg="#F0FDFA" col="#0F766E"><strong>Auto Detect is recommended.</strong> AJN PDF checks the document script before OCR, chooses from the language/script models actually installed on the backend, and blocks obvious wrong-language results. OCR images are processed temporarily by the AJN PDF backend and deleted after the job.</Info>
        <Err msg={error}/>{mode==="upload"&&<Btn onClick={runUpload} loading={loading} disabled={!files.length} full style={{background:T.teal}}>Recognize text</Btn>}
      </>}
      {text&&<div className="space-y-4"><Info bg="#ECFDF5" col="#065F46"><strong>{words} words recognized.</strong> {language==="auto"?"Auto Detect selected the OCR model.":"The selected OCR model was used."} Review OCR text before using it in critical records.</Info><textarea readOnly value={text} rows={16} className="w-full resize-y rounded-2xl border border-slate-200 bg-white p-5 font-mono text-sm leading-7 outline-none"/><div className="flex flex-wrap justify-center gap-2"><Btn onClick={copy} style={{background:T.teal}}>{copied?"Copied":"Copy all"}</Btn><Btn variant="secondary" onClick={()=>{const blob=new Blob([text],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="ajn-ocr-scan.txt";a.click();URL.revokeObjectURL(url);}}>Download TXT</Btn><Btn variant="secondary" onClick={reset}>Scan another</Btn></div><Err msg={error}/></div>}
    </div>
  </ToolWorkspace>;
}
