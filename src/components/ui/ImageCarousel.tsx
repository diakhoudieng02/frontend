import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useCarousel from '@/hooks/useCarousel';

const ILLUSTRATIONS = [
  { image: "/images/img1.png", alt: "Interface d'upload de cours ETOOBLO AI" },
  { image: "/images/img2.png", alt: "Analyse IA des documents ETOOBLO AI" },
  { image: "/images/img3.png", alt: "Génération d'exercices ETOOBLO AI" },
];

export default function ImageCarousel() {
  const { currentSlide, isHovered, setIsHovered, nextSlide, prevSlide, goToSlide } = 
    useCarousel({ totalSlides: ILLUSTRATIONS.length });

  return (
    <div
      className="relative max-w-lg mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <motion.div
          className="flex"
          animate={{ x: `-${currentSlide * 100}%` }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {ILLUSTRATIONS.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={item.image}
                alt={item.alt}
                className="w-full h-[420px] object-cover rounded-3xl"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Image précédente"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>

        <div className="flex gap-2">
          {ILLUSTRATIONS.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index 
                  ? "bg-primary" 
                  : "bg-primary/30 hover:bg-primary/50"
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Image suivante"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      </div>
    </div>
  );
}