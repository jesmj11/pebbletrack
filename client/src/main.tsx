import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { UserProvider } from "./context/UserContext";
import { registerServiceWorker, initializeInstallPrompt, initializeNetworkListener } from "./lib/pwa";

// Initialize PWA features
const initializePWA = async () => {
  // Register service worker
  const registration = await registerServiceWorker();
  
  // Initialize install prompt handling
  initializeInstallPrompt();
  
  // Initialize network status monitoring
  initializeNetworkListener((isOnline) => {
    if (isOnline) {
      console.log('App is online - syncing data');
    } else {
      console.log('App is offline - using cached data');
    }
  });
  
  return registration;
};

// Start the app
initializePWA().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <UserProvider>
        <App />
      </UserProvider>
    </StrictMode>
  );
});
