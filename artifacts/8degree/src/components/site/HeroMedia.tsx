import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { SITE_MEDIA } from "@/lib/site-assets";

const heroImgClass =
  "absolute inset-0 z-0 h-full w-full object-cover object-center";

function isMobileHeroViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

/** Static image only — no video (accessibility / data saver). */
function preferStaticHeroMedia(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return true;
  return false;
}

export function HeroMedia() {
  const [videoFailed, setVideoFailed] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? isMobileHeroViewport() : false,
  );
  const [preferStatic, setPreferStatic] = useState(() =>
    typeof window !== "undefined" ? preferStaticHeroMedia() : false,
  );

  const { videoSrc, posterSrc, stillFallback } = useMemo(
    () =>
      isMobile
        ? {
            videoSrc: SITE_MEDIA.heroMobileVideo,
            posterSrc: SITE_MEDIA.heroMobilePoster,
            stillFallback: SITE_MEDIA.heroMobilePoster,
          }
        : {
            videoSrc: SITE_MEDIA.heroVideo,
            posterSrc: SITE_MEDIA.heroStill,
            stillFallback: SITE_MEDIA.heroStill,
          },
    [isMobile],
  );

  useLayoutEffect(() => {
    setIsMobile(isMobileHeroViewport());
    setPreferStatic(preferStaticHeroMedia());
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsMobile(isMobileHeroViewport());
      setPreferStatic(preferStaticHeroMedia());
      setVideoFailed(false);
    };
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    mqMobile.addEventListener("change", onChange);
    mqReduce.addEventListener("change", onChange);
    const conn = (navigator as Navigator & { connection?: EventTarget }).connection;
    conn?.addEventListener?.("change", onChange as EventListener);
    return () => {
      mqMobile.removeEventListener("change", onChange);
      mqReduce.removeEventListener("change", onChange);
      conn?.removeEventListener?.("change", onChange as EventListener);
    };
  }, []);

  if (preferStatic || videoFailed) {
    return (
      <img
        src={posterSrc}
        alt=""
        className={heroImgClass}
        decoding="async"
        fetchPriority="high"
        onError={(e) => {
          e.currentTarget.src = stillFallback;
        }}
      />
    );
  }

  return (
    <video
      key={videoSrc}
      className={heroImgClass}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={posterSrc}
      onError={() => setVideoFailed(true)}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
}
