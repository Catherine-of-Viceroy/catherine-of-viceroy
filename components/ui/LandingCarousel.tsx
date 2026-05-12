"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
  url: string;
  alt?: string;
  isVideo?: boolean;
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
  const [isTransitioning, setIsTransitioning] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Filter out items with empty URLs
  const validItems = items.filter((item) => item.url && item.url.trim() !== "");

  if (validItems.length === 0) {
    return null;
  }

  // Create infinite carousel items: [last, ...items, first]
  const carouselItems = [
    validItems[validItems.length - 1], // Clone of last at beginning
    ...validItems,
    validItems[0], // Clone of first at end
  ];

  // Start at index 1 (first real item)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [targetIndex, setTargetIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentItem = carouselItems[currentIndex];
  const isCurrentVideo = currentItem?.isVideo;
  const realItemCount = validItems.length;
  const realIndex = ((currentIndex - 1 + realItemCount) % realItemCount);


  // Move one step toward target
  const stepTowardTarget = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === targetIndex) {
        setIsAnimating(false);
        return prev;
      }
      if (targetIndex < prev) {
        return prev - 1;
      }
      return prev + 1;
    });
  }, [targetIndex]);

  // Handle target index changes - animate step by step
  useEffect(() => {
    if (currentIndex === targetIndex) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setIsTransitioning(true);
    const stepTimer = setTimeout(() => {
      stepTowardTarget();
    }, 400);

    return () => clearTimeout(stepTimer);
  }, [targetIndex, currentIndex, stepTowardTarget]);

  // Handle infinite wrap-around after transition
  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      // If we're at the clone of first (end), jump to real first
      if (currentIndex === carouselItems.length - 1) {
        setIsTransitioning(false);
        setCurrentIndex(1);
        setTargetIndex(1);
      }
      // If we're at the clone of last (beginning), jump to real last
      else if (currentIndex === 0) {
        setIsTransitioning(false);
        setCurrentIndex(realItemCount);
        setTargetIndex(realItemCount);
      }
    }, 500); // Wait for CSS transition to finish

    return () => clearTimeout(timer);
  }, [currentIndex, carouselItems.length, isTransitioning, realItemCount]);


  // Play video on active slide, pause all others
  useEffect(() => {
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

  // Manual navigation
  const goToPrevious = () => {
    if (isAnimating) return;
    setTargetIndex((prev) => prev - 1);
    setIsLoading(true);
  };

  const goToNext = () => {
    if (isAnimating) return;
    setTargetIndex((prev) => prev + 1);
    setIsLoading(true);
  };

  // Calculate transform offset
  const translateX = -currentIndex * 100;

  return (
    <div className="flex flex-col w-full">
    <div className="relative w-full max-w-[870px] mx-auto" style={{ aspectRatio: "870/600" }}>
      {/* Sliding Track */}
      <div className="relative w-full h-full overflow-hidden bg-zinc-900">
        <div
          ref={trackRef}
          className="flex h-full"
          style={{
            transform: `translateX(${translateX}%)`,
            transition: isTransitioning ? "transform 500ms ease-out" : "none",
          }}
        >
          {carouselItems.map((item, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-full h-full"
            >
              {item.isVideo ? (
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  src={item.url}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay={false}
                  loop={false}
                  onLoadedData={() => {
                    if (index === currentIndex) setIsLoading(false);
                  }}
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
                    sizes="870px"
                    unoptimized
                    priority={index === 1}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Dots - use real index */}
      {realItemCount > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {validItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  // Calculate target in carousel (add 1 for the clone at start)
                  const carouselTarget = index + 1;
                  setTargetIndex(carouselTarget);
                  setIsLoading(true);
                }
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === realIndex
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
    {/* Navigation Buttons */}
      {realItemCount > 1 && (
        <div className="flex flex-row justify-center w-full items-end gap-2 pt-8">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-white/50 text-black hover:bg-white/70 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-white/50 text-black hover:bg-white/70 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
