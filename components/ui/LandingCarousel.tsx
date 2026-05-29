"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { shuffleRandomizableItems } from "@/lib/utils";

interface CarouselItem {
  url: string;
  alt?: string;
  isVideo?: boolean;
  isVertical?: boolean;
  randomizeOrder?: boolean;
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
    
    audioRef.current = new Audio('https://pub-782ad05e2fa6419ab14996b34b3da192.r2.dev/Landing%20Page/music_for_creators-never-surrender-127158.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    
    // Try to autoplay music if browser allows
    audioRef.current.play().then(() => {
      setIsMusicPlaying(true);
    }).catch(() => {
      // Autoplay blocked - music stays off, user can enable via button
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
    if (!audioRef.current) return;
    
    if (isMusicPlaying && !isPaused) {
      audioRef.current.play().catch(() => {});
    } else if (isPaused) {
      audioRef.current.pause();
    }
  }, [isMusicPlaying, isPaused]);

  // Delay music pause until fade-out completes
  useEffect(() => {
    if (!audioRef.current || !hasEnded) return;
    
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }, 2400);
    
    return () => clearTimeout(timer);
  }, [hasEnded]);

  const advance = useCallback(() => {
    // Check if we're on the last slide before advancing
    if (currentIndex >= validItems.length - 1) {
      setHasEnded(true);
      setTimeout(() => {
        setShowPlayButton(true);
      }, 2400);
      return;
    }
    
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= validItems.length) {
        setHasEnded(true);
        setTimeout(() => {
          setShowPlayButton(true);
        }, 2400);
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
      }, 2400);
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

  const handleTap = () => {
    if (hasEnded) {
      setShowPlayButton(false);
      setHasEnded(false);
      setIsPaused(false);
      setCurrentIndex(0);
      setIsLoading(true);
      // Restart music from beginning if it was playing
      if (audioRef.current && isMusicPlaying) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
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
            className="absolute right-0 z-30 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
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
        className="relative mx-auto cursor-pointer"
        style={{ width: "870px", maxWidth: "100%", height: "600px", maxHeight: "calc(100vw * 0.6897)" }}
        onClick={handleTap}
      >
        
        {/* Fade Stack */}
        <div className="absolute inset-0 overflow-hidden bg-black">
          {validItems.map((item, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-[2400ms] ease-in-out"
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

        {/* Progress Dots - use real index
        {validItems.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {validItems.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  setIsLoading(true);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )} */}
        {/* Music control button - top right */}

        {/* Play icon overlay when paused or ended */}
        {(isPaused || showPlayButton) && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="p-4 rounded-full bg-black/40">
              <Play size={48} className="text-white" fill="white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
