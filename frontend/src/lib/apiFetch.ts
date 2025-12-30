import { clearToken, getToken, isTokenExpired } from "./auth"

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken()
  const headers = new Headers(init.headers || {})

  headers.set("Content-Type", headers.get("Content-Type") || "application/json")

  if (token) {
    if (isTokenExpired(token)) {
      clearToken()
      throw new Error("TOKEN_EXPIRED")
    }
    headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(input, { ...init, headers })

  // ✅ If backend returns 401, auto logout
  if (res.status === 401) {
    clearToken()
    throw new Error("UNAUTHORIZED")
  }

  // robust parsing
  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.message || "Request failed")
  }

  return data
}
