import { getAuth } from "firebase/auth"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"
const API_PATH = "/contracts"

async function authHeaders(): Promise<Record<string, string>> {
  const user = getAuth().currentUser
  if (!user) throw new Error("Not authenticated")
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    await getAuth().signOut()
    window.location.href = "/login"
    throw new Error("Unauthorized")
  }
  if (!res.ok) {
    let message = "Request failed"
    try {
      const err = await res.json()
      message = err.message || message
    } catch (_) {}
    throw new Error(message)
  }
  return res.json()
}

export async function getContracts() {
  const res = await fetch(`${API_BASE}${API_PATH}`, {
    headers: await authHeaders(),
  })
  return handleResponse(res)
}

export async function createContract(payload: unknown) {
  const res = await fetch(`${API_BASE}${API_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}
