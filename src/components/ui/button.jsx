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
  const getVariantStyles = (variant) => {
    switch(variant) {
      case 'primary':
        return {
          backgroundColor: 'rgb(var(--blue-primary-rgb))',
          color: 'white'
        };
      case 'secondary':
        return {
          backgroundColor: 'white',
          color: 'var(--foreground)',
          border: '1px solid var(--border)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'rgb(var(--blue-primary-rgb))'
        };
      default:
        return {};
    }
  };
  
  const variantClasses = {
    primary: 'hover:opacity-90 active:opacity-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]',
    secondary: 'hover:bg-muted active:bg-border',
    ghost: 'hover:bg-blue-light/10 active:bg-blue-light/20',
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
      style={getVariantStyles(variant)}
      className={`
        ${baseStyles}
        ${variantClasses[variant]}
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
