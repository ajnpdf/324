"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ShieldCheck, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
}

/**
 * AJN File Dropzone - Hardened v15.7
 * Fixed: Corrected ReferenceError by synchronizing isDragActive state setter.
 */
export function FileDropzone({ 
  onFilesAdded, 
  accept = { "application/pdf": [".pdf"] }, 
  multiple = true 
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragActive(false);
    if (acceptedFiles.length > 0) {
      onFilesAdded(acceptedFiles);
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept,
    multiple,
    noClick: true, 
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const rootProps = getRootProps();
  const dropzoneHandlers = {
    onDrop: rootProps.onDrop as any,
    onDragOver: rootProps.onDragOver as any,
    onDragEnter: rootProps.onDragEnter as any,
    onDragLeave: rootProps.onDragLeave as any,
  };

  return (
    <motion.div
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Choose files or drag and drop files here"
      {...dropzoneHandlers}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative h-80 rounded-[3rem] border-2 border-dashed transition-all duration-500 cursor-pointer flex flex-col items-center justify-center group overflow-hidden",
        isDragActive 
          ? "border-primary bg-primary/5 scale-[0.99] shadow-xl" 
          : "border-black/10 bg-white/20 backdrop-blur-md hover:border-primary/40 hover:bg-white/40"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-[3rem] group-hover:border-primary transition-colors" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/20 rounded-tr-[3rem] group-hover:border-primary transition-colors" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/20 rounded-bl-[3rem] group-hover:border-primary transition-colors" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-[3rem] group-hover:border-primary transition-colors" />

      <motion.div 
        animate={{ y: isDragActive ? -10 : 0 }}
        className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
      >
        <Upload className="w-10 h-10 text-primary" />
      </motion.div>

      <div className="text-center space-y-2 px-12 relative z-10">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          {isDragActive ? "Drop to Process" : "Drop Files Here"}
        </h3>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest text-center">
          Browser tools stay in this tab. Tools that require temporary server processing are clearly labelled.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
            <ShieldCheck className="w-4 h-4" /> Secure Buffer
          </span>
          <span className="w-1 h-1 rounded-full bg-black/10" />
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <Zap className="w-4 h-4" /> Client-Side
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/5 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
