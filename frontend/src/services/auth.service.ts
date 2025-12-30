// frontend/src/services/auth.service.ts

const API_BASE = import.meta.env.VITE_API_BASE_URL

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "Login failed")
  }

  return res.json()
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

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "Register failed")
  }

  return res.json()
}
