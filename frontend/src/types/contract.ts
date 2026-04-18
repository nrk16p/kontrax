export interface TemplateField {
  key:          string
  label:        string
  type:         'text' | 'email' | 'number' | 'phone' | 'date' | 'textarea' | 'select'
  group?:       string
  required?:    boolean
  placeholder?: string
  hint?:        string
  options?:     string[]
}

export interface ContractTemplate {
  id:           string
  name:         string
  category:     string
  description?: string
  fields:       TemplateField[]
  createdAt?:   string
  updatedAt?:   string
}

export interface ContractFormData {
  templateId:   string
  fieldValues:  Record<string, string>
  consentGiven?: boolean
}

export interface ApiResponse<T> {
  data?:    T
  error?:   string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page:  number
  limit: number
}
