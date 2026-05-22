"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageItem {
  url: string;
  alt?: string;
  isVideo?: boolean;
  width?: number | string;
}

interface LastItemHandle {
  autoReturn?: boolean;
  animation?: string;
  duration?: number;
  fadeDuration?: number;
}

interface ImageCarouselProps {
  images: ImageItem[];
  width?: number;
  height?: number;
  autoSlide?: boolean;
  interval?: number;
  lastItemHandle?: LastItemHandle;
}

export default function ImageCarousel({
  images,
  width = 400,
  height = 600,
  autoSlide = false,
  interval = 5000,
  lastItemHandle,
}: ImageCarouselProps) {
  // Resolve per-image widths, falling back to the carousel default
  const resolveWidth = (img: ImageItem) =>
    img.width ? Number(img.width) : width;
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const returnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredReturn = useRef(false);
  const initialOpacity = useRef(1);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [isPausedForReturn, setIsPausedForReturn] = useState(false);
  const [currentFadeDuration, setCurrentFadeDuration] = useState(500);

  // Filter out images with empty URLs
  const validImages = images.filter((img) => img.url && img.url.trim() !== "");

  if (validImages.length === 0) {
    return null;
  }

  // Create infinite carousel items: [last, ...items, first]
  const carouselItems = [
    validImages[validImages.length - 1],
    ...validImages,
    validImages[0],
  ];

  // Start at index 1 (first real item)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [targetIndex, setTargetIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const realImageCount = validImages.length;
  const realIndex = ((currentIndex - 1 + realImageCount) % realImageCount);

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
        setCurrentIndex(realImageCount);
        setTargetIndex(realImageCount);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentIndex, carouselItems.length, isTransitioning, realImageCount]);

  // Handle last item auto-return with fade animation
  useEffect(() => {
    const shouldAutoReturn = lastItemHandle?.autoReturn;
    const animation = lastItemHandle?.animation;
    const duration = lastItemHandle?.duration ?? 4000;
    const fadeDuration = lastItemHandle?.fadeDuration ?? 500;

    // Reset trigger flag when we leave the last image
    if (currentIndex !== realImageCount) {
      hasTriggeredReturn.current = false;
      return;
    }


    // Trigger when we're at the last real image (currentIndex === realImageCount means last real item)
    // and animation is complete, and we haven't already triggered
    if (
      shouldAutoReturn &&
      currentIndex === realImageCount &&
      !isAnimating &&
      !hasTriggeredReturn.current &&
      validImages.length > 1
    ) {
      hasTriggeredReturn.current = true;
      setIsPausedForReturn(true);
      setCurrentFadeDuration(fadeDuration);

      if (animation === "fade" || animation === "fade-out") {
        // Wait for duration, then fade out and return
        returnTimerRef.current = setTimeout(() => {
          setIsFadingOut(true);
          fadeTimerRef.current = setTimeout(() => {
            setIsTransitioning(false);
            setCurrentIndex(1);
            setTargetIndex(1);
            setIsFadingOut(false);
            // Set initial opacity to 0 for fade-in
            initialOpacity.current = 0;
            // Start fade in for first image
            setIsFadingIn(true);
            // Small delay then fade to 1
            setTimeout(() => {
              setIsTransitioning(true);
              initialOpacity.current = 1;
              // Force a re-render by toggling state
              setIsFadingIn((prev) => prev);
            }, 50);
            fadeTimerRef.current = setTimeout(() => {
              setIsFadingIn(false);
              setIsPausedForReturn(false);
              hasTriggeredReturn.current = false;
            }, fadeDuration + 50);
          }, fadeDuration);
        }, duration);
      } else {
        // No animation, just wait and return
        returnTimerRef.current = setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(1);
          setTargetIndex(1);
          setIsPausedForReturn(false);
          hasTriggeredReturn.current = false;
        }, duration);
      }
    }

    return () => {
      // Only clear timers if we're leaving the last image (component unmount or index change)
      if (currentIndex !== realImageCount) {
        if (returnTimerRef.current) {
          clearTimeout(returnTimerRef.current);
          returnTimerRef.current = null;
        }
        if (fadeTimerRef.current) {
          clearTimeout(fadeTimerRef.current);
          fadeTimerRef.current = null;
        }
      }
    };
  }, [
    currentIndex,
    realImageCount,
    isAnimating,
    lastItemHandle,
    validImages.length,
  ]);

  // Auto-slide: advance every interval ms when autoSlide is true
  useEffect(() => {
    if (!autoSlide || validImages.length <= 1 || isPausedForReturn) {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
        autoSlideRef.current = null;
      }
      return;
    }

    autoSlideRef.current = setInterval(() => {
      if (!isAnimating && !isPausedForReturn) {
        setTargetIndex((prev) => prev + 1);
        setIsLoading(true);
      }
    }, interval);

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
        autoSlideRef.current = null;
      }
    };
  }, [autoSlide, interval, isAnimating, isPausedForReturn, validImages.length]);

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

  const handleImageChange = (index: number) => {
    if (isAnimating) return;
    // Calculate target in carousel (add 1 for the clone at start)
    const carouselTarget = index + 1;
    setTargetIndex(carouselTarget);
    setIsLoading(true);
  };

  // Use the widest image's aspect ratio for the container
  const maxWidth = Math.max(...carouselItems.map((img) => resolveWidth(img)));
  const aspectRatio = `${maxWidth}/${height}`;

  // Calculate transform offset
  const translateX = -currentIndex * 100;

  return (
    <div className="flex flex-col w-full" style={{ maxWidth }}>
    <div className="relative w-full" style={{ aspectRatio, maxHeight: 533 }}>
      {/* Sliding Track */}
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-zinc-900" style={{ borderRadius: "1rem" }}>
        <div
          className="flex h-full"
          style={{
            transform: `translateX(${translateX}%)`,
            opacity: isFadingOut ? 0 : (isFadingIn ? initialOpacity.current : 1),
            transitionProperty: isFadingOut ? "opacity" : (isFadingIn ? "opacity" : "transform"),
            transitionDuration: (isFadingOut || isFadingIn) ? `${currentFadeDuration}ms` : (isTransitioning ? "500ms" : "0ms"),
            transitionTimingFunction: "ease-out",
          }}
        >
          {carouselItems.map((image, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-full h-full flex justify-center"
            >
              {image.isVideo ? (
                <video
                  src={image.url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  {isLoading && index === currentIndex && (
                    <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                  )}
                  <Image
                    src={image.url}
                    alt={image.alt || `Image ${index + 1}`}
                    fill
                    className="object-cover"
                    onLoad={() => {
                      if (index === currentIndex) setIsLoading(false);
                    }}
                    sizes={`${maxWidth}px`}
                    unoptimized
                    priority={index === 1}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {validImages.length > 1 && (
        <>
          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleImageChange(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === realIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
    {validImages.length > 1 && (
      <div className="flex flex-row justify-center w-full items-center gap-2 mt-2">
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
