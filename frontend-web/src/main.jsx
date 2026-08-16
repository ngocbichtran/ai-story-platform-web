import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./features/styles/scrollbar.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />

        <Toaster
            position="top-right"
            toastOptions={{
                duration: 2000, // Thời gian hiện
                style: {
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                },
            }}
        />
    </GoogleOAuthProvider>
);
