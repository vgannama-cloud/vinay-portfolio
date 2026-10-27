"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);
  const total = images.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + total) % total);
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % total);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [total, onClose]);

  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
      <div className="lb-frame" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={current} src={images[current]} alt={`Image ${current + 1} of ${total}`} />
        <button type="button" className="lb-btn" style={{ top: 12, right: 12 }} onClick={onClose} aria-label="Close">×</button>
        {total > 1 && (
          <>
            <button type="button" className="lb-btn" style={{ left: 12, top: "50%", marginTop: -22 }} onClick={() => setCurrent((c) => (c - 1 + total) % total)} aria-label="Previous image">‹</button>
            <button type="button" className="lb-btn" style={{ right: 12, top: "50%", marginTop: -22 }} onClick={() => setCurrent((c) => (c + 1) % total)} aria-label="Next image">›</button>
            <span className="lb-count">{current + 1} / {total}</span>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
