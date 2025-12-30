const API = "/api/contracts"

function getToken() {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getContracts() {
  const res = await fetch(API, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  if (!res.ok) {
    throw new Error("Failed to load contracts")
  }

  return res.json()
}

export async function createContract(payload: any) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  })

  if (res.status === 401) {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "Create contract failed")
  }

  return res.json()
}
