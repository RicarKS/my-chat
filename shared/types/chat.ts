// Chat-specific types

export interface ChatCompletionRequest {
  conversation_id: string
  parent_id: string | null
  content: string
  model_config_id?: string
}

export interface ThreadMessage {
  message: import('./api').Message
  siblingCount: number
  siblingIndex: number
}

// Active branch path: maps parent_id (or 'root' for top-level) to active sibling index
export type ActivePath = Map<string | null, number>
