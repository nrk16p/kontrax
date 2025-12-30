import React, { useEffect, useState } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { Button } from "./ui/Button"
import { FileText, Menu, X, User, LogOut } from "lucide-react"

import {
  isAuthenticated,
  clearToken,
  getUserFromToken,
} from "../lib/auth"

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const navigate = useNavigate()

  /* -------------------------------------------------
     🔑 Sync auth state from JWT (IMPORTANT)
  ------------------------------------------------- */
  useEffect(() => {
    const syncAuth = () => {
      const ok = isAuthenticated()
      setLoggedIn(ok)

      if (ok) {
        const user = getUserFromToken()
        setUserName(user?.firstName || "User")
      } else {
        setUserName(null)
      }
    }

    // initial load
    syncAuth()

    // sync across tabs & after login/logout
    window.addEventListener("storage", syncAuth)
    window.addEventListener("focus", syncAuth)

    return () => {
      window.removeEventListener("storage", syncAuth)
      window.removeEventListener("focus", syncAuth)
    }
  }, [])

  /* -------------------------------------------------
     Logout
  ------------------------------------------------- */
  const handleLogout = () => {
    clearToken()
    setLoggedIn(false)
    setUserName(null)
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-slate-900">
              Kontrax
            </span>
          </Link>

          {/* -------- Desktop Navigation -------- */}
          <nav className="hidden md:flex items-center space-x-6">
            {loggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>

                <Link
                  to="/create-contract"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  New Contract
                </Link>

                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {userName}
                    </span>
                  </div>

                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>

          {/* -------- Mobile Toggle -------- */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* -------- Mobile Menu -------- */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white p-4 space-y-4">
            {loggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-sm font-medium text-slate-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>

                <Link
                  to="/create-contract"
                  className="block text-sm font-medium text-slate-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  New Contract
                </Link>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {userName}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-sm text-slate-500 text-center">
          © {new Date().getFullYear()} ContractFlow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
