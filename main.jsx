import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom"; // ✅ Add this

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThirdwebProvider
      activeChain="polygon"
      clientId="0dafc74959a14117754ecee0163cb12f"
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter> {/* ✅ Wrap everything that uses routes */}
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThirdwebProvider>
  </React.StrictMode>
);

