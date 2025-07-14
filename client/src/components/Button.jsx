export function Button({ children, className = "", variant = "default", ...props }) {
  const baseStyles = "px-4 py-2 font-semibold rounded transition";
  
  const variants = {
    default: "bg-yellow-500 text-white",
    outline: "border border-yellow-500 text-yellow-500",
    ghost: "bg-transparent text-yellow-500 hover:underline"
  };

  const combined = `${baseStyles} ${variants[variant] || variants.default} ${className}`;

  return (
    <button className={combined} {...props}>
      {children}
    </button>
  );
}
