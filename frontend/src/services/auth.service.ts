// frontend/src/services/auth.service.ts

const API_BASE = import.meta.env.VITE_API_BASE_URL || ""

async function handleResponse(res: Response) {
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

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  return handleResponse(res)
}

export async function register(payload: {
  email: string
  password: string
  firstName: string
  lastName: string
}) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}
