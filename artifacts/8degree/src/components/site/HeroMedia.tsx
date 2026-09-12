import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SITE_MEDIA } from "@/lib/site-assets";

const heroImgClass =
  "absolute inset-0 z-0 h-full w-full object-cover object-center";

/** Hide iOS/Safari’s big center play control on decorative background videos. */
const heroVideoClass = [
  heroImgClass,
  "pointer-events-none",
  "[&::-webkit-media-controls]:hidden",
  "[&::-webkit-media-controls-enclosure]:hidden",
  "[&::-webkit-media-controls-panel]:hidden",
  "[&::-webkit-media-controls-start-playback-button]:hidden",
  "[&::-webkit-media-controls-play-button]:hidden",
].join(" ");

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

/**
 * Mobile hero is always a still — iOS Safari paints a native play glyph on
 * `<video>` that can sit above page content no matter what CSS we apply.
 * Desktop keeps the cinematic autoplay loop.
 */
export function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [preferStatic, setPreferStatic] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useLayoutEffect(() => {
    setIsMobile(isMobileHeroViewport());
    setPreferStatic(preferStaticHeroMedia());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsMobile(isMobileHeroViewport());
      setPreferStatic(preferStaticHeroMedia());
      setVideoFailed(false);
      setIsPlaying(false);
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

  const useDesktopVideo = hydrated && !isMobile && !preferStatic && !videoFailed;

  useEffect(() => {
    if (!useDesktopVideo) return;
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying(false);
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("muted", "");
    video.controls = false;

    let cancelled = false;
    const tryPlay = () => {
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.then === "function") {
        playAttempt
          .then(() => {
            if (!cancelled) setIsPlaying(true);
          })
          .catch(() => {
            if (!cancelled) setVideoFailed(true);
          });
      }
    };

    if (video.readyState >= 2) tryPlay();
    else video.addEventListener("loadeddata", tryPlay, { once: true });

    const onPlaying = () => {
      if (!cancelled) setIsPlaying(true);
    };
    video.addEventListener("playing", onPlaying);

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("playing", onPlaying);
    };
  }, [useDesktopVideo]);

  // Mobile / reduced-motion / pre-hydrate: still only — never mount <video>.
  if (!useDesktopVideo) {
    return (
      <picture>
        <source media="(max-width: 767px)" srcSet={SITE_MEDIA.heroMobilePoster} />
        <img
          src={SITE_MEDIA.heroStill}
          alt=""
          className={heroImgClass}
          decoding="async"
          fetchPriority="high"
          onError={(e) => {
            e.currentTarget.src = SITE_MEDIA.heroMobilePoster;
          }}
        />
      </picture>
    );
  }

  return (
    <>
      {!isPlaying ? (
        <img
          src={SITE_MEDIA.heroStill}
          alt=""
          className={`${heroImgClass} z-[1]`}
          decoding="async"
          fetchPriority="high"
          aria-hidden
        />
      ) : null}
      <video
        ref={videoRef}
        className={`${heroVideoClass} ${isPlaying ? "opacity-100" : "opacity-0"}`}
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        preload="auto"
        poster={SITE_MEDIA.heroStill}
        aria-hidden
        tabIndex={-1}
        onError={() => setVideoFailed(true)}
      >
        <source src={SITE_MEDIA.heroVideo} type="video/mp4" />
      </video>
    </>
  );
}
