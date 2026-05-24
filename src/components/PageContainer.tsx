import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function PageContainer({ children, className, animate = true }: PageContainerProps) {
  const content = (
    <div className={cn("w-full space-y-6 md:space-y-8 pb-12", className)}>
      {children}
    </div>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  );
}
