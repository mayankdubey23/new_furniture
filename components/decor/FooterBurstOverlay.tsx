'use client';

import { useEffect, useRef, useState } from 'react';
import { DEFAULT_SITE_CONTENT } from '@/lib/content/siteContent';
const FOOTER_BURST_PLAYBACK_RATE = 1;

export default function FooterBurstOverlay({
  videoSrc = DEFAULT_SITE_CONTENT.footer.burstVideo.src,
  videoType = DEFAULT_SITE_CONTENT.footer.burstVideo.type,
}: {
  videoSrc?: string;
  videoType?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;

    if (!container || !video) {
      return;
    }

    const footer = container.closest('[data-site-footer]');
    if (!(footer instanceof HTMLElement)) {
      return;
    }

    const syncPlaybackRate = () => {
      video.defaultPlaybackRate = FOOTER_BURST_PLAYBACK_RATE;
      video.playbackRate = FOOTER_BURST_PLAYBACK_RATE;
    };

    const playVideo = async () => {
      syncPlaybackRate();

      try {
        await video.play();
      } catch {

      }
    };

    const pauseVideo = () => {
      video.pause();
      if (video.currentTime > 0.01) {
        video.currentTime = 0;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        setIsVisible(nextVisible);

        if (nextVisible) {
          void playVideo();
          return;
        }

        pauseVideo();
      },
      {
        threshold: [0, 0.2, 0.45],
        rootMargin: '0px 0px -8% 0px',
      }
    );

    syncPlaybackRate();
    video.addEventListener('loadedmetadata', syncPlaybackRate);
    video.addEventListener('play', syncPlaybackRate);
    observer.observe(footer);

    return () => {
      observer.disconnect();
      video.removeEventListener('loadedmetadata', syncPlaybackRate);
      video.removeEventListener('play', syncPlaybackRate);
      pauseVideo();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <video
          ref={videoRef}
          aria-hidden="true"
          disablePictureInPicture
          className="absolute left-1/2 top-[56%] block h-[148%] w-[182%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center opacity-[0.18] saturate-[0.72] contrast-[1.04] blur-[0.5px] sm:h-[140%] sm:w-[158%] md:h-[126%] md:w-[132%] lg:h-[118%] lg:w-[118%] md:opacity-[0.22]"
          autoPlay={false}
          loop
          muted
          playsInline
          preload={DEFAULT_SITE_CONTENT.footer.burstVideo.preload}
        >
          <source src={videoSrc} type={videoType} />
        </video>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(199,140,92,0.16),transparent_26%),linear-gradient(180deg,rgba(13,10,9,0.18)_0%,rgba(13,10,9,0.02)_32%,rgba(13,10,9,0.24)_100%)]" />
      </div>
    </div>
  );
}
