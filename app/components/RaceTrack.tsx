"use client";

import { useEffect, useRef, useState } from "react";
import { CAR_SVG } from "./f1Car";

type Pt = [number, number];

type Track = {
  w: number;
  h: number;
  d: string; // centerline path
  road: number; // road width in px
  finish: { x: number; y: number; angle: number };
  start: { x: number; y: number; angle: number };
  pts: Pt[]; // samples along the centerline the car follows
  cum: number[]; // arc length at each sample
  ys: number[]; // running max of y along the road, maps scroll position to distance
  total: number;
  scale: number; // car size
};

// The same smooth S-shaped circuit as the design canvas, drawn in a 1200 x 2700 box
// and stretched to fit the page. Every join between curves is smooth, so the car never snaps.
const CANVAS_TRACK: [Pt, Pt, Pt, Pt][] = [
  [[1110, 140], [1110, 400], [950, 520], [700, 560]],
  [[700, 560], [450, 600], [130, 700], [130, 1000]],
  [[130, 1000], [130, 1300], [600, 1250], [900, 1300]],
  [[900, 1300], [1200, 1350], [1160, 1600], [1000, 1850]],
  [[1000, 1850], [840, 2100], [200, 2000], [150, 2250]],
  [[150, 2250], [100, 2500], [500, 2650], [1100, 2650]],
];

function buildTrack(w: number, h: number): Track {
  const scale = Math.max(0.9, Math.min(1.3, (w / 1200) * 1.3));
  const road = Math.round(150 * (w / 1200));
  const top = 150;
  const bottom = h - 110;
  const map = ([x, y]: Pt): Pt => [(x * w) / 1200, top + ((y - 140) * (bottom - top)) / (2650 - 140)];

  const pts: Pt[] = [];
  let d = "";
  CANVAS_TRACK.forEach((seg, si) => {
    const [p0, c1, c2, p1] = seg.map(map);
    if (si === 0) { d = `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)}`; pts.push(p0); }
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    for (let i = 1; i <= 240; i++) {
      const u = i / 240, a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, e = u ** 3;
      pts.push([a * p0[0] + b * c1[0] + c * c2[0] + e * p1[0], a * p0[1] + b * c1[1] + c * c2[1] + e * p1[1]]);
    }
  });

  const n = pts.length;
  const cum = [0];
  const ys = [pts[0][1]];
  for (let i = 1; i < n; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    ys.push(Math.max(ys[i - 1], pts[i][1])); // running max, for mapping scroll position to distance
  }
  const heading = (i: number) => {
    const a = pts[Math.max(0, i - 3)], b = pts[Math.min(n - 1, i + 3)];
    return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  };

  return {
    w, h, d, road,
    start: { x: pts[0][0], y: pts[0][1], angle: heading(0) },
    finish: { x: pts[n - 1][0], y: pts[n - 1][1], angle: heading(n - 1) },
    pts, cum, ys, total: cum[n - 1], scale,
  };
}

/**
 * The canvas S-curve circuit drawn down the whole page with a top-down F1 car that follows scroll.
 * The road sits above panels but below text (see .race in globals.css).
 * At the top of the page the car is on the start line; at the bottom it crosses the finish.
 */
