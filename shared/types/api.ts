// Shared API response types

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

export interface ApiError {
  code: string
  message: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
}

// Auth
export interface AuthUser {
  id: string
  username: string
  created_at: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

// Conversation
export interface Conversation {
  id: string
  user_id: string
  title: string
  system_prompt: string | null
  temperature: number
  top_p: number
  model_config_id: string | null
  created_at: string
  updated_at: string
}

// Message
export interface Message {
  id: string
  conversation_id: string
  parent_id: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  sibling_index: number
  model_name: string | null
  created_at: string
}

// Model Provider
export interface ModelProvider {
  id: string
  user_id: string | null
  name: string
  api_endpoint: string
  created_at: string
}

// Model Config (belongs to a provider)
export interface ModelConfig {
  id: string
  user_id: string | null
  provider_id: string
  name: string
  model_name: string
  is_default: boolean
  created_at: string
  // Denormalized from provider for display
  api_endpoint?: string
  provider_name?: string
}

// Available model from upstream API
export interface AvailableModel {
  id: string
  name?: string
}
