"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";
import { cn } from "../../lib/utils";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJIS = [
  { icon: "😡", label: "Angry" },
  { icon: "😕", label: "Disappointed" },
  { icon: "😐", label: "Neutral" },
  { icon: "😊", label: "Happy" },
  { icon: "😍", label: "Love" },
];

/**
 * AJN Feedback Portal - Professional Edition v6.0
 * High-fidelity interaction with industrial design language.
 */
export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { toast } = useToast();
  const db = useFirestore();
  
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [floatEmoji, setFloatEmoji] = useState<{ icon: string; id: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmoji === null || !db) return;

    setLoading(true);
    
    try {
      const payload = {
        rating: EMOJIS[selectedEmoji].label,
        emoji: EMOJIS[selectedEmoji].icon,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        source: window.location.pathname,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      };

      addDocumentNonBlocking(collection(db, 'feedback'), payload);
      
      setFloatEmoji({ icon: EMOJIS[selectedEmoji].icon, id: Date.now() });
      setSuccess(true);
      
      setTimeout(() => setFloatEmoji(null), 1500);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Could not sync report with the network.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setMessage("");
    setSelectedEmoji(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] bg-white/95 backdrop-blur-3xl border border-black/5 rounded-[3rem] p-0 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.25)]">
        <div className="p-10 space-y-10 text-center relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
            <MessageSquare size={160} className="text-slate-900" />
          </div>

          <DialogHeader className="space-y-3 relative z-10">
             <div className="flex justify-center mb-1">
                <span className="bg-primary/5 text-primary text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-primary/10">User Insight</span>
             </div>
            <DialogTitle className="text-2xl font-bold tracking-tighter text-slate-950 leading-tight uppercase italic">
              Help us <span className="text-primary/40">improve.</span>
            </DialogTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
              Your session feedback drives our professional engineering cycle.
            </p>
          </DialogHeader>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              {/* EMOJI ROW */}
              <div className="flex justify-between items-center px-4">
                {EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedEmoji(i)}
                    className={cn(
                      "text-4xl transition-all duration-500 relative focus:outline-none",
                      selectedEmoji === i 
                        ? "-translate-y-3 scale-125 opacity-100 drop-shadow-2xl" 
                        : "opacity-40 hover:opacity-100 hover:-translate-y-1 hover:scale-110"
                    )}
                  >
                    {emoji.icon}
                    {selectedEmoji === i && (
                      <motion.div 
                        layoutId="emoji-glow"
                        className="absolute inset-[-15px] bg-primary/10 rounded-full -z-10 blur-xl animate-pulse"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* TEXTAREA & COUNTER */}
              <div className="space-y-2">
                <Textarea 
                  placeholder="Share your thoughts on this session..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={200}
                  className="min-h-[140px] bg-slate-50/50 border-black/5 rounded-[1.75rem] p-6 font-medium text-sm focus:border-primary/20 focus:ring-8 focus:ring-primary/5 shadow-inner resize-none transition-all placeholder:text-slate-300"
                />
                <div className="flex justify-between items-center px-2">
                  <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1.5"><Sparkles className="w-3 h-3"/> Local Submission</span>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter tabular-nums">
                    {message.length}/200
                  </div>
                </div>
              </div>

              <Button 
                disabled={loading || selectedEmoji === null}
                className="w-full h-14 bg-slate-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-black active:scale-95 transition-all gap-3 border-2 border-white/10"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dispatch Feedback"}
              </Button>
            </form>
          ) : (
            <div className="py-8 space-y-10 animate-in zoom-in-95 duration-500 relative z-10">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-emerald-500/20 shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-950 italic leading-none">Sync <span className="text-emerald-500">Success</span></h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Your report has been successfully integrated <br /> into the AJN development stream.</p>
              </div>
              <Button 
                onClick={handleClose}
                className="w-full h-14 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all active:scale-95 border-2 border-white/20"
              >
                Return to Workspace
              </Button>
            </div>
          )}
        </div>

        {/* FLOATING EMOJI ANIMATION */}
        <AnimatePresence>
          {floatEmoji && (
            <motion.div
              key={floatEmoji.id}
              initial={{ y: 0, opacity: 0, scale: 0.8 }}
              animate={{ y: -300, opacity: [0, 1, 1, 0], scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 text-7xl pointer-events-none z-[1100]"
            >
              {floatEmoji.icon}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