export default function RaceTrack() {
  const box = useRef<HTMLDivElement>(null);
  const car = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [layout, setLayout] = useState(0);
  const trackRef = useRef<Track | null>(null);
  const builtFor = useRef(0); // page height the car path was last built for

  // Build (and rebuild) the track when the page size changes
  useEffect(() => {
    const el = box.current?.parentElement;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const cur = trackRef.current;
      if (w < 860) { trackRef.current = null; setTrack(null); return; }
      // Rows opening and closing change the height a little. Keep the same road and the same car path then,
      // so hovering an experience row can never nudge the car. Only re-sync once nothing is expanded
      // (for example after images finish loading).
      if (cur && cur.w === w && Math.abs(cur.h - h) < 600) {
        const docH = document.documentElement.scrollHeight;
        if (!document.querySelector(".row.open") && Math.abs(docH - builtFor.current) > 2) setLayout((v) => v + 1);
        return;
      }
      const t = buildTrack(w, h);
      trackRef.current = t;
      setTrack(t);
    };
    measure();
    const ro = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(measure, 150); });
    ro.observe(el);
    return () => { clearTimeout(timer); ro.disconnect(); };
  }, []);

  // Drive the car. Its position is a pure function of scroll position, so it can never lag behind or snap.
  // Where supported, the browser runs it as a scroll-linked animation on the compositor thread
  // (perfectly in sync with scrolling, no JavaScript per frame). Elsewhere a light scroll handler does the same maths.
  useEffect(() => {
    if (!track) return;
    const el = car.current;
    const site = box.current?.parentElement;
    if (!el || !site) return;
    const { cum, pts, ys, total } = track;
    const LOOK = 24; // px either side used to read the road direction (a little longer = rounder steering)

    const pointAt = (arc: number): Pt => {
      const a = Math.min(total, Math.max(0, arc));
      let lo = 0, hi = cum.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] < a) lo = mid; else hi = mid; }
      const f = cum[hi] === cum[lo] ? 0 : (a - cum[lo]) / (cum[hi] - cum[lo]);
      return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f];
    };
    const headingAt = (arc: number) => {
      const a = pointAt(arc - LOOK), b = pointAt(arc + LOOK);
      return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    };
    const arcAtY = (y: number) => {
      if (y <= ys[0]) return 0;
      if (y >= ys[ys.length - 1]) return total;
      let lo = 0, hi = ys.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ys[mid] < y) lo = mid; else hi = mid; }
      const f = ys[hi] === ys[lo] ? 0 : (y - ys[lo]) / (ys[hi] - ys[lo]);
      return cum[lo] + (cum[hi] - cum[lo]) * f;
    };
    // Page metrics are captured once here. The car's position then depends only on how many pixels
    // you have scrolled, never on the live page height, so content expanding or collapsing
    // (experience rows on hover) can't move it.
    const docH = document.documentElement.scrollHeight;
    builtFor.current = docH;
    const maxScroll = Math.max(1, docH - window.innerHeight);
    const siteTop = site.getBoundingClientRect().top + window.scrollY;
    // Scroll progress (0 at the top, 1 at the bottom) -> distance along the road.
    // The point the car aims for slides from the top of the screen to the bottom of the screen as you scroll,
    // so the car is always in view and crosses the finish line at the very bottom.
    const arcAtProgress = (p: number) => arcAtY(p * docH - siteTop);
    const transformAt = (arc: number, angle: number) => {
      const [x, y] = pointAt(arc);
      return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angle.toFixed(2)}deg)`;
    };

    type ScrollTimelineCtor = new (opts: { source: Element; axis: "block" }) => AnimationTimeline;
    const ST = (window as unknown as { ScrollTimeline?: ScrollTimelineCtor }).ScrollTimeline;
    let anim: Animation | null = null;
    let raf = 0;
    let cleanupFallback = () => {};

    const buildAnimation = () => {
      // Pin the car where it is while the new scroll animation starts up, so it can't blink for a frame
      const now = arcAtProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
      el.style.transform = transformAt(now, headingAt(now));
      anim?.cancel();
      const STEPS = 600;
      const frames: Keyframe[] = [];
      let prevAngle = 0;
      for (let i = 0; i <= STEPS; i++) {
        const offset = i / STEPS;
        const arc = arcAtProgress(offset);
        let angle = headingAt(arc);
        if (i > 0) {
          // Keep angles continuous so the car never spins the long way round between keyframes
          let diff = angle - prevAngle;
          diff = ((((diff + 180) % 360) + 360) % 360) - 180;
          angle = prevAngle + diff;
        }
        prevAngle = angle;
        frames.push({ offset, transform: transformAt(arc, angle) });
      }
      anim = el.animate(frames, {
        timeline: new ST!({ source: document.scrollingElement || document.documentElement, axis: "block" }),
        fill: "both",
        easing: "linear",
        // A fixed pixel range (0 to the scroll distance measured above) instead of 0-100% of the live
        // scroll range, so a taller page doesn't stretch the animation
        rangeStart: "0px",
        rangeEnd: `${maxScroll}px`,
      } as KeyframeAnimationOptions);
    };

    if (ST) {
      buildAnimation();
      let t: ReturnType<typeof setTimeout>;
      const onResize = () => { clearTimeout(t); t = setTimeout(() => setLayout((v) => v + 1), 120); };
      window.addEventListener("resize", onResize, { passive: true });
      cleanupFallback = () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
    } else {
      const place = () => {
        raf = 0;
        const arc = arcAtProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
        el.style.transform = transformAt(arc, headingAt(arc));
      };
      const onScroll = () => { if (!raf) raf = requestAnimationFrame(place); };
      place();
      let t: ReturnType<typeof setTimeout>;
      const onResize = () => { clearTimeout(t); t = setTimeout(() => setLayout((v) => v + 1), 120); };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      cleanupFallback = () => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      };
    }

    return () => {
      anim?.cancel();
      cleanupFallback();
    };
  }, [track, layout]);

  const cells = [];
  if (track) {
    const rows = Math.round(track.road / 12);
    const size = track.road / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 2; c++) {
        if ((r + c) % 2 === 0) cells.push(<rect key={`${r}-${c}`} x={c * size - size} y={r * size - track.road / 2} width={size} height={size} />);
      }
    }
  }
  const carW = 240;
  const carH = 120;

  return (
    <div ref={box} className="race" aria-hidden="true">
      {track && (
        <>
          <svg width={track.w} height={track.h} viewBox={`0 0 ${track.w} ${track.h}`}>
            <path d={track.d} fill="none" stroke="#EEECE6" strokeOpacity="0.04" strokeWidth={track.road} strokeLinecap="round" strokeLinejoin="round" />
            <path d={track.d} fill="none" stroke="#EEECE6" strokeOpacity="0.16" strokeWidth="1.5" strokeDasharray="18 22" />
            <g transform={`translate(${track.finish.x} ${track.finish.y}) rotate(${track.finish.angle})`} fill="#EEECE6" fillOpacity="0.35">
              {cells}
            </g>
          </svg>
          <div ref={car} className="race-car">
            <svg
              width={carW * track.scale}
              height={carH * track.scale}
              viewBox={`${-carW / 2} ${-carH / 2} ${carW} ${carH}`}
              style={{ transform: "translate(-50%, -50%)" }}
              dangerouslySetInnerHTML={{ __html: CAR_SVG }}
            />
          </div>
        </>
      )}
    </div>
  );
}
