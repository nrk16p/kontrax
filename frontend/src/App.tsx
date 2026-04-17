import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom"
import { lazy, Suspense, useEffect, useState } from "react"
import { getAuth, onAuthStateChanged, User } from "firebase/auth"

// ─── Lazy load pages (won't crash build if a file has an error) ───────────────

const TemplateLibrary = lazy(() => import("./pages/TemplateLibrary"))
const ContractForm    = lazy(() => import("./pages/ContractForm"))
const SignContract    = lazy(() => import("./pages/SignContract"))

// ─── Loading spinner ──────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      กำลังโหลด...
    </div>
  )
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<User | null | "loading">("loading")

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => setUser(u))
    return unsub
  }, [])

  if (user === "loading") return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

// ─── Nav bar ──────────────────────────────────────────────────────────────────

function NavBar() {
  const location = useLocation()
  const isAuthPage = ["/login", "/register"].includes(location.pathname)
  if (isAuthPage) return null

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/templates" className="font-bold text-gray-900 text-lg tracking-tight">
        Kontrax
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link
          to="/templates"
          className={`transition ${
            location.pathname.startsWith("/templates")
              ? "text-gray-900 font-semibold"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          เลือกสัญญา
        </Link>
        <button
          onClick={() => getAuth().signOut()}
          className="text-gray-400 hover:text-red-500 transition text-sm"
        >
          ออกจากระบบ
        </button>
      </div>
    </nav>
  )
}

// ─── Login page ───────────────────────────────────────────────────────────────

function LoginPage() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [mode, setMode]         = useState<"login" | "register">("login")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      if (mode === "login") {
        const { signInWithEmailAndPassword } = await import("firebase/auth")
        await signInWithEmailAndPassword(getAuth(), email, password)
      } else {
        const { createUserWithEmailAndPassword } = await import("firebase/auth")
        await createUserWithEmailAndPassword(getAuth(), email, password)
      }
      window.location.href = "/templates"
    } catch (err: any) {
      // Show user-friendly Thai error messages
      const code = err.code as string
      if (code === "auth/user-not-found" || code === "auth/wrong-password") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      } else if (code === "auth/email-already-in-use") {
        setError("อีเมลนี้ถูกใช้งานแล้ว")
      } else if (code === "auth/weak-password") {
        setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kontrax</h1>
          <p className="text-sm text-gray-500 mt-1">สัญญาอิเล็กทรอนิกส์ · ลงนามออนไลน์</p>
        </div>

        {/* Tab switch */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError("") }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {m === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 transition"
          >
            {loading
              ? "กำลังดำเนินการ..."
              : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"
            }
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />

          {/* Protected */}
          <Route path="/templates" element={
            <RequireAuth><TemplateLibrary /></RequireAuth>
          } />

          <Route path="/contracts/new/:templateId" element={
            <RequireAuth><ContractForm /></RequireAuth>
          } />

          <Route path="/contracts/:id/sign" element={
            <RequireAuth><SignContract /></RequireAuth>
          } />

          {/* Default */}
          <Route path="*" element={<Navigate to="/templates" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
