'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'blue' | 'gray';
  className?: string;
}

export default function Spinner({ 
  size = 'md', 
  color = 'blue', 
  className = '' 
}: SpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'text-white';
      case 'blue':
        return 'text-indigo-600';
      case 'gray':
        return 'text-gray-600';
      default:
        return 'text-indigo-600';
    }
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${getSizeClasses()} ${getColorClasses()}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

// Skeleton loading component for quote display
export function QuoteSkeleton() {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-md animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  );
}