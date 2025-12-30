export function getToken() {
  return localStorage.getItem("token")
}

export function setToken(token: string) {
  localStorage.setItem("token", token)
}

export function clearToken() {
  localStorage.removeItem("token")
}

// ✅ check JWT expiry (no extra libs)
export function isTokenExpired(token: string) {
  try {
    const payloadPart = token.split(".")[1]
    const payloadJson = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
    const payload = JSON.parse(payloadJson)
    if (!payload.exp) return false
    const now = Math.floor(Date.now() / 1000)
    return now >= payload.exp
  } catch {
    return true
  }
}

export function isAuthenticated() {
  const token = getToken()
  if (!token) return false
  if (isTokenExpired(token)) {
    clearToken()
    return false
  }
  return true
}
export function getUserFromToken(): { firstName?: string } | null {
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return null
  }
}
