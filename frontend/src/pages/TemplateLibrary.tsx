import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAuth } from "firebase/auth"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Template {
  id:               string
  name:             string
  nameEn:           string
  description:      string
  legalBasis:       string
  category:         string
  fields:           { key: string }[]
  estimatedMinutes: number
}

// ─── Static config per category ───────────────────────────────────────────────

const CATEGORY_META: Record<string, {
  icon:       string
  color:      string
  bgColor:    string
  borderColor:string
  badgeColor: string
}> = {
  rental: {
    icon:        "🏠",
    color:       "text-blue-800",
    bgColor:     "bg-blue-50",
    borderColor: "border-blue-200",
    badgeColor:  "bg-blue-100 text-blue-700",
  },
  employment: {
    icon:        "💼",
    color:       "text-purple-800",
    bgColor:     "bg-purple-50",
    borderColor: "border-purple-200",
    badgeColor:  "bg-purple-100 text-purple-700",
  },
  nda: {
    icon:        "🔒",
    color:       "text-amber-800",
    bgColor:     "bg-amber-50",
    borderColor: "border-amber-200",
    badgeColor:  "bg-amber-100 text-amber-700",
  },
  loan: {
    icon:        "💰",
    color:       "text-green-800",
    bgColor:     "bg-green-50",
    borderColor: "border-green-200",
    badgeColor:  "bg-green-100 text-green-700",
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  all:        "ทั้งหมด",
  rental:     "สัญญาเช่า",
  employment: "สัญญาจ้างงาน",
  nda:        "สัญญาไม่เปิดเผยความลับ",
  loan:       "สัญญากู้ยืม",
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplateLibrary() {
  const navigate         = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true)
      setError(null)
      try {
        const user  = getAuth().currentUser
        const token = user ? await user.getIdToken() : ""
        const url   = activeCategory === "all"
          ? `${API_BASE}/templates`
          : `${API_BASE}/templates?category=${activeCategory}`

        const res  = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const json = await res.json()
        setTemplates(json.data ?? [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [activeCategory])

  const handleSelect = (template: Template) => {
    // Navigate to form with template ID
    navigate(`/contracts/new/${template.id}`, { state: { template } })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-gray-900">สร้างสัญญาใหม่</h1>
          <p className="mt-2 text-gray-500 text-sm max-w-xl">
            เลือกแบบสัญญาที่ต้องการ ทุกแบบฟอร์มจัดทำโดยทนายความ
            และเป็นไปตามกฎหมายไทยที่บังคับใช้ปัจจุบัน
          </p>

          {/* Stats row */}
          <div className="flex gap-6 mt-6">
            {[
              { label: "แบบสัญญา",      value: "4" },
              { label: "ตาม กฎหมายไทย", value: "100%" },
              { label: "นาที",          value: "4–7" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Category filter ── */}
        <div className="flex gap-2 flex-wrap mb-6">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {key !== "all" && <span className="mr-1">{CATEGORY_META[key]?.icon}</span>}
              {label}
            </button>
          ))}
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1.5" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
            ⚠ ไม่สามารถโหลดแบบสัญญาได้: {error}
            <br />
            <span className="text-xs text-red-400 mt-1 block">
              ตรวจสอบว่า backend กำลังทำงานและ seed script ถูกรันแล้ว
            </span>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && templates.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p className="font-medium">ยังไม่มีแบบสัญญา</p>
            <p className="text-sm mt-1">รัน seed script เพื่อเพิ่มแบบสัญญา</p>
            <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg mt-3 inline-block text-gray-500">
              npx ts-node src/scripts/seedTemplates.ts
            </code>
          </div>
        )}

        {/* ── Template grid ── */}
        {!loading && !error && templates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} onSelect={() => handleSelect(t)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onSelect,
}: {
  template: Template
  onSelect: () => void
}) {
  const meta = CATEGORY_META[template.category] ?? CATEGORY_META.rental

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl border-2 ${meta.borderColor} p-6 hover:shadow-md transition-all cursor-pointer group`}
    >
      {/* Icon + title row */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 ${meta.bgColor} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-snug">{template.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{template.nameEn}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* Law reference badge */}
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta.badgeColor} mb-4`}>
        <span>⚖️</span>
        <span className="truncate max-w-[220px]">{template.legalBasis}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>⏱ {template.estimatedMinutes} นาที</span>
          <span>· {template.fields?.length ?? 0} ฟิลด์</span>
        </div>
        <span className={`text-sm font-semibold ${meta.color} group-hover:underline transition`}>
          เลือกแบบนี้ →
        </span>
      </div>
    </div>
  )
}
