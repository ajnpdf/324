/**
 * ============================================================
 * AJN PDF — <ToolLayout /> Component
 * ============================================================
 * File: /components/ToolLayout.jsx
 *
 * Wraps every tool page with:
 *  - Consistent top navigation bar (fixes missing nav bug)
 *  - Tool header (badge, title, description)
 *  - Consistent footer
 *  - Breadcrumb trail for SEO and UX
 *
 * Usage:
 *   <ToolLayout tool={toolObject}>
 *     <YourToolUI />
 *   </ToolLayout>
 * ============================================================
 */

import Link from 'next/link';
import styles from './ToolLayout.module.css';

export default function ToolLayout({ tool, children }) {
  return (
    <div className={styles.page}>

      {/* ── TOP NAVIGATION — fixes the "no nav on tool pages" issue */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>
          AJN
        </Link>
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/pdf-tools">All Tools</Link>
          <Link href="/security">Security</Link>
          <Link href="/about">Our Story</Link>
        </div>
        {/* Mobile hamburger — implement as needed */}
        <button className={styles.menuBtn} aria-label="Open menu">☰</button>
      </nav>

      {/* ── BREADCRUMB */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span> › </span>
        <Link href="/pdf-tools">Tools</Link>
        <span> › </span>
        <span>{tool.name}</span>
      </div>

      {/* ── TOOL HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {tool.badge && (
            <span className={`${styles.badge} ${styles[`badge${tool.badge}`]}`}>
              {tool.badge}
            </span>
          )}
          <span className={styles.category}>{tool.category} Tool</span>
          <h1 className={styles.title}>{tool.name}</h1>
          <p className={styles.description}>{tool.description}</p>
          <div className={styles.securityNote}>
            <span>🔒 Local Buffer Safe</span>
            <span>·</span>
            <span>⚡ Fast Processing</span>
            <span>·</span>
            <span>🇮🇳 Made in India</span>
          </div>
        </div>
      </header>

      {/* ── MAIN TOOL AREA */}
      <main className={styles.main}>
        {children}
      </main>

      {/* ── CONSISTENT FOOTER — fixes footer inconsistency */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerSection}>
            <h4>Popular Tools</h4>
            <Link href="/tools/merge-pdf">Merge PDF</Link>
            <Link href="/tools/split-pdf">Split PDF</Link>
            <Link href="/tools/compress-pdf">Reduce Size</Link>
            <Link href="/tools/organize-pdf">Organize PDF</Link>
            <Link href="/tools/pdf-to-zip">PDF to ZIP</Link>
          </div>
          <div className={styles.footerSection}>
            <h4>Company</h4>
            <Link href="/about">Our Story</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/security">Security Hub</Link>
            <Link href="/dmca">DMCA</Link>
          </div>
          <div className={styles.footerSection}>
            <h4>Legal</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/copyright">Copyright Policy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/cookies">Cookie Policy</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 AJN (ANJAN) STUDIO — All Rights Reserved</span>
          <span>ajnpdf1@gmail.com · Study Connect Solutions Pvt Ltd</span>
          <span>Built by ANJAN ❤️</span>
        </div>
      </footer>
    </div>
  );
}
