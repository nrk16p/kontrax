import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

// Must import firebase init before anything else so getAuth() works in App.tsx
import "./lib/firebase"

import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
