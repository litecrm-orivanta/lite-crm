import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { AuthProvider } from "./auth/AuthContext"
import { ToastProvider } from "./contexts/ToastContext"
import { DialogProvider } from "./contexts/DialogContext"
import "./index.css"   // 🔑 THIS WAS LIKELY MISSING

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <DialogProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DialogProvider>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
)
