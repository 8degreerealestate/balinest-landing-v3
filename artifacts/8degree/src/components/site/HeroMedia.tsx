import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SITE_MEDIA } from "@/lib/site-assets";

const heroMediaLayerClass =
  "absolute inset-0 z-0 h-full w-full object-cover object-center";

/**
 * iOS Safari draws a native center play control on paused/loading videos that
 * can escape normal stacking. Keep the element invisible + covered until
 * `playing`, and zero out webkit control chrome.
 */
const heroVideoClass = [
  heroMediaLayerClass,
  "pointer-events-none",
  "[-webkit-appearance:none]",
  "[&::-webkit-media-controls]:hidden",
  "[&::-webkit-media-controls-enclosure]:hidden",
  "[&::-webkit-media-controls-panel]:hidden",
  "[&::-webkit-media-controls-overlay-enclosure]:hidden",
  "[&::-webkit-media-controls-start-playback-button]:!hidden",
  "[&::-webkit-media-controls-start-playback-button]:!opacity-0",
  "[&::-webkit-media-controls-start-playback-button]:!pointer-events-none",
  "[&::-webkit-media-controls-start-playback-button]:!h-0",
  "[&::-webkit-media-controls-start-playback-button]:!w-0",
  "[&::-webkit-media-controls-play-button]:!hidden",
].join(" ");

function isMobileHeroViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

function preferStaticHeroMedia(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return true;
  return false;
}

export function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [preferStatic, setPreferStatic] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { videoSrc, posterSrc } = useMemo(
    () =>
      isMobile
        ? {
            videoSrc: SITE_MEDIA.heroMobileVideo,
            posterSrc: SITE_MEDIA.heroMobilePoster,
          }
        : {
            videoSrc: SITE_MEDIA.heroVideo,
            posterSrc: SITE_MEDIA.heroStill,
          },
    [isMobile],
  );

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

  const allowVideo = hydrated && !preferStatic && !videoFailed;

  useEffect(() => {
    if (!allowVideo) return;
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying(false);
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("muted", "true");
    video.setAttribute("x-webkit-airplay", "deny");

    let cancelled = false;

    const markPlaying = () => {
      if (!cancelled) setIsPlaying(true);
    };

    const tryPlay = () => {
      const attempt = video.play();
      if (attempt && typeof attempt.then === "function") {
        attempt.then(markPlaying).catch(() => {
          // Keep the still visible — never reveal a paused <video> (iOS play glyph).
          if (!cancelled) setVideoFailed(true);
        });
      }
    };

    if (video.readyState >= 2) tryPlay();
    else {
      video.addEventListener("loadeddata", tryPlay, { once: true });
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    video.addEventListener("playing", markPlaying);

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("playing", markPlaying);
    };
  }, [allowVideo, videoSrc]);

  // First paint / reduced-motion / failed autoplay: still only (no <video> = no play button).
  if (!allowVideo) {
    return (
      <picture>
        <source media="(max-width: 767px)" srcSet={SITE_MEDIA.heroMobilePoster} />
        <img
          src={SITE_MEDIA.heroStill}
          alt=""
          className={heroMediaLayerClass}
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Opaque cover until playback — blocks iOS center play affordance on first load. */}
      <img
        src={posterSrc}
        alt=""
        className={[
          heroMediaLayerClass,
          "z-[2] transition-opacity duration-300",
          isPlaying ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
        decoding="async"
        fetchPriority="high"
      />
      <video
        ref={videoRef}
        key={videoSrc}
        className={[
          heroVideoClass,
          "z-[1]",
          isPlaying ? "opacity-100" : "opacity-0",
        ].join(" ")}
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        preload="auto"
        // Omit native `poster` — it pairs with iOS’s start-playback button.
        tabIndex={-1}
        onError={() => setVideoFailed(true)}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}
