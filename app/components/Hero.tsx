"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type Profile = {
  name: string; tagline: string; subtitle: string; about: string;
  email: string; github: string; linkedin: string; twitter: string | null;
  skills: string[]; photo_url: string | null; resume_url: string | null;
};

export default function Hero({ profile }: { profile: Profile }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const handleDownloadResume = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!profile.resume_url) return;
    try {
      const response = await fetch(profile.resume_url);
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
      window.open(profile.resume_url, "_blank");
    }
  };

  return (
    <section ref={ref} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", maxWidth: 1000, margin: "0 auto", padding: "120px 80px 80px", zIndex: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 56, alignItems: "center", width: "100%" }}>
        <motion.div style={{ y: textY }}>
          <motion.div initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.3 }}
            style={{ display: "inline-block", background: "rgba(196,168,255,0.08)", border: "1px solid rgba(196,168,255,0.12)", borderRadius: 40, padding: "8px 20px", marginBottom: 32 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c4a8ff" }}>
              CS &middot; Machine Intelligence &middot; Purdue
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.5 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 20 }}>
            <span style={{ color: "#eae8f0" }}>Vinay</span><br />
            <span style={{ color: "#6b687c" }}>Gannamaneni</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.7 }}
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18, color: "#b0adc0", maxWidth: 420, marginBottom: 32, lineHeight: 1.6 }}>
            {profile.tagline}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
            style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            <a href="#work" style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", textDecoration: "none", background: "rgba(196,168,255,0.12)", border: "1px solid rgba(196,168,255,0.2)", borderRadius: 40, padding: "12px 28px", transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,168,255,0.22)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(196,168,255,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >View Work &#8599;</a>
            {profile.resume_url ? (
              <a href="#" onClick={handleDownloadResume} style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#b0adc0", textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 40, padding: "12px 28px", transition: "all 0.3s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#b0adc0"; e.currentTarget.style.transform = "translateY(0)"; }}
              >Resume &#8595;</a>
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3d3960", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 40, padding: "12px 28px" }}>Resume &#8595;</span>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }}
            style={{ display: "flex", gap: 20 }}>
            {[
              { label: "GitHub", href: profile.github },
              { label: "LinkedIn", href: profile.linkedin },
              { label: "Email", href: profile.email ? "mailto:" + profile.email : null },
            ].filter(s => s.href).map((s) => (
              <a key={s.label} href={s.href!} target={s.label !== "Email" ? "_blank" : undefined} rel="noopener noreferrer"
                style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", color: "#6b687c", textDecoration: "none", transition: "color 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c4a8ff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b687c")}
              >{s.label} &#8599;</a>
            ))}
          </motion.div>
        </motion.div>

        <motion.div style={{ y: photoY }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1, delay: 0.5 }}
            style={{ width: 320, height: 400, borderRadius: 20, background: "linear-gradient(145deg, rgba(196,168,255,0.06), rgba(232,168,124,0.04))", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.05)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 22, color: "#6b687c" }}>&#128100;</span>
                </div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b687c" }}>Photo coming soon</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
