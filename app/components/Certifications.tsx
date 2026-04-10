"use client";

import { motion } from "framer-motion";

type CertItem = {
  id: string;
  title: string;
  issuer: string;
  description: string | null;
  skills: string[];
  date: string | null;
};

const activities = [
  {
    title: "Student Council Representative",
    org: "Silver Oaks International School",
    duration: "Jul 2023 \u2014 Apr 2025",
    description: [
      "Coordinated 13+ school-wide initiatives and events, managing communication between students and faculty.",
      "Led 6+ peer teams to execute large-scale student activities and resolve operational issues.",
    ],
  },
  {
    title: "BITS Model United Nations \u2014 Delegate",
    org: "BITS Pilani",
    duration: "Nov 2024",
    description: [
      "Developed advanced public speaking and negotiation techniques through structured debates on international policy.",
      "Analyzed complex global issues to draft resolution papers and lead diplomatic caucuses.",
    ],
  },
];

export default function Certifications({ data }: { data: CertItem[] }) {
  return (
    <section id="certifications" style={{ padding: "100px 80px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
      {/* Certifications */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, color: "#eae8f0", marginBottom: 40 }}>Certifications</h2>
      </motion.div>

      {data.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16, padding: 48, textAlign: "center", background: "rgba(255,255,255,0.02)", marginBottom: 80 }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#6b687c" }}>Certifications coming soon.</p>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 80 }}>
          {data.map((cert, i) => (
            <motion.div key={cert.id}
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28, transition: "border-color 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(196,168,255,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(196,168,255,0.08)", border: "1px solid rgba(196,168,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, color: "#c4a8ff" }}>{cert.issuer.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 500, color: "#eae8f0", marginBottom: 4 }}>{cert.title}</h3>
                    <p style={{ fontSize: 13, color: "#b0adc0", marginBottom: cert.description ? 12 : 0 }}>{cert.issuer}</p>
                    {cert.description && <p style={{ fontSize: 13, color: "#9d99b8", lineHeight: 1.7, marginBottom: cert.skills.length > 0 ? 14 : 0 }}>{cert.description}</p>}
                    {cert.skills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {cert.skills.map((s) => (
                          <span key={s} style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "#b0adc0", background: "rgba(196,168,255,0.06)", border: "1px solid rgba(196,168,255,0.1)", borderRadius: 20, padding: "4px 12px" }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {cert.date && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b687c", whiteSpace: "nowrap", marginLeft: 16 }}>{cert.date}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Activities */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, color: "#eae8f0", marginBottom: 32 }}>Activities</h2>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {activities.map((activity, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28, transition: "border-color 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(196,168,255,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <h3 style={{ fontSize: 17, fontWeight: 500, color: "#eae8f0" }}>{activity.title}</h3>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b687c", whiteSpace: "nowrap", marginLeft: 20 }}>{activity.duration}</span>
            </div>
            <p style={{ fontSize: 13, color: "#b0adc0", marginBottom: 16 }}>{activity.org}</p>
            <ul style={{ listStyle: "none" }}>
              {activity.description.map((line, j) => (
                <li key={j} style={{ fontSize: 13, color: "#9d99b8", lineHeight: 1.7, paddingLeft: 14, position: "relative", marginBottom: 8 }}>
                  <span style={{ position: "absolute", left: 0, color: "#3a3660" }}>&bull;</span>{line}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
