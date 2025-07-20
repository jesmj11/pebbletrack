import { createRoot } from "react-dom/client";
import SimplePlanner from "./SimplePlanner";

// Create a minimal, working planner without complex dependencies
const root = createRoot(document.getElementById("root")!);

root.render(<SimplePlanner />);
