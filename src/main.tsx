import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/cormorant-garamond/latin-700.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-600-italic.css";
import "@fontsource/fraunces/latin-300.css";
import "@fontsource/fraunces/latin-400.css";
import "@fontsource/fraunces/latin-500.css";
import "@fontsource/fraunces/latin-400-italic.css";
import "./index.css";
import { initNative } from "./lib/native";

initNative();

createRoot(document.getElementById("root")!).render(<App />);
