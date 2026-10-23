import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import "./styles/styles.css";
import "./styles/documents.css";
import App from "./app/App";
import "./styles/mobile.css";
import "./styles/mobile-studio.css";
import "./styles/home.css";
import "./styles/workspace.css";
import "./styles/canvas.css";
import "./styles/pixel-art.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
