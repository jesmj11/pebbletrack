import { useEffect } from 'react';

/**
 * Hook to suppress the runtime error plugin's useRef error
 * This is a workaround for the Vite runtime error plugin conflict
 */
export function useErrorSuppression() {
  useEffect(() => {
    // Intercept console.error to filter out the specific runtime error plugin error
    const originalError = console.error;
    
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      
      // Filter out the specific runtime error plugin useRef error
      if (message.includes('Cannot read properties of null (reading \'useRef\')') ||
          message.includes('runtime-error-plugin')) {
        // Suppress this specific error
        return;
      }
      
      // Allow all other errors through
      originalError.apply(console, args);
    };

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalError;
    };
  }, []);
}