import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import SmoothScrollProvider from "./components/shared/SmoothScrollProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { AuthProvider } from "./features/auth/AuthContext.jsx";
import router from "./app/router.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SmoothScrollProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </SmoothScrollProvider>
    </ThemeProvider>
  </React.StrictMode>
);
