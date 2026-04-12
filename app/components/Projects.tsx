"use client";

import { motion } from "framer-motion";

type ProjectItem = {
  id: string; title: string; description: string; tags: string[];
  category: string; status: string | null; link: string | null; github: string | null;
};

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
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {data.map((project, i) => (
            <motion.div key={project.id}
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 28, transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(196,168,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b687c" }}>{project.category}</span>
                {project.status && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#c4a8ff", border: "1px solid rgba(196,168,255,0.2)", borderRadius: 20, padding: "2px 10px" }}>{project.status}</span>}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 500, color: "#eae8f0", marginBottom: 12 }}>{project.title}</h3>
              <p style={{ fontSize: 13, color: "#9d99b8", lineHeight: 1.7, marginBottom: 20 }}>{project.description}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: project.github || project.link ? 20 : 0 }}>
                {project.tags.map((tag) => (
                  <span key={tag} style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "#6b687c", background: "rgba(196,168,255,0.06)", border: "1px solid rgba(196,168,255,0.1)", borderRadius: 20, padding: "3px 10px" }}>{tag}</span>
                ))}
              </div>

              {(project.github || project.link) && (
                <div style={{ display: "flex", gap: 10 }}>
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#b0adc0", textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 16px", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 6 }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(196,168,255,0.25)"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#b0adc0"; }}
                    >GitHub &#8599;</a>
                  )}
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#b0adc0", textDecoration: "none", background: "rgba(196,168,255,0.06)", border: "1px solid rgba(196,168,255,0.15)", borderRadius: 8, padding: "7px 16px", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 6 }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,168,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(196,168,255,0.06)"; e.currentTarget.style.color = "#b0adc0"; }}
                    >Live Demo &#8599;</a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
