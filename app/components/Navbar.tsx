"use client";

import { useEffect, useState } from "react";
import { downloadResume } from "@/lib/resume";

const navItems = [
  { label: "About", href: "#about", hideSm: true },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills", hideSm: true },
];

export default function Navbar({ resumeUrl }: { resumeUrl?: string | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")} aria-label="Main">
      <div className="wrap nav-in rise">
        <a href="#top" className="brand">Vinay G.</a>
        <div className="nav-links">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={"nl" + (item.hideSm ? " hide-sm" : "")}>
              {item.label}
            </a>
          ))}
          {resumeUrl && (
            <button type="button" className="nl gold" onClick={() => downloadResume(resumeUrl)}>
              Resume ↓
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
