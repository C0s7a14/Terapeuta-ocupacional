import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { PortalAuthProvider } from "./contexts/PortalAuthContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider><PortalAuthProvider><App /></PortalAuthProvider></AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
