// import { StrictMode } from "react"; // Removed unused import
import { createRoot } from "react-dom/client";
import MinimalApp from "./MinimalApp";

// Remove all imports that might cause issues
createRoot(document.getElementById("root")!).render(<MinimalApp />);
