import React from 'react'

// simple function to join class names
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Define button style variants
function buttonVariants({ variant = 'default', size = 'md', className }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    default: 'bg-brandPurple text-white hover:bg-brandDeep',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-gray-300 text-gray-900 hover:bg-gray-100'
  }

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  }

  return classNames(
    base,
    variants[variant] || variants.default,
    sizes[size] || sizes.md,
    className
  )
}

const Button = React.forwardRef(function Button(
  { className, variant, size, children, ...props },
  ref
) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

export { Button }
