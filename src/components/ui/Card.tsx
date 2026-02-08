import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import './Card.scss';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

const Card = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...rest
}: CardProps) => {
  const classNames = [
    'card',
    hoverable ? 'card--hoverable' : '',
    onClick ? 'card--clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className={classNames}
      onClick={onClick}
      whileHover={
        hoverable
          ? {
              y: -4,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(196, 163, 90, 0.1)',
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default Card;
