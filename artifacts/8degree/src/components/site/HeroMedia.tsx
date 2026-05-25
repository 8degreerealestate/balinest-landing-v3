import { useEffect, useLayoutEffect, useState } from "react";
import { SITE_MEDIA } from "@/lib/site-assets";

const heroImgClass =
  "absolute inset-0 z-0 h-full w-full object-cover object-center";

function preferStaticHeroMedia(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return true;
  return false;
}

export function HeroMedia() {
  const [videoFailed, setVideoFailed] = useState(false);
  const [preferStatic, setPreferStatic] = useState(() =>
    typeof window !== "undefined" ? preferStaticHeroMedia() : false,
  );

  useLayoutEffect(() => {
    setPreferStatic(preferStaticHeroMedia());
  }, []);

  useEffect(() => {
    const onChange = () => setPreferStatic(preferStaticHeroMedia());
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    mqReduce.addEventListener("change", onChange);
    const conn = (navigator as Navigator & { connection?: EventTarget }).connection;
    conn?.addEventListener?.("change", onChange as EventListener);
    return () => {
      mqReduce.removeEventListener("change", onChange);
      conn?.removeEventListener?.("change", onChange as EventListener);
    };
  }, []);

  if (preferStatic || videoFailed) {
    return (
      <img
        src={SITE_MEDIA.heroPoster}
        alt=""
        className={heroImgClass}
        decoding="async"
        fetchPriority="high"
        onError={(e) => {
          e.currentTarget.src = SITE_MEDIA.heroStill;
        }}
      />
    );
  }

  return (
    <video
      className={heroImgClass}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={SITE_MEDIA.heroPoster}
      onError={() => setVideoFailed(true)}
    >
      <source src={SITE_MEDIA.heroVideo} type="video/mp4" />
    </video>
  );
}
