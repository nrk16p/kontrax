// frontend/src/services/auth.service.ts

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
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
  const res = await fetch("/api/auth/register", {
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
