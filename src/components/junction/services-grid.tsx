"use client";

import { ALL_TOOLS } from "../../lib/tools-data";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { useMemo, useState, useEffect, useRef } from "react";

interface ServicesGridProps {
  query: string;
  category: string;
}

/**
 * AJN Directory Tool Card - Minimalist Production
 * Purged "Active" and "Launch" text for clean professional discovery.
 */
function LiquidToolCard({ tool }: { tool: any }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    cardRef.current.style.setProperty("--x", x + "%");
    cardRef.current.style.setProperty("--y", y + "%");

    const rotateX = (y - 50) / 15;
    const rotateY = (50 - x) / 15;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  return (
    <Link href={`/${tool.id}`}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="liquid-card h-full"
      >
        <div className="p-5 md:p-6 flex flex-col h-full gap-4 relative z-10">
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center shadow-md border border-black/5 transition-all duration-500 bg-white",
                tool.color
              )}
            >
              <tool.icon className="w-5 h-5" />
            </div>
            {tool.badge && (
              <Badge
                className={cn(
                  "text-[7px] font-black uppercase px-2 h-4.5 tracking-widest border-none shadow-sm",
                  tool.badge === "Popular" ? "bg-amber-500 text-white" : tool.badge === "Smart" ? "bg-primary text-white" : "bg-emerald-500 text-white"
                )}
              >
                {tool.badge}
              </Badge>
            )}
          </div>

          <div className="space-y-1.5 flex-1 pt-1">
            <h3 className="text-sm font-black uppercase tracking-tight leading-tight text-slate-950">
              {tool.name}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2 opacity-70">
              {tool.desc}
            </p>
          </div>

          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ServicesGrid({ query, category }: ServicesGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_TOOLS.filter((tool) => {
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q));
      const matchesCat =
        category === "All" || (category === "AJN PDF" && tool.cat === "pdf") || (category === "AJN IMG" && tool.cat === "img");
      return matchesSearch && matchesCat;
    });
  }, [query, category]);

  if (!mounted) return <div className="h-[300px] bg-white/5 animate-pulse rounded-2xl" />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool) => (
            <motion.div
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2 }}
            >
              <LiquidToolCard tool={tool} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
