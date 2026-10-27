"use client";

import { useState } from "react";
import type { ProjectItem } from "@/lib/types";
import { cardFor } from "../content";
import Lightbox from "./Lightbox";

// Up to 3 named links per project (set in the admin panel). Projects that haven't been
// re-saved yet fall back to the old GitHub (comma-separated) and Live site fields.
function linksFor(p: ProjectItem) {
  if (p.links && p.links.length) {
    return p.links.filter((l) => l.url).slice(0, 3).map((l) => ({ href: l.url, label: l.label || "Link" }));
  }
  const urls = (p.github || "").split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  const out = urls.map((href) => ({
    href,
    label: urls.length > 1 ? href.replace(/\/+$/, "").split("/").pop() || "GitHub" : "GitHub",
  }));
  if (p.link) out.push({ href: p.link, label: "Live site" });
  return out.slice(0, 3);
}

export default function Projects({ data }: { data: ProjectItem[] }) {
  const [viewer, setViewer] = useState<{ images: string[]; index: number } | null>(null);
  const [flipped, setFlipped] = useState<string | null>(null);

  // Touch screens have no hover, so a tap flips the card instead
  const tapFlip = (id: string, e: React.MouseEvent) => {
    if (!window.matchMedia("(hover: none)").matches) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    setFlipped((cur) => (cur === id ? null : id));
  };

  return (
    <section id="projects" className="wrap section">
      <h2 className="h2" data-reveal="" style={{ marginBottom: 32 }}>Projects</h2>
      <div className="projects">
        {data.map((p, i) => {
          const auto = cardFor(i);
          const rank = p.card_rank || auto.rank;
          const suit = p.card_suit || auto.suit;
          const tags = (p.tags || []).filter(Boolean);
          const images = (p.images || []).filter(Boolean);
          const links = linksFor(p);
          return (
            <div key={p.id} data-reveal="" style={{ "--d": `${Math.min(i, 3) * 0.08}s` } as React.CSSProperties}>
              <div className={"pcard" + (flipped === p.id ? " flipped" : "")} onClick={(e) => tapFlip(p.id, e)}>
                <div className="pcard-in">
                  {/* Front: date, title, description */}
                  <article className="pc pc-front">
                    <div className="pc-top">
                      <span className="corner" aria-hidden="true">{rank}<br />{suit}</span>
                      {p.category && <span className="pc-meta">{p.category}</span>}
                    </div>
                    <h3>{p.title}</h3>
                    {p.status && <span className="status">{p.status}</span>}
                    <p className="desc">{p.description}</p>
                    <span className="flip-hint mono" aria-hidden="true">
                      <span className="on-hover">Hover for stack &amp; links ↻</span>
                      <span className="on-touch">Tap for stack &amp; links ↻</span>
                    </span>
                  </article>

                  {/* Back: tech stack, screenshots, links */}
                  <div className="pc pc-back">
                    <span className="wm" aria-hidden="true">{suit}</span>
                    <div className="pc-top">
                      <span className="corner" aria-hidden="true">{rank}<br />{suit}</span>
                      <span className="pc-meta">{p.title}</span>
                    </div>
                    {tags.length > 0 && (
                      <div>
                        <p className="eyebrow" style={{ marginBottom: 12 }}>Tech stack</p>
                        <ul className="stack">
                          {tags.map((t) => <li key={t} className="chip">{t}</li>)}
                        </ul>
                      </div>
                    )}
                    {images.length > 0 && (
                      <button type="button" className="shot" onClick={() => setViewer({ images, index: 0 })} aria-label={`Open screenshots for ${p.title}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={images[0]} alt="" loading="lazy" />
                        {images.length > 1 && <span className="shot-count mono">+{images.length - 1}</span>}
                      </button>
                    )}
                    {links.length > 0 && (
                      <div className="pc-links">
                        {links.map((l, k) => (
                          <a key={l.href + k} className={"nl" + (k === 0 ? " gold" : "")} href={l.href} target="_blank" rel="noopener noreferrer">{l.label} <span className="ar">↗</span></a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {data.length < 3 && (
          <div data-reveal="" style={{ "--d": `${Math.min(data.length, 3) * 0.08}s` } as React.CSSProperties}>
            <div className="flip" tabIndex={0} aria-label="Next project, in the works">
              <div className="flip-in">
                <div className="face front" aria-hidden="true"><span>NEXT PROJECT · HOVER</span></div>
                <div className="face back">
                  <span className="mono" style={{ fontSize: 12, letterSpacing: "0.1em", color: "var(--accent)" }}>IN THE WORKS</span>
                  <span className="serif" style={{ fontSize: 40, lineHeight: 1.05 }}>Something new is on the grid.</span>
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>Check back soon, or ask me what I’m building.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {viewer && <Lightbox images={viewer.images} startIndex={viewer.index} onClose={() => setViewer(null)} />}
    </section>
  );
}
