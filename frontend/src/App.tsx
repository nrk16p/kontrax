import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { Dashboard } from "./pages/Dashboard"
import { CreateContract } from "./pages/CreateContract"
import { ContractDetails } from "./pages/ContractDetails"

import { ProtectedRoute } from "./components/ProtectedRoute"

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* ---------- Public routes ---------- */}
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* ---------- Protected routes ---------- */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-contract" element={<CreateContract />} />
            <Route path="contract/:id" element={<ContractDetails />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}
