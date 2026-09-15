import { useState, useEffect, useCallback } from 'react';

interface UseCarouselProps {
  totalSlides: number;
  autoPlayInterval?: number;
}

export default function useCarousel({ totalSlides, autoPlayInterval = 4000 }: UseCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (isHovered || totalSlides <= 1 || !autoPlayInterval) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isHovered, totalSlides, autoPlayInterval, nextSlide]);

  return {
    currentSlide,
    isHovered,
    setIsHovered,
    nextSlide,
    prevSlide,
    goToSlide,
  };
}