'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 25, 
        mass: 0.8 
      }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
