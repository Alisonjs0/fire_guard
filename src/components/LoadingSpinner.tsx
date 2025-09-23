interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner = ({ size = 'md', text = 'Carregando...', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-[#48A9A6] border-t-transparent ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-lg text-[#2F4858] font-medium">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 