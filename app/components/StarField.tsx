"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  d: number; // depth 0.25 (far) to 1 (near)
  r: number;
  tw: number; // twinkle speed
  ph: number; // twinkle phase
  gold: boolean;
};

/**
 * Twinkling starfield fixed behind the page.
 * Stars drift slowly and shift very slightly with scroll (parallax by depth).
 * One viewport-sized canvas, paused when the tab is hidden, static for reduced motion.
 */
export default function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let smooth = window.scrollY;

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 6500);
      stars = Array.from({ length: count }, () => {
        const d = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          d: 0.25 + d * 0.75,
          r: d > 0.93 ? 1.5 : 0.5 + d * 0.8,
          tw: 0.6 + Math.random() * 1.8,
          ph: Math.random() * Math.PI * 2,
          gold: Math.random() < 0.12,
        };
      });
    };

    const draw = (now: number) => {
      smooth += (window.scrollY - smooth) * 0.07;
      const par = smooth * 0.08;
      const sway = smooth * 0.003;
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!reduce) {
          s.x += s.vx;
          s.y += s.vy;
          if (s.x < 0) s.x += w;
          else if (s.x > w) s.x -= w;
          if (s.y < 0) s.y += h;
          else if (s.y > h) s.y -= h;
        }
        const y = (((s.y - par * s.d) % h) + h) % h;
        const x = s.x + Math.sin(sway + s.d * 9) * 10 * s.d;
        const twinkle = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * s.tw + s.ph);
        ctx.globalAlpha = (0.2 + 0.7 * s.d) * twinkle;
        ctx.fillStyle = s.gold ? "#CFB991" : "#F4F1EA";
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.4) {
          ctx.globalAlpha *= 0.5;
          ctx.fillRect(x - 4, y - 0.4, 8, 0.8);
          ctx.fillRect(x - 0.4, y - 4, 0.8, 8);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Ignore small height changes from the mobile address bar showing/hiding
        if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 120) return;
        build();
        if (reduce) draw(performance.now());
      }, 150);
    };

    build();
    if (reduce) draw(performance.now());
    else start();

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="starfield" />;
}
