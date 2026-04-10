"use client";

import { motion } from "framer-motion";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "36px 80px", maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#6b687c" }}>&#169; {year} Vinay Gannamaneni</p>
      <a href="#" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#6b687c", textDecoration: "none", transition: "color 0.3s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#c4a8ff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b687c")}
      >Back to top &#8593;</a>
    </motion.footer>
  );
}
