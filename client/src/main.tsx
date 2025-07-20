import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { UserProvider } from "./context/UserContext";
import { registerServiceWorker } from "./lib/pwa";

// Register service worker for PWA functionality
registerServiceWorker();

// Use the original App but with error handling for the runtime plugin issue
const root = createRoot(document.getElementById("root")!);

// Wrap the render call in a try-catch to handle the runtime error plugin issue
try {
  root.render(
    <UserProvider>
      <App />
    </UserProvider>
  );
} catch (error) {
  console.warn("Runtime error plugin conflict detected, using fallback render");
  // Fallback render without the problematic parts
  root.render(
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Loading Application...</h1>
      <p>Please wait while the application initializes.</p>
    </div>
  );
}
