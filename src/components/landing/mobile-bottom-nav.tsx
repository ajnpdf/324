"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, Image as ImageIcon, LayoutGrid, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Tools", href: "/pdf-tools", icon: LayoutGrid },
  { label: "Convert", href: "/conversion-tools", icon: Repeat2 },
  { label: "Images", href: "/image-tools", icon: ImageIcon },
  { label: "PDF", href: "/pdf-utilities", icon: FileText }] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="ajn-mobile-bottom-nav md:hidden" aria-label="Quick navigation">
      <div className="ajn-mobile-bottom-nav-inner">
        {items.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn("ajn-mobile-nav-item", active && "is-active")}
              data-analytics-id={`bottom-nav-${label.toLowerCase()}`}
            >
              <span className="ajn-mobile-nav-icon"><Icon aria-hidden="true" /></span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
