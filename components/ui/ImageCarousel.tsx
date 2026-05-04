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
  const [displayIndex, setDisplayIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter out images with empty URLs
  const validImages = images.filter((img) => img.url && img.url.trim() !== "");

  if (validImages.length === 0) {
    return null;
  }

  const currentImage = validImages[displayIndex];

  // Move one step toward target
  const stepTowardTarget = useCallback(() => {
    setDisplayIndex((prev) => {
      if (prev === targetIndex) {
        setIsAnimating(false);
        return prev;
      }
      // Move backward (decrement) when target is less than current
      if (targetIndex < prev) {
        return prev - 1;
      }
      // Move forward (increment) when target is greater than current
      return prev + 1;
    });
  }, [targetIndex]);

  // Handle target index changes - animate step by step
  useEffect(() => {
    if (displayIndex === targetIndex) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const stepTimer = setTimeout(() => {
      stepTowardTarget();
    }, 400); // Time for each slide step

    return () => clearTimeout(stepTimer);
  }, [targetIndex, displayIndex, stepTowardTarget]);

  const goToPrevious = () => {
    if (isAnimating) return;
    const newTarget = displayIndex === 0 ? validImages.length - 1 : displayIndex - 1;
    setTargetIndex(newTarget);
    setIsLoading(true);
  };

  const goToNext = () => {
    if (isAnimating) return;
    const newTarget = displayIndex === validImages.length - 1 ? 0 : displayIndex + 1;
    setTargetIndex(newTarget);
    setIsLoading(true);
  };

  const handleImageChange = (index: number) => {
    if (isAnimating || index === displayIndex) return;
    setTargetIndex(index);
    setIsLoading(true);
  };

  // Calculate transform offset
  const translateX = -displayIndex * 100;

  return (
    <div className="relative" style={{ width, height }}>
      {/* Sliding Track */}
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-zinc-900">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${translateX}%)` }}
        >
          {validImages.map((image, index) => (
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
                  {isLoading && index === displayIndex && (
                    <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                  )}
                  <Image
                    src={image.url}
                    alt={image.alt || `Image ${index + 1}`}
                    fill
                    className="object-cover"
                    onLoad={() => {
                      if (index === displayIndex) setIsLoading(false);
                    }}
                    sizes={`${width}px`}
                    unoptimized
                    priority={index === 0}
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
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleImageChange(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === displayIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
