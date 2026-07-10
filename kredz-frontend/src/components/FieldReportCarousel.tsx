import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FieldReport {
  quote: string;
  attribution: string;
  context: string;
}

interface FieldReportCarouselProps {
  reports: FieldReport[];
  className?: string;
  intervalMs?: number;
}

export function FieldReportCarousel({
  reports,
  className = '',
  intervalMs = 6000,
}: FieldReportCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback((i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  }, [index]);

  const next = useCallback(() => {
    goTo((index + 1) % reports.length);
  }, [index, reports.length, goTo]);

  const prev = useCallback(() => {
    goTo((index - 1 + reports.length) % reports.length);
  }, [index, reports.length, goTo]);

  useEffect(() => {
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [next, intervalMs]);

  const report = reports[index];

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  return (
    <div className={`relative ${className}`}>
      <div className="min-h-[180px] flex items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.blockquote
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full text-center"
          >
            <p className="text-[#DEDBC8]/80 text-base md:text-lg leading-relaxed italic mb-4">
              &ldquo;{report.quote}&rdquo;
            </p>
            <footer className="text-[#DEDBC8]/50 text-xs">
              <span className="text-[#DEDBC8]/70 font-medium">{report.attribution}</span>
              <span className="mx-2">&middot;</span>
              <span>{report.context}</span>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={prev}
          className="p-1.5 rounded-full hover:bg-[#DEDBC8]/10 transition-colors"
          aria-label="Previous report"
        >
          <ChevronLeft size={16} className="text-[#DEDBC8]/30" />
        </button>
        <div className="flex gap-2">
          {reports.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'bg-[#DEDBC8] w-4' : 'bg-[#DEDBC8]/20'
              }`}
              aria-label={`Report ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="p-1.5 rounded-full hover:bg-[#DEDBC8]/10 transition-colors"
          aria-label="Next report"
        >
          <ChevronRight size={16} className="text-[#DEDBC8]/30" />
        </button>
      </div>
    </div>
  );
}
