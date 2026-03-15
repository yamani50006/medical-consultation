import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import SmoothScrollProvider from "./components/shared/SmoothScrollProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { AuthProvider } from "./features/auth/AuthContext.jsx";
import { RealtimeProvider } from "./features/realtime/RealtimeProvider.jsx";
import router from "./app/router.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SmoothScrollProvider>
        <AuthProvider>
          <RealtimeProvider>
            <RouterProvider router={router} />
          </RealtimeProvider>
        </AuthProvider>
      </SmoothScrollProvider>
    </ThemeProvider>
  </React.StrictMode>
);
