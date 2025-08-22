// Lazy loading component with suspense and error boundaries
import { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';
import { LoadingSpinner } from './loading-spinner';

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

export function LazyLoader({ 
  children, 
  fallback = <LazyLoadingFallback />,
  errorFallback 
}: LazyLoaderProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function LazyLoadingFallback() {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  );
}

// HOC for lazy loading pages
export function withLazyLoading<P extends object = {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: P) {
    return (
      <LazyLoader fallback={fallback}>
        <LazyComponent {...(props as any)} />
      </LazyLoader>
    );
  };
}

// Intersection Observer based lazy loading for images
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export function LazyImage({ src, alt, className, placeholder }: LazyImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      style={{ contentVisibility: 'auto' }}
    />
  );
}