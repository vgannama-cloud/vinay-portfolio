"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

type Profile = {
  name: string; tagline: string; subtitle: string; about: string;
  email: string; github: string; linkedin: string; twitter: string | null; skills: string[];
};

type EducationItem = {
  id: string; school: string; degree: string; details: string | null;
  location: string | null; date: string; activities: string | null; sort_order: number;
};

type SkillCategory = {
  id: string; category: string; skills: string[]; sort_order: number;
};

function InteractiveCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = "perspective(800px) rotateY(" + (x * 5) + "deg) rotateX(" + (-y * 5) + "deg) scale(1.01)";
  };
  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  };
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouse} onMouseLeave={handleLeave}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28, transition: "transform 0.15s ease-out, border-color 0.3s", cursor: "default" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
    >{children}</motion.div>
  );
}

function SkillPill({ name }: { name: string }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#b0adc0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "8px 18px", display: "inline-block", transition: "all 0.3s", cursor: "default" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(196,168,255,0.3)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(196,168,255,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#b0adc0"; e.currentTarget.style.background = "transparent"; }}
    >{name}</span>
  );
}

export default function About({ profile, education, skillCategories }: { profile: Profile; education: EducationItem[]; skillCategories: SkillCategory[] }) {
  const sentences = profile.about.split(". ");
  const mid = Math.ceil(sentences.length / 2);
  const p1 = sentences.slice(0, mid).join(". ") + ".";
  const p2 = sentences.slice(mid).join(". ");

  return (
    <section id="about" style={{ padding: "40px 80px 100px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
      <InteractiveCard delay={0}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#eae8f0", marginBottom: 16 }}>About Me</h3>
        <p style={{ fontSize: 15, color: "#b0adc0", lineHeight: 1.8, marginBottom: 12 }}>{p1}</p>
        <p style={{ fontSize: 15, color: "#b0adc0", lineHeight: 1.8 }}>{p2}</p>
      </InteractiveCard>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }} style={{ marginTop: 48 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, color: "#eae8f0", marginBottom: 32 }}>Education</h2>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {education.map((edu, i) => (
          <InteractiveCard key={edu.id} delay={i * 0.08}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 500, color: "#eae8f0", marginBottom: 4 }}>{edu.school}</h3>
                <p style={{ fontSize: 14, color: "#b0adc0", marginBottom: 4 }}>{edu.degree}</p>
                {edu.details && <p style={{ fontSize: 14, fontWeight: 500, color: "#c4a8ff", marginBottom: 4 }}>{edu.details}</p>}
                {edu.location && <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b687c", marginTop: 4 }}>{edu.location}</p>}
                {edu.activities && <p style={{ fontSize: 12, color: "#6b687c", marginTop: 8 }}>Activities: {edu.activities}</p>}
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b687c", whiteSpace: "nowrap", marginLeft: 20 }}>{edu.date}</span>
            </div>
          </InteractiveCard>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }} style={{ marginTop: 48 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, color: "#eae8f0", marginBottom: 32 }}>Skills</h2>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {skillCategories.map((cat, i) => (
          <motion.div key={cat.id}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, transition: "border-color 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
          >
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6b687c", marginBottom: 16 }}>{cat.category}</p>
            {cat.skills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {cat.skills.map((s) => <SkillPill key={s} name={s} />)}
              </div>
            ) : (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#3d3960", fontStyle: "italic" }}>Coming soon</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
