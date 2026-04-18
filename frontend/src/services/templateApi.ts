import { getAuth } from 'firebase/auth';
import type { ContractTemplate, ContractFormData, ApiResponse, PaginatedResponse } from '../types/contract';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

// ─── Helper: get Firebase ID token ───────────────────────────────────────────

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = getAuth().currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options?.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json;
}

// ─── Template API ─────────────────────────────────────────────────────────────

export const templateApi = {
  /** List all active templates, optionally filtered by category */
  list: (category?: string) => {
    const params = category ? `?category=${category}` : '';
    return apiFetch<ContractTemplate[]>(`/templates${params}`);
  },

  /** Get a single template with all its fields */
  getById: (id: string) =>
    apiFetch<ContractTemplate>(`/templates/${id}`),

  /** Save the user's in-progress form as a draft (requires PDPA consent) */
  saveDraft: (data: ContractFormData & { consentGiven: boolean }) =>
    apiFetch<{ id: string }>('/templates/drafts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Get all drafts for the current user */
  getMyDrafts: () =>
    apiFetch<PaginatedResponse<ContractFormData>>('/templates/drafts/mine'),
};
