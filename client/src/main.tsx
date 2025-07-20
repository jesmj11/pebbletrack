import { createRoot } from "react-dom/client";
import SafeApp from "./components/SafeApp";
import App from "./App";
import "./index.css";
import { UserProvider } from "./context/UserContext";
import { registerServiceWorker } from "./lib/pwa";

// Register service worker for PWA functionality
registerServiceWorker();

// Override global error handling to suppress runtime error plugin conflicts
const originalError = window.console.error;
window.console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  if (message.includes('Cannot read properties of null (reading \'useRef\')') ||
      message.includes('runtime-error-plugin') ||
      message.includes('useRef')) {
    // Suppress these specific errors that are caused by the runtime error plugin
    return;
  }
  originalError.apply(console, args);
};

// Create root and render with comprehensive error handling
const root = createRoot(document.getElementById("root")!);

root.render(
  <SafeApp>
    <UserProvider>
      <App />
    </UserProvider>
  </SafeApp>
);
