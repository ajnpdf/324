"use client";

import React, { useState, useEffect } from "react";
import { Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FeedbackModal } from "../junction/feedback-modal";

/**
 * AJN Global Feedback Trigger - Modernized
 */
export function FloatingFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleFeedbackTrigger = () => {
      const hasShown = sessionStorage.getItem('ajnpdf_feedback_shown') === 'true';
      if (!hasShown) {
        setIsOpen(true);
        sessionStorage.setItem('ajnpdf_feedback_shown', 'true');
      }
    };

    const handleForceTrigger = () => {
      setIsOpen(true);
    };

    window.addEventListener('trigger-feedback', handleFeedbackTrigger);
    window.addEventListener('trigger-ajn-feedback', handleForceTrigger);
    
    return () => {
      window.removeEventListener('trigger-feedback', handleFeedbackTrigger);
      window.removeEventListener('trigger-ajn-feedback', handleForceTrigger);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100]"
      >
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-4 px-5 py-4 bg-white border border-black/10 rounded-2xl shadow-xl hover:shadow-2xl transition-all group backdrop-blur-xl"
        >
          <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary transition-all group-hover:bg-primary group-hover:text-white">
            <Flag className="w-5 h-5 fill-current" />
          </div>
          
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Share</span>
            <span className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">Feedback</span>
          </div>

          <div className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
        </button>
      </motion.div>

      <FeedbackModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
