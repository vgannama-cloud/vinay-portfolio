"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const ribbons = [
      { y: 0.25, amplitude: 30, wavelength: 900, speed: 0.002, thickness: 1.5, opacity: 0.06, color: [180, 160, 255] },
      { y: 0.28, amplitude: 40, wavelength: 700, speed: 0.0015, thickness: 1, opacity: 0.04, color: [200, 170, 240] },
      { y: 0.65, amplitude: 35, wavelength: 800, speed: 0.0025, thickness: 1.5, opacity: 0.05, color: [232, 168, 124] },
      { y: 0.68, amplitude: 25, wavelength: 600, speed: 0.002, thickness: 1, opacity: 0.03, color: [220, 180, 150] },
    ];

    const blobs = [
      { x: 0.15, y: 0.2, r: 350, color: "rgba(100, 60, 180, 0.04)", speed: 0.0005, phase: 0 },
      { x: 0.8, y: 0.4, r: 300, color: "rgba(232, 168, 124, 0.03)", speed: 0.0007, phase: 2 },
      { x: 0.5, y: 0.8, r: 320, color: "rgba(80, 50, 160, 0.04)", speed: 0.0004, phase: 4 },
    ];

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blobs.forEach((blob) => {
        const cx = canvas.width * (blob.x + 0.08 * Math.sin(time * blob.speed * 60 + blob.phase));
        const cy = canvas.height * (blob.y + 0.04 * Math.cos(time * blob.speed * 80 + blob.phase));
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, blob.r);
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, blob.r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      ribbons.forEach((ribbon) => {
        const baseY = canvas.height * ribbon.y;
        ctx.beginPath();
        ctx.moveTo(-20, baseY);
        for (let x = -20; x <= canvas.width + 20; x += 4) {
          const progress = x / canvas.width;
          const wave = Math.sin((x / ribbon.wavelength) * Math.PI * 2 + time * ribbon.speed * 1000) * ribbon.amplitude;
          const wave2 = Math.sin((x / (ribbon.wavelength * 0.6)) * Math.PI * 2 - time * ribbon.speed * 700) * ribbon.amplitude * 0.4;
          const envelope = Math.sin(progress * Math.PI) * 0.8 + 0.2;
          ctx.lineTo(x, baseY + (wave + wave2) * envelope);
        }
        const [r, g, b] = ribbon.color;
        ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + ribbon.opacity + ")";
        ctx.lineWidth = ribbon.thickness;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}
