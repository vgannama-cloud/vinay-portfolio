"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Certs", href: "#certifications" },
];

export default function Navbar({ resumeUrl }: { resumeUrl?: string | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleDownloadResume = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!resumeUrl) return;
    try {
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Vinay_Gannamaneni_Resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(resumeUrl, "_blank");
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all 0.5s",
        background: scrolled ? "rgba(12,12,18,0.7)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 80px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="#" style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, color: "#eae8f0", textDecoration: "none", letterSpacing: "-0.02em" }}>
          Vinay G.
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 40, padding: "6px 6px" }}>
          {navItems.map((item) => (
            <a key={item.label} href={item.href} style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a86a0", textDecoration: "none", padding: "8px 18px", borderRadius: 30, transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#8a86a0"; e.currentTarget.style.background = "transparent"; }}
            >{item.label}</a>
          ))}
          {resumeUrl ? (
            <a href="#" onClick={handleDownloadResume} style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0c0c12", textDecoration: "none", padding: "8px 20px", borderRadius: 30, background: "#eae8f0", transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#c4a8ff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#eae8f0"; }}
            >Resume</a>
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b687c", padding: "8px 20px", borderRadius: 30, background: "rgba(255,255,255,0.04)" }}>Resume</span>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
