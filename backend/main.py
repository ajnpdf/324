
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pypdf import PdfWriter
import uvicorn
import os
import shutil
import uuid
import time
from typing import List

app = FastAPI(title="AJN Tool API")

# Allow requests from the main domain and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ajnpdf.com",
        "https://www.ajnpdf.com",
        "http://localhost:3000",
        "http://localhost:9002",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_files"
os.makedirs(TEMP_DIR, exist_ok=True)

def cleanup_file(path: str):
    """Delete temporary files after a short delay to protect privacy."""
    time.sleep(300) # 5 minute buffer
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass

@app.get("/health")
async def health():
    """Heartbeat endpoint for deployment monitoring."""
    return {"status": "ok"}

@app.post("/api/pdf/merge")
async def merge_pdfs(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Please select at least two PDF files.")
    
    merger = PdfWriter()
    temp_paths = []
    
    try:
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
            
            temp_path = os.path.join(TEMP_DIR, f"{uuid.uuid4()}_{file.filename}")
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            temp_paths.append(temp_path)
            merger.append(temp_path)
        
        output_filename = f"merged_{uuid.uuid4()}.pdf"
        output_path = os.path.join(TEMP_DIR, output_filename)
        
        with open(output_path, "wb") as f:
            merger.write(f)
        
        # Clean up files after sending the response
        for p in temp_paths:
            background_tasks.add_task(cleanup_file, p)
        background_tasks.add_task(cleanup_file, output_path)
            
        return FileResponse(
            output_path, 
            media_type="application/pdf", 
            filename="merged.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unable to merge files. Please try again.")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
