import { createRoot } from "react-dom/client";
import ErrorBoundary from "./ErrorBoundary";
import VanillaApp from "./VanillaApp";

// Add error boundary to catch any React errors
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <VanillaApp />
  </ErrorBoundary>
);
