"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type ExperienceItem = {
  id: string; title: string; company: string; location: string;
  duration: string; description: string[]; tags: string[]; sort_order: number;
  images: string[] | null;
};

function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);
  const total = images.length;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + total) % total);
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % total);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handleKey); };
  }, [total, onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, cursor: "pointer", padding: 40 }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: "65vw", maxHeight: "70vh", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", cursor: "default" }}
      >
        <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={current}
                src={images[current]}
                alt={"Image " + (current + 1)}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ display: "block", maxWidth: "65vw", maxHeight: "70vh", objectFit: "contain", background: "#0c0c12" }}
              />
            </AnimatePresence>

        <button onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}
        >&#215;</button>

        {total > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c - 1 + total) % total)}
              style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}
            >&#8249;</button>
            <button onClick={() => setCurrent((c) => (c + 1) % total)}
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}
            >&#8250;</button>
            <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
              {images.map((_, i) => (
                <div key={i} onClick={() => setCurrent(i)} style={{ width: 8, height: 8, borderRadius: "50%", background: i === current ? "#c4a8ff" : "rgba(255,255,255,0.25)", transition: "background 0.3s", cursor: "pointer" }} />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

function ImageCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const total = images.length;

  if (total === 0) return null;

  return (
    <>
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, cursor: "pointer" }}
        onClick={() => setLightbox(true)}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={current}
            src={images[current]}
            alt={"Image " + (current + 1)}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
          />
        </AnimatePresence>
        {total > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + total) % total); }}
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0adc0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, backdropFilter: "blur(8px)" }}
            >&#8249;</button>
            <button onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % total); }}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0adc0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, backdropFilter: "blur(8px)" }}
            >&#8250;</button>
            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
              {images.map((_, i) => (
                <div key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} style={{ width: 5, height: 5, borderRadius: "50%", background: i === current ? "#c4a8ff" : "rgba(255,255,255,0.15)", transition: "background 0.3s", cursor: "pointer" }} />
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {lightbox && <Lightbox images={images} startIndex={current} onClose={() => setLightbox(false)} />}
      </AnimatePresence>
    </>
  );
}

export default function Experience({ data }: { data: ExperienceItem[] }) {
  return (
    <section id="work" style={{ padding: "100px 80px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, color: "#eae8f0", marginBottom: 48 }}>Experience</h2>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {data.map((item, i) => {
          const hasImages = item.images && item.images.length > 0;
          return (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ display: "grid", gridTemplateColumns: hasImages ? "1fr 260px" : "1fr", gap: 32, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 28, transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(196,168,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
            >
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b687c", marginBottom: 6 }}>{item.duration}</p>
                <h3 style={{ fontSize: 18, fontWeight: 500, color: "#eae8f0", marginBottom: 4 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#b0adc0", marginBottom: 2 }}>{item.company}</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6b687c", marginBottom: 16 }}>{item.location}</p>
                <ul style={{ listStyle: "none", marginBottom: 16 }}>
                  {item.description.map((line, j) => (
                    <li key={j} style={{ fontSize: 13, color: "#9d99b8", lineHeight: 1.7, paddingLeft: 14, position: "relative", marginBottom: 6 }}>
                      <span style={{ position: "absolute", left: 0, color: "#3a3660" }}>&bull;</span>{line}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {item.tags.map((tag) => (
                    <span key={tag} style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", color: "#6b687c", background: "rgba(196,168,255,0.06)", border: "1px solid rgba(196,168,255,0.1)", borderRadius: 20, padding: "3px 10px" }}>{tag}</span>
                  ))}
                </div>
              </div>
              {hasImages && <ImageCarousel images={item.images!} />}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
