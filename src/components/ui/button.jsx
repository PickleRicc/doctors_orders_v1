import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button component following the PT SOAP Generator style guide
 */
const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  
  // Style guide colors and variants
  const variants = {
    primary: 'bg-blue-primary text-white hover:bg-blue-dark active:bg-blue-dark active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]',
    secondary: 'bg-white border border-border text-foreground hover:bg-muted active:bg-border',
    ghost: 'bg-transparent text-blue-primary hover:bg-blue-light active:bg-blue-light/80',
  };

  // Style guide sizes
  const sizes = {
    small: 'h-9 px-4 text-sm',
    medium: 'h-11 px-6 text-base',
    large: 'h-12 px-8 text-base',
  };

  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2';
  
  const disabledStyles = disabled ? 
    'opacity-50 cursor-not-allowed' : 
    'transform active:scale-[0.98]';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabledStyles}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
};

export { Button };
