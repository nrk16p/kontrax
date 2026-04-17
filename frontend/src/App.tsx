import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged, User } from "firebase/auth"

// ── Pages ──────────────────────────────────────────────────────────────────────
// If you already have Login/Register pages, keep your existing imports and
// only ADD the three new imports below

import TemplateLibrary from "./pages/TemplateLibrary"
import ContractForm    from "./pages/ContractForm"
import SignContract    from "./pages/SignContract"

// ── Replace these with your actual existing auth pages if they differ ──────────
// import Login    from "./pages/Login"
// import Register from "./pages/Register"

// ─── Auth guard ────────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: JSX.Element }) {
  const [user, setUser]       = useState<User | null | "loading">("loading")

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => setUser(u))
    return unsub
  }, [])

  if (user === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        กำลังโหลด...
      </div>
    )
  }

  // Not logged in → send to login
  if (!user) return <Navigate to="/login" replace />

  return children
}

// ─── Nav bar ───────────────────────────────────────────────────────────────────

function NavBar() {
  const auth     = getAuth()
  const location = useLocation()
  const isHidden = ["/login", "/register"].includes(location.pathname)
  if (isHidden) return null

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/templates" className="font-bold text-gray-900 text-lg tracking-tight">
        Kontrax
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link
          to="/templates"
          className={`text-gray-600 hover:text-gray-900 transition ${
            location.pathname.startsWith("/templates") ? "font-semibold text-gray-900" : ""
          }`}
        >
          เลือกสัญญา
        </Link>
        <button
          onClick={() => auth.signOut()}
          className="text-gray-400 hover:text-red-500 transition"
        >
          ออกจากระบบ
        </button>
      </div>
    </nav>
  )
}

// ─── Temporary Login placeholder ──────────────────────────────────────────────
// DELETE this and import your real Login page if you have one

function LoginPage() {
  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      await signInWithEmailAndPassword(getAuth(), email, password)
      window.location.href = "/templates"
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!email || !password) return
    setLoading(true)
    setError("")
    try {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      await createUserWithEmailAndPassword(getAuth(), email, password)
      window.location.href = "/templates"
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Kontrax</h1>
        <p className="text-sm text-gray-500 mb-6">สัญญาอิเล็กทรอนิกส์ · ลงนามออนไลน์</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-900"
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-900"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 transition"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition"
          >
            สมัครสมาชิกใหม่
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>

        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />

        {/* Protected — requires Firebase Auth */}
        <Route path="/templates" element={
          <RequireAuth><TemplateLibrary /></RequireAuth>
        }/>

        <Route path="/contracts/new/:templateId" element={
          <RequireAuth><ContractForm /></RequireAuth>
        }/>

        <Route path="/contracts/:id/sign" element={
          <RequireAuth><SignContract /></RequireAuth>
        }/>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/templates" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
