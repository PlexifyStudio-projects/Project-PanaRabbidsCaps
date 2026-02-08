import { InputHTMLAttributes, SelectHTMLAttributes, ReactNode, useState, useId } from 'react';
import './Input.scss';

interface BaseInputProps {
  label?: string;
  error?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

interface TextInputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  as?: 'input';
}

interface SelectInputProps extends BaseInputProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  as: 'select';
  children: ReactNode;
}

type InputProps = TextInputProps | SelectInputProps;

const Input = (props: InputProps) => {
  const {
    label,
    error,
    icon,
    fullWidth = true,
    className = '',
    as = 'input',
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const generatedId = useId();
  const inputId = (rest as any).id || generatedId;

  const hasValue = (() => {
    const val = (rest as any).value ?? (rest as any).defaultValue ?? '';
    return String(val).length > 0;
  })();

  const wrapperClassNames = [
    'input-wrapper',
    fullWidth ? 'input-wrapper--full-width' : '',
    error ? 'input-wrapper--error' : '',
    isFocused ? 'input-wrapper--focused' : '',
    icon ? 'input-wrapper--has-icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelClassNames = [
    'input-wrapper__label',
    isFocused || hasValue ? 'input-wrapper__label--floating' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setIsFocused(true);
    (rest as any).onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setIsFocused(false);
    (rest as any).onBlur?.(e);
  };

  return (
    <div className={wrapperClassNames}>
      <div className="input-wrapper__container">
        {icon && <span className="input-wrapper__icon">{icon}</span>}

        {as === 'select' ? (
          <select
            id={inputId}
            className="input-wrapper__field input-wrapper__field--select"
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...(rest as Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onFocus' | 'onBlur'>)}
          >
            {(props as SelectInputProps).children}
          </select>
        ) : (
          <input
            id={inputId}
            className="input-wrapper__field"
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...(rest as Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onFocus' | 'onBlur'>)}
          />
        )}

        {label && (
          <label htmlFor={inputId} className={labelClassNames}>
            {label}
            {(rest as any).required && <span className="input-wrapper__required">*</span>}
          </label>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="input-wrapper__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
