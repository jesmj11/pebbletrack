// Simple PWA utilities for Pebble Track

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const isAppInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches;
};

export const getNetworkStatus = (): boolean => {
  return navigator.onLine;
};