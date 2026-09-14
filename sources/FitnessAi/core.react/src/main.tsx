import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "./lib/i18n/I18nProvider";
import "./styles/globals.css";
import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
