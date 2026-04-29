import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

export function BlurIn({ children, delay = 0, className = '' }: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ filter: 'blur(20px)', opacity: 0, y: 20 }}
      animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
