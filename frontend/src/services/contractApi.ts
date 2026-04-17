import { getAuth } from "firebase/auth"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"

async function authHeaders(): Promise<Record<string, string>> {
  const user = getAuth().currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

// ─── Save signature to Firestore ──────────────────────────────────────────────

export async function saveSignature(
  contractId: string,
  signatureDataUrl: string,
  role: "landlord" | "tenant" | "employer" | "employee"
) {
  const res = await fetch(`${API_BASE}/contracts/${contractId}/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ signatureDataUrl, role }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? "Failed to save signature")
  }
  return res.json()
}

// ─── Download PDF as Blob → trigger browser download ─────────────────────────

export async function downloadContractPdf(contractId: string, contractNo: string) {
  const res = await fetch(`${API_BASE}/contracts/${contractId}/pdf`, {
    headers: await authHeaders(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(err.message ?? "Failed to generate PDF")
  }

  const blob  = await res.blob()
  const url   = URL.createObjectURL(blob)
  const link  = document.createElement("a")
  link.href   = url
  link.download = `Kontrax_${contractNo}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Get contract by ID ───────────────────────────────────────────────────────

export async function getContractById(contractId: string) {
  const res = await fetch(`${API_BASE}/contracts/${contractId}`, {
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch contract")
  return res.json()
}
