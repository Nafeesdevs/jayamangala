import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { LangProvider } from "./context/LangContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ShopProvider } from "./context/ShopContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <ShopProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ style: { fontSize: 14 } }} />
          </ShopProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
);
