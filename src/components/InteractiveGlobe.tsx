"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export function InteractiveGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let width = 300;
    
    const updateSize = () => {
      if (containerRef.current) {
        width = containerRef.current.offsetWidth;
      }
    };
    
    updateSize();
    window.addEventListener("resize", updateSize);

    if (!canvasRef.current) return;

    let currentPhi = 0;
    let isVisible = true;

    // Pause WebGL rendering when out of viewport for CPU performance
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 2, 2),
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 0, // Light theme globe
      diffuse: 1.2,
      mapSamples: 12000,
      mapBrightness: 6,
      baseColor: [0.93, 0.96, 0.99], // sky base tint for oceans/continents
      markerColor: [2 / 255, 132 / 255, 199 / 255], // sky-600 marker tint (#0284c7)
      glowColor: [0.70, 0.85, 0.98], // bright glowing sky blue glow
      opacity: 0.9,
      markers: [
        // Seoul, South Korea (source location)
        { location: [37.5665, 126.978], size: 0.08 },
        // NASA Goddard Space Flight Center, MD, USA
        { location: [38.996, -76.848], size: 0.06 },
        // Svalbard Satellite Center, Norway
        { location: [78.229, 15.407], size: 0.05 },
        // Singapore (Equatorial observation node)
        { location: [1.352, 103.82], size: 0.05 },
        // Sydney, Australia (Southern hemisphere node)
        { location: [-33.8688, 151.2093], size: 0.05 },
      ],
      onRender: (state: any) => {
        if (!isVisible) return;
        state.phi = currentPhi;
        currentPhi += 0.004; // smooth slow self-rotation
        state.width = width * 2;
        state.height = width * 2;
      },
    } as any);

    // Make canvas fade-in smoothly after load
    if (canvasRef.current) {
      canvasRef.current.style.opacity = "1";
    }

    return () => {
      globe.destroy();
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[280px] sm:max-w-[420px] md:max-w-[480px] aspect-square mx-auto flex items-center justify-center select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full transform translate-y-2"
        style={{
          contain: "layout paint size",
          opacity: 0,
          transition: "opacity 1s ease",
        }}
      />
    </div>
  );
}
