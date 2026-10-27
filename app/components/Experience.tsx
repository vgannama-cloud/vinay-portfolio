"use client";

import { useEffect, useRef, useState } from "react";
import type { ExperienceItem } from "@/lib/types";
import Lightbox from "./Lightbox";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// Reads "Aug 2025 — Present" / "May 2024 - Aug 2024" into month indexes (year * 12 + month)
function parseRange(duration: string) {
  const now = new Date();
  const nowIdx = now.getFullYear() * 12 + now.getMonth();
  const found = Array.from((duration || "").matchAll(/([A-Za-z]{3,9})\.?\s+(\d{4})/g))
    .map((m) => {
      const mi = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
      return mi >= 0 ? parseInt(m[2], 10) * 12 + mi : null;
    })
    .filter((v): v is number => v !== null);
  const live = /present|now|current/i.test(duration || "");
  if (!found.length) return null;
  const start = found[0];
  const end = live ? nowIdx : found[1] ?? found[0];
  return { start, end: Math.max(end, start), live };
}

export default function Experience({ data }: { data: ExperienceItem[] }) {
  const [open, setOpen] = useState<string | null>(null); // pinned open by a click or tap
  const [hovered, setHovered] = useState<string | null>(null); // opened by resting the mouse on it
  const [viewer, setViewer] = useState<{ images: string[]; index: number } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hovering opens a row after a short pause, so rows don't flap open as the mouse passes over them
  const onEnter = (id: string) => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHovered(id), 220);
  };
  const onLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHovered(null), 120);
  };

  // A pinned panel closes on Escape or a click anywhere outside the experience rows
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    const onDown = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest(".row")) setOpen(null); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);

  const ranges = data.map((d) => parseRange(d.duration));
  const starts = ranges.filter(Boolean).map((r) => Math.floor(r!.start / 12));
  const firstYear = starts.length ? Math.min(...starts) : new Date().getFullYear();
  const lastYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = firstYear; y <= lastYear; y++) years.push(y);
  const span = years.length * 12;
  const pct = (idx: number) => ((idx - firstYear * 12) / span) * 100;

  return (
    <section id="experience" className="wrap section">
      <div className="sec-head" data-reveal="">
        <h2 className="h2">Experience</h2>
        <div className="axis" aria-hidden="true">
          {years.map((y) => <span key={y}>’{String(y).slice(2)}</span>)}
        </div>
      </div>

      <div className="rows">
        {data.map((item, i) => {
          const r = ranges[i];
          // Only one panel at a time: the hovered row wins over a pinned one
          const isOpen = (hovered ?? open) === item.id;
          const images = item.images || [];
          return (
            <div key={item.id} data-reveal="" style={{ "--d": `${Math.min(i, 5) * 0.06}s` } as React.CSSProperties}>
            <article className={"row" + (isOpen ? " open" : "")} onMouseEnter={() => onEnter(item.id)} onMouseLeave={onLeave}>
              <button type="button" className="row-btn" aria-expanded={isOpen} onClick={() => { setOpen(open === item.id ? null : item.id); setHovered(null); }}>
                <span className="row-date">{item.duration}</span>
                <span className="row-main">
                  <span className="ttl">{item.title} <span className="org">· {item.company}</span></span>
                  {item.description?.[0] && <span className="sum">{item.description[0]}</span>}
                </span>
                {r && (
                  <span className="track" aria-hidden="true">
                    <span className={"bar" + (r.live ? " now" : "")} style={{ left: `${pct(r.start)}%`, width: `${Math.max(1.5, pct(r.end + 1) - pct(r.start))}%` }} />
                    {r.live && <span className="dot" style={{ right: "auto", left: `calc(${pct(r.end + 1)}% - 6px)` }} />}
                  </span>
                )}
                <span className="chev" aria-hidden="true">+</span>
              </button>
              <div className="row-more">
                <div>
                  <div className="row-detail">
                    <div style={{ flex: "1 1 360px", minWidth: 0 }}>
                      {item.location && <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{item.location}</p>}
                      <ul>
                        {item.description.map((line, j) => <li key={j}>{line}</li>)}
                      </ul>
                      {item.tags?.filter(Boolean).length > 0 && (
                        <div className="tags">
                          {item.tags.filter(Boolean).map((t) => <span key={t} className="tag">{t}</span>)}
                        </div>
                      )}
                    </div>
                    {images.length > 0 && (
                      <div className="thumbs">
                        {images.slice(0, 4).map((src, j) => (
                          <button key={src} type="button" className="thumb" onClick={() => setViewer({ images, index: j })} aria-label={`Open image ${j + 1}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
            </div>
          );
        })}
      </div>

      {viewer && <Lightbox images={viewer.images} startIndex={viewer.index} onClose={() => setViewer(null)} />}
    </section>
  );
}
