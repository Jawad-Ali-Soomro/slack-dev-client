import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LazyMotion, domAnimation } from "framer-motion";
import "./index.css";
import App from "./app.jsx";
import { ThemeProvider } from "./contexts/theme-context.jsx";
import { Provider } from "react-redux";
import { store } from "./store/github-store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <LazyMotion features={domAnimation} strict>
          <App />
        </LazyMotion>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
