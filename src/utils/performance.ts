// Performance monitoring and optimization utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  startTiming(label: string): void {
    this.metrics.set(label, performance.now());
  }

  // End timing and log result
  endTiming(label: string): number {
    const start = this.metrics.get(label);
    if (!start) {
      console.warn(`No start time found for label: ${label}`);
      return 0;
    }

    const duration = performance.now() - start;
    this.metrics.delete(label);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  // Measure function execution time
  measure<T>(label: string, fn: () => T): T {
    this.startTiming(label);
    const result = fn();
    this.endTiming(label);
    return result;
  }

  // Measure async function execution time
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTiming(label);
    const result = await fn();
    this.endTiming(label);
    return result;
  }

  // Get Web Vitals
  getWebVitals(): void {
    if ('web-vitals' in window) {
      // @ts-ignore
      import('web-vitals').then(({ getLCP, getFID, getCLS }) => {
        getLCP(console.log);
        getFID(console.log);
        getCLS(console.log);
      });
    }
  }

  // Memory usage monitoring
  getMemoryUsage(): any {
    if ('memory' in performance) {
      // @ts-ignore
      return performance.memory;
    }
    return null;
  }

  // Bundle size analysis helper
  logBundleInfo(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 Bundle loaded');
      console.log('💾 Memory:', this.getMemoryUsage());
    }
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Performance singleton
export const performanceMonitor = PerformanceMonitor.getInstance();