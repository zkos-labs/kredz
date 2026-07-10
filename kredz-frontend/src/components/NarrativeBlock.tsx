import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface NarrativeBlockProps {
  paragraphs: string[];
  className?: string;
  paragraphClassName?: string;
  delay?: number;
  staggerDelay?: number;
}

export function NarrativeBlock({
  paragraphs,
  className = '',
  paragraphClassName = '',
  delay = 0,
  staggerDelay = 0.15,
}: NarrativeBlockProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className={className}>
      {paragraphs.map((text, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: delay + i * staggerDelay,
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={paragraphClassName}
        >
          {text}
        </motion.p>
      ))}
    </div>
  );
}
