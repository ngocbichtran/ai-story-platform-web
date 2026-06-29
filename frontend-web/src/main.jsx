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
                style: {
                    background: "#1e1e2f",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                },
            }}
        />
    </GoogleOAuthProvider>
);
