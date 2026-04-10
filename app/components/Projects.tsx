"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

type ProjectItem = {
  id: string; title: string; description: string; tags: string[];
  category: string; status: string | null; link: string | null; github: string | null;
};

function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = "perspective(600px) rotateY(" + (x * 5) + "deg) rotateX(" + (-y * 5) + "deg) scale(1.02)";
  };
  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouse} onMouseLeave={handleLeave}
      style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 28, background: "rgba(255,255,255,0.02)", transition: "transform 0.15s ease-out, border-color 0.3s" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(196,168,255,0.15)")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b687c" }}>{project.category}</span>
        {project.status && (<span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#c4a8ff", border: "1px solid rgba(196,168,255,0.2)", borderRadius: 20, padding: "2px 10px" }}>{project.status}</span>)}
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 500, color: "#eae8f0", marginBottom: 10 }}>{project.title}</h3>
      <p style={{ fontSize: 13, color: "#9d99b8", lineHeight: 1.7, marginBottom: 20 }}>{project.description}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {project.tags.map((tag) => (<span key={tag} style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "#6b687c" }}>{tag}</span>))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#b0adc0", textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 16px", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 6 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(196,168,255,0.25)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#b0adc0"; }}
            onClick={(e) => e.stopPropagation()}
          >GitHub &#8599;</a>
        )}
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#b0adc0", textDecoration: "none", background: "rgba(196,168,255,0.06)", border: "1px solid rgba(196,168,255,0.15)", borderRadius: 8, padding: "7px 16px", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 6 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,168,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(196,168,255,0.06)"; e.currentTarget.style.color = "#b0adc0"; }}
            onClick={(e) => e.stopPropagation()}
          >Live Demo &#8599;</a>
        )}
      </div>
    </motion.div>
  );
}

export default function Projects({ data }: { data: ProjectItem[] }) {
  return (
    <section id="projects" style={{ padding: "100px 80px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, color: "#eae8f0", marginBottom: 48 }}>Projects</h2>
      </motion.div>
      {data.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16, padding: 56, textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#6b687c" }}>Projects coming soon &#8212; check back later.</p>
        </motion.div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {data.map((project, i) => (<ProjectCard key={project.id} project={project} index={i} />))}
        </div>
      )}
    </section>
  );
}
