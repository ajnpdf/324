"use client";

import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  LayoutGrid,
  Archive,
  Menu,
  X,
  BookOpen,
  Activity,
  Cpu,
  Zap,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { LogoAnimation } from '../../components/landing/logo-animation';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutGrid, label: 'Main hub', href: '/', description: 'Tool center' },
  { icon: Archive, label: 'All Tools', href: '/pdf-tools', description: 'Complete list' },
  { icon: BookOpen, label: 'Updates', href: '/blog', description: 'News & Guides' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const NavLink = ({ item }: { item: any }) => {
    const isActive = pathname === item.href;
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all group relative",
                isActive 
                  ? "text-white scale-[1.02]" 
                  : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary rounded-2xl -z-10 shadow-lg shadow-primary/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-slate-500 group-hover:text-primary"
              )} />
              {(!collapsed || mobileOpen) && (
                <span className="flex-1 text-[10px] font-black uppercase tracking-widest truncate">
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <Zap className="w-3 h-3 text-white/40 animate-pulse" />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-900 text-white border-none p-2 rounded-lg shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div className="lg:hidden fixed top-3 left-4 z-[70]">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-10 w-10 bg-white/60 backdrop-blur-xl border-black/10 rounded-xl shadow-md"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <aside className={cn(
        "border-r border-black/5 bg-white/40 backdrop-blur-3xl text-slate-900 flex flex-col h-screen fixed left-0 top-0 z-[65] transition-all duration-500",
        collapsed ? "w-20" : "w-64",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0 w-[280px] shadow-2xl" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 mt-12 lg:mt-0 space-y-8">
          <Link href="/" className="flex items-center justify-center group mb-2">
            <LogoAnimation className={cn("transition-all duration-500", collapsed && !mobileOpen ? "w-12 h-6" : "w-24 h-12")} showGlow={false} />
          </Link>

          <div className={cn(
            "flex items-center gap-4 p-4 rounded-3xl bg-white/60 border border-black/5 shadow-sm transition-all",
            collapsed && !mobileOpen && "p-2 justify-center"
          )}>
            <div className="h-10 w-10 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-primary animate-pulse" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="overflow-hidden">
                <p className="font-black text-[11px] uppercase tracking-tighter text-slate-950">Guest Node</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active session</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-10 scrollbar-hide">
          <div className="space-y-1.5">
            {navItems.map((item) => <NavLink key={item.label} item={item} />)}
          </div>

          <div className="px-1">
            <div className={cn(
              "p-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-3 transition-all duration-500",
              collapsed && !mobileOpen ? "opacity-0 scale-90" : "opacity-100"
            )}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Privacy First</span>
              </div>
              <p className="text-[9px] font-bold text-slate-600 uppercase leading-relaxed tracking-wider">
                100% Free. All work stays local in your browser RAM.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-black/5 bg-white/20 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-black/5 rounded-full shadow-sm">
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">India</span>
              <span className="animate-heart-beat text-red-500 text-xs">❤️</span>
            </div>
          </div>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Minimize Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60] lg:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
