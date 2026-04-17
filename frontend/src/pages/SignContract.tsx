import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import SignaturePad from "../components/contract/SignaturePad"
import { saveSignature, downloadContractPdf, getContractById } from "../services/contractApi"

// ─── Types ────────────────────────────────────────────────────────────────────

type SigningRole = "landlord" | "tenant" | "employer" | "employee"

interface Contract {
  id:          string
  contractNo:  string
  type:        string
  status:      string
  parties?:    { landlord?: Party; tenant?: Party }
  term?:       { startDate?: string; endDate?: string }
  finance?:    { rentAmount?: number; depositAmount?: number }
  createdAt:   string
  signedAt?:   string
}

interface Party { fullName?: string; email?: string }

// ─── Role labels per contract type ───────────────────────────────────────────

const ROLE_MAP: Record<string, { partyA: SigningRole; partyA_label: string; partyB: SigningRole; partyB_label: string }> = {
  house:      { partyA: "landlord", partyA_label: "ผู้ให้เช่า (Party A)", partyB: "tenant",   partyB_label: "ผู้เช่า (Party B)" },
  condo:      { partyA: "landlord", partyA_label: "ผู้ให้เช่า (Party A)", partyB: "tenant",   partyB_label: "ผู้เช่า (Party B)" },
  dorm:       { partyA: "landlord", partyA_label: "ผู้ให้เช่า (Party A)", partyB: "tenant",   partyB_label: "ผู้เช่า (Party B)" },
  commercial: { partyA: "landlord", partyA_label: "ผู้ให้เช่า (Party A)", partyB: "tenant",   partyB_label: "ผู้เช่า (Party B)" },
  employment: { partyA: "employer", partyA_label: "นายจ้าง (Employer)",   partyB: "employee", partyB_label: "ลูกจ้าง (Employee)" },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignContract() {
  const { id }  = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [contract, setContract]         = useState<Contract | null>(null)
  const [loading, setLoading]           = useState(true)
  const [step, setStep]                 = useState<"partyA" | "partyB" | "done">("partyA")
  const [sigA, setSigA]                 = useState<string | null>(null)
  const [sigB, setSigB]                 = useState<string | null>(null)
  const [saving, setSaving]             = useState(false)
  const [downloading, setDownloading]   = useState(false)
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getContractById(id)
      .then(setContract)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading />
  if (error || !contract) return <ErrorState message={error ?? "ไม่พบสัญญา"} />

  const roles = ROLE_MAP[contract.type] ?? ROLE_MAP.house
  const isSigned = contract.status === "signed"

  // ── Submit Party A signature ──────────────────────────────────────────────

  const handleSignA = async () => {
    if (!sigA || !id) return
    setSaving(true)
    setError(null)
    try {
      await saveSignature(id, sigA, roles.partyA)
      setStep("partyB")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Submit Party B signature ──────────────────────────────────────────────

  const handleSignB = async () => {
    if (!sigB || !id) return
    setSaving(true)
    setError(null)
    try {
      await saveSignature(id, sigB, roles.partyB)
      setStep("done")
      // Refresh contract to get updated status
      const updated = await getContractById(id)
      setContract(updated)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Download PDF ──────────────────────────────────────────────────────────

  const handleDownload = async () => {
    if (!id || !contract) return
    setDownloading(true)
    setError(null)
    try {
      await downloadContractPdf(id, contract.contractNo)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <button onClick={() => navigate("/contracts")} className="text-gray-400 hover:text-gray-700 text-sm mr-3">
              ← สัญญาของฉัน
            </button>
            <span className="font-semibold text-sm text-gray-900">{contract.contractNo}</span>
          </div>
          <StatusBadge status={isSigned ? "signed" : step === "done" ? "signed" : "pending_signature"} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* ── Contract Summary Card ── */}
        <ContractSummary contract={contract} roles={roles} />

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            ⚠ {error}
          </div>
        )}

        {/* ── Already signed — just show download ── */}
        {(isSigned || step === "done") && (
          <DownloadCard
            contractNo={contract.contractNo}
            onDownload={handleDownload}
            downloading={downloading}
          />
        )}

        {/* ── Party A signing ── */}
        {!isSigned && step === "partyA" && (
          <SigningCard
            title={`ลงนาม: ${roles.partyA_label}`}
            name={contract.parties?.landlord?.fullName ?? ""}
            stepLabel="ขั้นตอน 1 / 2"
            onSignatureChange={setSigA}
            onSubmit={handleSignA}
            canSubmit={!!sigA}
            loading={saving}
          />
        )}

        {/* ── Party B signing ── */}
        {!isSigned && step === "partyB" && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm">
              ✓ {roles.partyA_label} ลงนามแล้ว — รอ {roles.partyB_label}
            </div>
            <SigningCard
              title={`ลงนาม: ${roles.partyB_label}`}
              name={contract.parties?.tenant?.fullName ?? ""}
              stepLabel="ขั้นตอน 2 / 2"
              onSignatureChange={setSigB}
              onSubmit={handleSignB}
              canSubmit={!!sigB}
              loading={saving}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Contract Summary Card ────────────────────────────────────────────────────

function ContractSummary({ contract, roles }: { contract: Contract; roles: ReturnType<typeof ROLE_MAP.house.valueOf> }) {
  const typeLabel: Record<string, string> = {
    house: "บ้านพักอาศัย", condo: "คอนโดมิเนียม",
    dorm: "หอพัก", commercial: "อาคารพาณิชย์", employment: "สัญญาจ้างงาน",
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 text-white px-5 py-4">
        <p className="text-xs text-gray-400 mb-0.5">{typeLabel[contract.type] ?? contract.type}</p>
        <h2 className="text-lg font-semibold">{contract.contractNo}</h2>
      </div>
      <div className="divide-y divide-gray-100">
        <SummaryRow label={roles.partyA_label} value={contract.parties?.landlord?.fullName ?? "-"} />
        <SummaryRow label={roles.partyB_label} value={contract.parties?.tenant?.fullName   ?? "-"} />
        {contract.term?.startDate && (
          <SummaryRow label="ระยะเวลา" value={`${fmtDate(contract.term.startDate)} – ${fmtDate(contract.term.endDate)}`} />
        )}
        {contract.finance?.rentAmount && (
          <SummaryRow label="ค่าเช่า/เดือน" value={`${contract.finance.rentAmount.toLocaleString("th-TH")} บาท`} />
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-5 py-3 text-sm">
      <span className="w-44 flex-shrink-0 text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  )
}

// ─── Signing Card ─────────────────────────────────────────────────────────────

function SigningCard({
  title, name, stepLabel, onSignatureChange, onSubmit, canSubmit, loading,
}: {
  title: string; name: string; stepLabel: string
  onSignatureChange: (sig: string | null) => void
  onSubmit: () => void; canSubmit: boolean; loading: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{stepLabel}</span>
      </div>
      {name && <p className="text-sm text-gray-500 mb-4">{name}</p>}

      <SignaturePad onChange={onSignatureChange} />

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-4">
          🔐 การลงนามนี้ถือเป็นลายมือชื่ออิเล็กทรอนิกส์ตาม พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544
        </p>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-30 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="animate-spin inline-block">⟳</span> กำลังบันทึก...</>
          ) : (
            "✍️ ยืนยันลายเซ็น"
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Download Card ────────────────────────────────────────────────────────────

function DownloadCard({
  contractNo, onDownload, downloading,
}: { contractNo: string; onDownload: () => void; downloading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-green-400 p-6 text-center">
      <div className="text-5xl mb-3">✅</div>
      <h3 className="font-bold text-gray-900 text-lg mb-1">สัญญาลงนามครบถ้วนแล้ว</h3>
      <p className="text-sm text-gray-500 mb-5">คู่สัญญาทุกฝ่ายลงลายมือชื่อแล้ว กดดาวน์โหลด PDF เพื่อบันทึก</p>
      <button
        onClick={onDownload}
        disabled={downloading}
        className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-40 transition flex items-center justify-center gap-2 mx-auto"
      >
        {downloading ? (
          <><span className="animate-spin">⟳</span> กำลังสร้าง PDF...</>
        ) : (
          "⬇️ ดาวน์โหลด PDF"
        )}
      </button>
      <p className="text-xs text-gray-400 mt-3">{contractNo}.pdf</p>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft:             { label: "แบบร่าง",       cls: "bg-gray-100 text-gray-600" },
    pending_signature: { label: "รอลงนาม",        cls: "bg-amber-100 text-amber-700" },
    signed:            { label: "ลงนามแล้ว",      cls: "bg-green-100 text-green-700" },
    active:            { label: "ใช้งานอยู่",     cls: "bg-blue-100 text-blue-700" },
    terminated:        { label: "สิ้นสุดแล้ว",    cls: "bg-red-100 text-red-700" },
  }
  const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
}

function fmtDate(d: string | undefined) {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center"><div className="text-4xl mb-2 animate-pulse">✍️</div><p className="text-sm">กำลังโหลด...</p></div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm max-w-sm text-center">
        <p className="text-2xl mb-2">⚠️</p><p>{message}</p>
      </div>
    </div>
  )
}
