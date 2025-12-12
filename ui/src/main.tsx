import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";
import "sonner/dist/styles.css";
import { ClashProvider } from "./hooks/use-clash";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ClashProvider>
      <App />
      <Toaster position="top-right" richColors />
    </ClashProvider>
  </React.StrictMode>
);
