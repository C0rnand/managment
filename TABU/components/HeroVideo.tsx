"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient backdrop loop for the hero. Source: a treated, size-optimized
 * re-encode of the brand's product-concept footage (see README → "Médiá a
 * značka" for the original asset and why it was processed this way).
 *
 * The video itself never drives layout or meaning — it is muted, decorative,
 * and paused outright under prefers-reduced-motion, falling back to the
 * static poster frame.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      video.pause();
    } else {
      video.play().catch(() => {
        /* autoplay can be blocked by the browser; the poster frame covers it */
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      poster="/media/hero-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    >
      <source src="/media/hero-atmosphere.webm" type="video/webm" />
      <source src="/media/hero-atmosphere.mp4" type="video/mp4" />
    </video>
  );
}
