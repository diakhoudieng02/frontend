import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function RouteLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(40), 50);
    const t2 = setTimeout(() => setProgress(70), 200);
    const t3 = setTimeout(() => setProgress(100), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="h-full rounded-r-full"
        style={{ background: 'var(--gradient-hero)' }}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <div
        className="absolute right-0 top-0 h-full w-24 opacity-60"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4))',
          filter: 'blur(6px)',
        }}
      />
    </motion.div>
  );
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {isNavigating && <RouteLoader key="loader" />}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
