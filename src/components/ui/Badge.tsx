import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import './Badge.scss';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gold';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

const Badge = ({
  variant = 'gold',
  size = 'sm',
  children,
  className = '',
}: BadgeProps) => {
  const classNames = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'danger') {
    return (
      <motion.span
        className={classNames}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.span>
    );
  }

  return <span className={classNames}>{children}</span>;
};

export default Badge;
