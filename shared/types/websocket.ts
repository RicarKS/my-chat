// WebSocket event types

export type WsEvent =
  | { type: 'message:new'; payload: { message: import('./api').Message; conversation_id: string } }
  | { type: 'message:stream'; payload: { message_id: string; conversation_id: string; delta: string; done: boolean } }
  | { type: 'message:branch'; payload: { conversation_id: string; parent_id: string; message: import('./api').Message } }
  | { type: 'conversation:create'; payload: { conversation: import('./api').Conversation } }
  | { type: 'conversation:update'; payload: { conversation: import('./api').Conversation } }
  | { type: 'conversation:delete'; payload: { conversation_id: string } }
