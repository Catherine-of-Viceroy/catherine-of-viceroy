"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageItem {
  url: string;
  alt?: string;
  isVideo?: boolean;
}

interface ImageCarouselProps {
  images: ImageItem[];
  width?: number;
  height?: number;
}

export default function ImageCarousel({
  images,
  width = 400,
  height = 600,
}: ImageCarouselProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(true);

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

  // Calculate transform offset
  const translateX = -currentIndex * 100;

  return (
    <div className="relative" style={{ width, height }}>
      {/* Sliding Track */}
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-zinc-900">
        <div
          className="flex h-full"
          style={{
            transform: `translateX(${translateX}%)`,
            transition: isTransitioning ? "transform 500ms ease-out" : "none",
          }}
        >
          {carouselItems.map((image, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-full h-full"
            >
              {image.isVideo ? (
                <video
                  src={image.url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
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
                    sizes={`${width}px`}
                    unoptimized
                    priority={index === 1}
                  />
                </>
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
          <div className="flex flex-row justify-end w-full items-end gap-2 mt-2">
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
        </>
      )}
    </div>
  );
}
