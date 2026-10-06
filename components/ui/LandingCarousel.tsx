"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Play, RotateCcw } from "lucide-react";
import { shuffleRandomizableItems } from "@/lib/utils";

interface CarouselItem {
  url: string;
  alt?: string;
  isVideo?: boolean;
  isVertical?: boolean;
  randomizeOrder?: boolean;
  link?: string;
}

interface LandingCarouselProps {
  items: CarouselItem[];
  interval?: number;
}

export default function LandingCarousel({
  items,
  interval = 5000,
}: LandingCarouselProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicInitialized, setMusicInitialized] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter out items with empty URLs
  const filteredItems = items.filter((item) => item.url && item.url.trim() !== "");

  // Shuffle only on client after hydration to avoid SSR mismatch
  const [validItems, setValidItems] = useState(filteredItems);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    if (!isShuffled) {
      setValidItems(shuffleRandomizableItems(filteredItems));
      setIsShuffled(true);
    }
  }, [isShuffled, filteredItems]);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (validItems.length === 0) {
    return null;
  }

  const currentItem = currentIndex >= 0 ? validItems[currentIndex] : null;
  const isCurrentVideo = currentItem?.isVideo;

  // Play video on active slide, pause all others
  useEffect(() => {
    if (currentIndex < 0) return;
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIndex]);

  // Initialize background music
  useEffect(() => {
    if (typeof window === 'undefined') return;

    audioRef.current = new Audio('https://pub-862b0b7525764f7aa9f18b4fea564554.r2.dev/landing/Landing%20Page_music_for_creators-never-surrender-127158.mp3');
    audioRef.current.loop = false;
    audioRef.current.volume = 0.5;

    // Try to autoplay music if browser allows
    audioRef.current.play().then(() => {
      setIsMusicPlaying(true);
      setMusicInitialized(true);
    }).catch(() => {
      // Autoplay blocked - music stays off, user can enable via button
      setMusicInitialized(true);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Control music based on isMusicPlaying and isPaused state
  useEffect(() => {
    if (!audioRef.current || !musicInitialized) return;
    
    if (isMusicPlaying && !isPaused) {
      audioRef.current.play().catch(() => {});
    } else if (!isMusicPlaying || isPaused) {
      audioRef.current.pause();
    }
  }, [isMusicPlaying, isPaused, musicInitialized]);

  // Stop music immediately when carousel ends
  useEffect(() => {
    if (!audioRef.current || !hasEnded) return;
    
    audioRef.current.pause();
  }, [hasEnded]);

  const advance = useCallback(() => {
    // Check if we're on the last slide before advancing
    if (currentIndex >= validItems.length - 1) {
      setHasEnded(true);
      setTimeout(() => {
        setShowPlayButton(true);
      }, 2000);
      return;
    }
    
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= validItems.length) {
        setHasEnded(true);
        setTimeout(() => {
          setShowPlayButton(true);
        }, 2000);
        return prev;
      }
      return nextIndex;
    });
    setIsLoading(true);
  }, [validItems.length, currentIndex]);

  // Autoplay: advance every `interval` ms unless paused, ended, or current slide is video
  useEffect(() => {
    if (isPaused || hasEnded || isCurrentVideo) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(advance, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, hasEnded, isCurrentVideo, interval, advance]);

  // When a video slide ends, advance to next slide
  const handleVideoEnded = useCallback(() => {
    if (currentIndex >= validItems.length - 1) {
      // Last slide - end the carousel
      setHasEnded(true);
      setTimeout(() => {
        setShowPlayButton(true);
      }, 2000);
    } else {
      advance();
    }
  }, [advance, currentIndex, validItems.length]);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsMusicPlaying(true);
    }
  };

  const handleReplay = () => {
    setShowPlayButton(false);
    setHasEnded(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setIsLoading(true);
    // Restart music from beginning
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {});
    }
  };

  const handleTap = () => {
    // Don't open link if carousel has ended
    if (hasEnded) return;

    // Check if current item has a link
    if (currentItem?.link) {
      window.open(currentItem.link, '_blank');
      return;
    }
    
    setIsPaused((prev) => {
      const next = !prev;
      const activeVideo = videoRefs.current[currentIndex];
      if (activeVideo) {
        if (next) {
          activeVideo.pause();
        } else {
          activeVideo.play().catch(() => {});
        }
      }
      
      // Pause/resume music along with carousel
      if (audioRef.current && isMusicPlaying) {
        if (next) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(() => {});
        }
      }
      
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className="relative mx-auto"
        style={{ width: "870px", maxWidth: "100%", height: "50px" }}>
        <button
            onClick={toggleMusic}
            className={`absolute right-0 z-30 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors ${!isMusicPlaying ? 'animate-pulse' : ''}`}
            aria-label={isMusicPlaying ? "Pause music" : "Play music"}
          >
            {isMusicPlaying ? (
              <Image src="/images/music_on.svg" alt="Music on" width={24} height={24} />
            ) : (
              <Image src="/images/music_off.svg" alt="Music off" width={24} height={24} />
            )}
        </button>
      </div>
      <div
        className={`relative mx-auto ${hasEnded ? "cursor-default" : "cursor-pointer"}`}
        style={{ width: "870px", maxWidth: "100%", height: "600px", maxHeight: "calc(100vw * 0.6897)" }}
        onClick={handleTap}
      >
        
        {/* Fade Stack */}
        <div className="absolute inset-0 overflow-hidden bg-black">
          {validItems.map((item, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
              style={{ opacity: index === currentIndex ? (hasEnded && index === validItems.length - 1 ? 0 : 1) : 0 }}
            >
              {item.isVideo ? (
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  src={item.url}
                  className={item.isVertical ? "h-full w-auto object-contain mx-auto" : "w-full h-full object-cover"}
                  playsInline
                  muted
                  autoPlay={false}
                  loop={false}
                  onLoadedData={() => {
                    if (index === currentIndex) setIsLoading(false);
                  }}
                  onEnded={handleVideoEnded}
                />
              ) : (
                <>
                  {isLoading && index === currentIndex && (
                    <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                  )}
                  <Image
                    src={item.url}
                    alt={item.alt || `Image ${index + 1}`}
                    fill
                    className="object-cover"
                    onLoad={() => {
                      if (index === currentIndex) setIsLoading(false);
                    }}
                    sizes="(max-width: 870px) 100vw, 870px"
                    unoptimized
                    priority={index === 0}
                  />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Play icon overlay when paused mid-carousel */}
        {isPaused && !hasEnded && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="p-4 rounded-full bg-black/40">
              <Play size={48} className="text-white" fill="white" />
            </div>
          </div>
        )}

        {/* End screen: credits, CTA, YouTube link, and replay */}
        <div
          className={`absolute inset-0 z-20 bg-black transition-opacity duration-[2000ms] ease-in-out ${showPlayButton ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{ opacity: hasEnded ? 1 : 0 }}
          aria-hidden={!hasEnded}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center font-[family-name:var(--font-avenir)] text-white px-6">
            <button
              onClick={handleReplay}
              className="mb-10 flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
              aria-label="Replay carousel"
              tabIndex={showPlayButton ? 0 : -1}
            >
              <RotateCcw size={16} strokeWidth={1.5} />
            </button>

            <p
              className="mb-0 font-normal text-white"
              style={{ fontSize: "25px", lineHeight: 1.2 }}
            >
              Design by
            </p>
            <p
              className="mb-0 mt-[6px] font-bold text-white text-center"
              style={{ fontSize: "30px", lineHeight: 1.25 }}
            >
              Legacy Portraits by Chris
            </p>

            <a
              href="https://legacy-portraits.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-[52px] border border-white rounded-[6px] text-white font-normal hover:bg-white hover:text-black transition-colors"
              style={{ fontSize: "16px", lineHeight: 1.2, padding: "10px 40px" }}
              tabIndex={showPlayButton ? 0 : -1}
              onClick={(e) => e.stopPropagation()}
            >
              Find out more
            </a>

            <a
              href="https://youtu.be/mYu7BZuFlj8"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-[72px] font-normal text-white text-center hover:underline"
              style={{ fontSize: "20px", lineHeight: 1.45 }}
              tabIndex={showPlayButton ? 0 : -1}
              onClick={(e) => e.stopPropagation()}
            >
              Styling the modern centenarian woman:
              <br />
              watch the story of Catherine of Viceroy on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
