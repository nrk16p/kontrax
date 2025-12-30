// frontend/src/services/contracts.service.ts

const API_BASE = import.meta.env.VITE_API_BASE_URL || ""
const API_PATH = "/api/contracts"

/* -----------------------------
   Auth helper
------------------------------ */
function getToken() {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Not authenticated")
  return token
}

function logout() {
  localStorage.removeItem("token")
  window.location.href = "/login"
}

/* -----------------------------
   Response handler
------------------------------ */
async function handleAuthResponse(res: Response) {
  if (res.status === 401) {
    logout()
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

/* -----------------------------
   API calls
------------------------------ */
export async function getContracts() {
  const res = await fetch(`${API_BASE}${API_PATH}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })

  return handleAuthResponse(res)
}

export async function createContract(payload: any) {
  const res = await fetch(`${API_BASE}${API_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  })

  return handleAuthResponse(res)
}
