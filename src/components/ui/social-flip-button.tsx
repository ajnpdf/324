"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Twitter, 
  Instagram, 
  Facebook, 
  Send, 
  Mail, 
  Linkedin, 
  Youtube 
} from "lucide-react";
import { cn } from "../../lib/utils";

const socials = [
  { icon: Twitter, href: "https://x.com/ajnpdf16800", color: "bg-[#000000]", label: "X" },
  { icon: Instagram, href: "https://www.instagram.com/ajnpdf.in/", color: "bg-[#E4405F]", label: "IG" },
  { icon: Facebook, href: "https://www.facebook.com/share/1XJC6U1m7w/", color: "bg-[#1877F2]", label: "FB" },
  { icon: Send, href: "https://t.me/AJNPDF", color: "bg-[#229ED9]", label: "TG" },
  { icon: Mail, href: "mailto:ajnpdf1@gmail.com", color: "bg-[#EA4335]", label: "Gmail" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/ajn-studio-76126b3b7", color: "bg-[#0A66C2]", label: "In" },
  { icon: Youtube, href: "https://www.youtube.com/channel/UC67g5gmuht1iNXpwn0zlIPg", color: "bg-[#FF0000]", label: "YT" },
];

export default function SocialFlipButton() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-4">
      {socials.map((social, index) => (
        <motion.a
          key={index}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-14 h-14"
          initial="initial"
          whileHover="hover"
        >
          <div className="relative w-full h-full [perspective:1000px]">
            <motion.div
              className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d]"
              variants={{
                initial: { rotateY: 0 },
                hover: { rotateY: 180 }
              }}
            >
              {/* Front Side */}
              <div className="absolute inset-0 [backface-visibility:hidden] flex items-center justify-center bg-white border border-black/5 rounded-[1.25rem] shadow-sm">
                <social.icon className="w-6 h-6 text-slate-600" />
              </div>
              
              {/* Back Side */}
              <div className={cn(
                "absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center rounded-[1.25rem] shadow-xl",
                social.color
              )}>
                <social.icon className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </div>
          
          {/* Tooltip */}
          <motion.span 
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            variants={{
              initial: { y: 0, opacity: 0 },
              hover: { y: 5, opacity: 1 }
            }}
          >
            {social.label}
          </motion.span>
        </motion.a>
      ))}
    </div>
  );
}
