import './Spinner.scss';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 32,
  lg: 48,
};

const Spinner = ({ size = 'md', color = '#C4A35A', className = '' }: SpinnerProps) => {
  const dimension = sizeMap[size];
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 3 : 4;

  const classNames = ['spinner', `spinner--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      className={classNames}
      width={dimension}
      height={dimension}
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Cargando"
    >
      <circle
        className="spinner__track"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeOpacity="0.2"
        strokeWidth={strokeWidth}
      />
      <circle
        className="spinner__circle"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="31.4 94.2"
      />
    </svg>
  );
};

export default Spinner;
